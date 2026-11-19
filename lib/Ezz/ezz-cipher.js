/**
 * Ezz Cipher — captura COMPLETA del sobre wire ANTES del decrypt de Baileys.
 *
 * Incluye (mensaje, no sesión del bot):
 *  - attrs del stanza completo
 *  - todos los hijos recursivos (enc, plaintext, device-identity, devices, …)
 *  - ciphertext / firmas / certificados en base64 tal cual llegan
 *  - type de enc: pkmsg | msg | skmsg
 *
 * NO incluye / NO lee:
 *  - creds de sesión (noiseKey, signedIdentityKey, advSecretKey, signal store)
 *
 * Memoria 10s. Opt-in: ezz: { cipher: true } | EZZ_CIPHER=1
 */

import { isEzzEnabled } from './ezz-config.js';

const TTL_MS = 10_000;
/** @type {Map<string, { at: number, envelope: object }>} */
const memoryStore = new Map();
const listeners = new Set();

function cipherActive(options = {}) {
  if (options.enabled === true) return true;
  if (options.storeOptions?.enabled === true) return true;
  if (process.env.EZZ_CIPHER === '1') return true;
  return isEzzEnabled('cipher');
}

function purgeExpired() {
  const now = Date.now();
  for (const [id, ent] of memoryStore) {
    if (now - ent.at > TTL_MS) memoryStore.delete(id);
  }
}

function toB64(content) {
  if (content == null) return null;
  if (Buffer.isBuffer(content)) return content.toString('base64');
  if (content instanceof Uint8Array) return Buffer.from(content).toString('base64');
  if (typeof content === 'string') {
    // binary-looking strings still as utf8 b64 for round-trip
    return Buffer.from(content, 'utf8').toString('base64');
  }
  return null;
}

function byteLen(content) {
  if (content == null) return 0;
  if (Buffer.isBuffer(content) || content instanceof Uint8Array) return content.length;
  if (typeof content === 'string') return Buffer.byteLength(content);
  return 0;
}

/** Serializa un nodo binario WA completo (recursivo). */
function serializeNode(node) {
  if (node == null) return null;
  if (typeof node === 'string' || typeof node === 'number' || typeof node === 'boolean') {
    return { kind: 'primitive', value: node };
  }
  if (Buffer.isBuffer(node) || node instanceof Uint8Array) {
    return {
      kind: 'bytes',
      encoding: 'base64',
      data: toB64(node),
      bytes: byteLen(node),
    };
  }
  if (Array.isArray(node)) {
    return node.map((n) => serializeNode(n));
  }
  if (typeof node === 'object') {
    const tag = node.tag;
    const attrs = node.attrs ? { ...node.attrs } : {};
    const content = node.content;
    const out = {
      kind: 'node',
      tag: tag || null,
      attrs,
    };
    if (content === undefined || content === null) {
      out.content = null;
    } else if (Array.isArray(content)) {
      out.content = content.map((c) => serializeNode(c));
    } else if (Buffer.isBuffer(content) || content instanceof Uint8Array) {
      out.content = {
        kind: 'bytes',
        encoding: 'base64',
        data: toB64(content),
        bytes: byteLen(content),
      };
    } else if (typeof content === 'object' && content.tag) {
      out.content = serializeNode(content);
    } else {
      out.content = serializeNode(content);
    }
    return out;
  }
  return { kind: 'unknown', value: String(node) };
}

/** Resumen de capas E2E para análisis rápido (view-once, retry, etc.) */
function extractEncryptedParts(stanza) {
  const parts = [];
  const walk = (node, path = []) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      node.forEach((n, i) => walk(n, path.concat(i)));
      return;
    }
    const tag = node.tag;
    const attrs = node.attrs || {};
    const content = node.content;
    if (tag === 'enc' || tag === 'plaintext') {
      parts.push({
        path: path.join('.'),
        tag,
        /** tipo Signal en wire */
        encType: attrs.type || (tag === 'plaintext' ? 'plaintext' : null),
        v: attrs.v ?? null,
        count: attrs.count != null ? Number(attrs.count) : null,
        /** cuerpo cifrado / plaintext bytes */
        ciphertextB64: Buffer.isBuffer(content) || content instanceof Uint8Array ? toB64(content) : toB64(content),
        bytes: byteLen(content),
        attrs: { ...attrs },
      });
    }
    if (tag === 'device-identity' || tag === 'device_identity') {
      parts.push({
        path: path.join('.'),
        tag: 'device-identity',
        /** certificado / firma de identidad de dispositivo en el mensaje */
        deviceIdentityB64: toB64(content),
        bytes: byteLen(content),
        attrs: { ...attrs },
        role: 'device-signature-or-cert',
      });
    }
    if (Array.isArray(content)) walk(content, path.concat(tag || 'content'));
    else if (content && typeof content === 'object' && content.tag) walk(content, path.concat(tag || 'content'));
  };
  walk(stanza);
  return parts;
}

