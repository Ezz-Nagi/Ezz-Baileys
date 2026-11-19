/**
 * Ezz Anti-Delete — almacena mensajes en memoria para recuperar contenido si hay revoke.
 * El bot debe registrar upserts y consultar en messages.update / protocol REVOKE.
 */

import { ezzMessageKeyId } from './ezz-dedupe.js';

export function createEzzMessageStore(options = {}) {
  const maxPerChat = options.maxPerChat || 800;
  const maxTotal = options.maxTotal || 20000;
  const ttlMs = options.ttlMs || 24 * 60 * 60 * 1000;
  /** @type {Map<string, { at: number, msg: any }>} */
  const byKey = new Map();
  /** @type {Map<string, string[]>} */
  const byChat = new Map();

  function pruneKey(id) {
    const ent = byKey.get(id);
    if (!ent) return;
    byKey.delete(id);
    const jid = ent.msg?.key?.remoteJid;
    if (jid && byChat.has(jid)) {
      byChat.set(
        jid,
        byChat.get(jid).filter((k) => k !== id),
      );
    }
  }

  function pruneExpired() {
    const now = Date.now();
    for (const [id, ent] of byKey) {
      if (now - ent.at > ttlMs) pruneKey(id);
    }
    while (byKey.size > maxTotal) {
      const first = byKey.keys().next().value;
      if (first == null) break;
      pruneKey(first);
    }
  }

  return {
    put(msg) {
      if (!msg?.key?.id) return;
      const id = ezzMessageKeyId(msg.key);
      const jid = msg.key.remoteJid || 'unknown';
      byKey.set(id, { at: Date.now(), msg });
      const list = byChat.get(jid) || [];
      list.push(id);
      while (list.length > maxPerChat) {
        const old = list.shift();
        if (old) byKey.delete(old);
      }
      byChat.set(jid, list);
      pruneExpired();
    },
    get(key) {
      const id = ezzMessageKeyId(key);
      const ent = byKey.get(id);
      if (!ent) return null;
      if (Date.now() - ent.at > ttlMs) {
        pruneKey(id);
        return null;
      }
      return ent.msg;
    },
    delete(key) {
      pruneKey(ezzMessageKeyId(key));
    },
    size() {
      return byKey.size;
    },
    clear() {
      byKey.clear();
      byChat.clear();
    },
  };
}

/**
 * Handler listo para sock.ev.on('messages.upsert', ...)
 */
export function ezzCreateStoreUpsertHandler(store) {
  return (upsert) => {
    const list = upsert?.messages || [];
    for (const m of list) {
      try {
        store.put(m);
      } catch {}
    }
  };
}

/**
 * Intenta recuperar mensaje cuando llega un revoke (delete for everyone).
 * Devuelve el mensaje cacheado o null.
 */
export function ezzRecoverDeleted(store, key) {
  if (!store || !key) return null;
  return store.get(key);
}

export default {
  createEzzMessageStore,
  ezzCreateStoreUpsertHandler,
  ezzRecoverDeleted,
};
