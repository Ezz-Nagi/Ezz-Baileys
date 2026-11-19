/**
 * Ezz Dedupe — evita procesar el mismo message key dos veces (retries / history).
 * Librería pura; el bot/caller decide usarlo.
 */

export function ezzMessageKeyId(key = {}) {
  const remote = key.remoteJid || key.remoteJidAlt || '';
  const id = key.id || '';
  const fromMe = key.fromMe ? '1' : '0';
  const participant = key.participant || '';
  return `${remote}|${fromMe}|${id}|${participant}`;
}

export function createEzzDedupe(options = {}) {
  const maxSize = options.maxSize || 5000;
  const seen = new Map();

  function prune() {
    if (seen.size <= maxSize) return;
    const overflow = seen.size - maxSize;
    let i = 0;
    for (const k of seen.keys()) {
      seen.delete(k);
      if (++i >= overflow) break;
    }
  }

  return {
    seen(key) {
      const id = ezzMessageKeyId(key);
      if (!id || id === '|||') return false;
      if (seen.has(id)) return true;
      seen.set(id, Date.now());
      prune();
      return false;
    },
    forget(key) {
      seen.delete(ezzMessageKeyId(key));
    },
    clear() {
      seen.clear();
    },
    size() {
      return seen.size;
    },
  };
}

export default { ezzMessageKeyId, createEzzDedupe };