export function captureEnvelope(stanza, extra = {}) {
  const attrs = stanza?.attrs || {};
  const encryptedParts = extractEncryptedParts(stanza);
  const fullTree = serializeNode(stanza);

  return {
    capturedAt: Date.now(),
    expiresAt: Date.now() + TTL_MS,
    source: 'pre-decrypt-wire',
    phase: 'before-baileys-signal-decrypt',
    tag: stanza?.tag || 'message',
    attrs: { ...attrs },
    messageKeyHint: {
      remoteJid: attrs.from || null,
      id: attrs.id || null,
      participant: attrs.participant || null,
      recipient: attrs.recipient || null,
      t: attrs.t || null,
      type: attrs.type || null,
      category: attrs.category || null,
    },
    /** Lista rápida: enc + device-identity */
    encryptedParts,
    /** Árbol completo del stanza (todo el XML binario serializado) */
    fullStanza: fullTree,
    hasPkmsg: encryptedParts.some((p) => p.encType === 'pkmsg'),
    hasSkmsg: encryptedParts.some((p) => p.encType === 'skmsg'),
    hasMsg: encryptedParts.some((p) => p.encType === 'msg'),
    hasDeviceIdentity: encryptedParts.some((p) => p.tag === 'device-identity'),
    ...extra,
  };
}

function storeKey(envelope) {
  const id = envelope?.attrs?.id || envelope?.messageKeyHint?.id || `${Date.now()}`;
  const from = envelope?.attrs?.from || 'unknown';
  return `${from}_${id}_${envelope.capturedAt}`;
}

export function ezzCaptureBeforeDecrypt(stanza, options = {}) {
  if (!cipherActive(options)) return null;
  try {
    purgeExpired();
    const envelope = captureEnvelope(stanza, {
      note: 'Sobre completo pre-decrypt; sin creds de sesión del bot.',
    });
    const key = storeKey(envelope);
    memoryStore.set(key, { at: Date.now(), envelope });
    const t = setTimeout(() => memoryStore.delete(key), TTL_MS);
    if (t.unref) t.unref();
    for (const fn of listeners) {
      try {
        fn(envelope);
      } catch {}
    }
    return envelope;
  } catch {
    return null;
  }
}


/**
 * Post-decrypt: adjunta messageSecret y metadatos del mensaje ya descifrado
 * (sin creds de sesión). Mismo TTL 10s; fusiona con captura pre-decrypt por id.
 */
export function ezzCaptureAfterDecrypt(fullMessage, options = {}) {
  if (!cipherActive(options)) return null;
  try {
    purgeExpired();
    const keyInfo = fullMessage?.key || {};
    const msg = fullMessage?.message || {};
    const ctx =
      msg.messageContextInfo ||
      msg.extendedTextMessage?.contextInfo ||
      msg.imageMessage?.contextInfo ||
      msg.videoMessage?.contextInfo ||
      msg.documentMessage?.contextInfo ||
      {};
    // messageSecret puede venir como Buffer / Uint8Array / base64
    let secret = ctx.messageSecret || msg.messageSecret || null;
    let secretB64 = null;
    if (secret) {
      if (Buffer.isBuffer(secret) || secret instanceof Uint8Array) secretB64 = Buffer.from(secret).toString('base64');
      else if (typeof secret === 'string') secretB64 = secret;
      else if (secret.type === 'Buffer' && Array.isArray(secret.data)) secretB64 = Buffer.from(secret.data).toString('base64');
    }
    const id = keyInfo.id || null;
    const remoteJid = keyInfo.remoteJid || null;
    // fusionar con captura previa si existe
    let prev = id ? ezzGetCipherCapture(id) : null;
    const post = {
      capturedAt: Date.now(),
      expiresAt: Date.now() + TTL_MS,
      phase: 'post-decrypt',
      messageKey: {
        remoteJid,
        id,
        participant: keyInfo.participant || null,
        fromMe: keyInfo.fromMe ?? null,
      },
      messageSecretB64: secretB64,
      hasMessageSecret: Boolean(secretB64),
      messageTypes: msg && typeof msg === 'object' ? Object.keys(msg).filter((k) => msg[k] != null) : [],
      isViewOnce: Boolean(keyInfo.isViewOnce || msg.viewOnceMessage || msg.viewOnceMessageV2 || msg.viewOnceMessageV2Extension),
    };
    const envelope = prev
      ? { ...prev, postDecrypt: post, hasMessageSecret: post.hasMessageSecret, messageSecretB64: secretB64 }
      : {
          capturedAt: post.capturedAt,
          expiresAt: post.expiresAt,
          source: 'post-decrypt-only',
          messageKeyHint: { remoteJid, id, participant: keyInfo.participant || null },
          attrs: { id, from: remoteJid },
          encryptedParts: [],
          postDecrypt: post,
          hasMessageSecret: post.hasMessageSecret,
          messageSecretB64: secretB64,
        };
    const sk = `${remoteJid || 'unknown'}_${id || Date.now()}_${envelope.capturedAt}`;
    memoryStore.set(sk, { at: Date.now(), envelope });
    // también actualizar otras entradas con mismo id
    if (id) {
      for (const [k, ent] of memoryStore) {
        if (ent.envelope?.attrs?.id === id || ent.envelope?.messageKeyHint?.id === id) {
          ent.envelope = { ...ent.envelope, postDecrypt: post, hasMessageSecret: post.hasMessageSecret, messageSecretB64: secretB64 };
        }
      }
    }
    const timer = setTimeout(() => memoryStore.delete(sk), TTL_MS);
    if (timer.unref) timer.unref();
    for (const fn of listeners) {
      try { fn(envelope); } catch {}
    }
    return envelope;
  } catch {
    return null;
  }
}

export function ezzListCipherCaptures() {
  purgeExpired();
  return [...memoryStore.values()].map((e) => e.envelope);
}

export function ezzGetCipherCapture(messageId) {
  purgeExpired();
  if (!messageId) return null;
  for (const { envelope } of memoryStore.values()) {
    if (envelope?.attrs?.id === messageId || envelope?.messageKeyHint?.id === messageId) {
      return envelope;
    }
  }
  return null;
}

export function ezzClearCipherCaptures() {
  memoryStore.clear();
}

export function ezzOnCipherCapture(fn) {
  if (typeof fn !== 'function') return () => {};
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function ezzCipherTtlMs() {
  return TTL_MS;
}

export function openEzzKeyWindow() {
  return {
    ok: false,
    reason: 'disabled',
    message:
      'No se exponen creds de sesión. El cipher captura el sobre del mensaje (enc + device-identity) 10s en memoria.',
  };
}
export function readEzzKeyWindow() {
  return null;
}
export function closeEzzKeyWindow() {
  return { ok: true };
}

export class EzzCipherStore {
  captureAndSave(stanza, extra) {
    return ezzCaptureBeforeDecrypt(stanza, { enabled: true, ...extra });
  }
  list() {
    return ezzListCipherCaptures();
  }
}
export function getEzzCipherStore() {
  return new EzzCipherStore();
}

export default {
  captureEnvelope,
  ezzCaptureBeforeDecrypt,
  ezzCaptureAfterDecrypt,
  ezzListCipherCaptures,
  ezzGetCipherCapture,
  ezzClearCipherCaptures,
  ezzOnCipherCapture,
  ezzCipherTtlMs,
  openEzzKeyWindow,
  readEzzKeyWindow,
  closeEzzKeyWindow,
  EzzCipherStore,
  getEzzCipherStore,
};
