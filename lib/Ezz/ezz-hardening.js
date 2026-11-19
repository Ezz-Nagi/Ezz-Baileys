/**
 * Ezz Hardening — resiliencia de librería.
 * Tolera stanzas/mensajes mal formados sin tumbar el proceso del bot.
 * No incluye payloads ofensivos ni "bugs" de cliente.
 */

/** Ejecuta fn; si falla devuelve fallback y no propaga. */
export function ezzSafe(fn, fallback = undefined) {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

/** Igual que ezzSafe pero async. */
export async function ezzSafeAsync(fn, fallback = undefined) {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

/**
 * Normaliza un objeto tipo mensaje/key sin lanzar.
 * Útil antes de tocar msg.key / msg.message en handlers del bot.
 */
export function ezzSanitizeMessage(msg) {
  if (!msg || typeof msg !== 'object') return null;
  const key = msg.key && typeof msg.key === 'object' ? msg.key : {};
  return {
    ...msg,
    key: {
      remoteJid: typeof key.remoteJid === 'string' ? key.remoteJid : undefined,
      id: typeof key.id === 'string' ? key.id : undefined,
      fromMe: Boolean(key.fromMe),
      participant: typeof key.participant === 'string' ? key.participant : undefined,
      remoteJidAlt: typeof key.remoteJidAlt === 'string' ? key.remoteJidAlt : undefined,
      participantAlt: typeof key.participantAlt === 'string' ? key.participantAlt : undefined,
    },
    message: msg.message && typeof msg.message === 'object' ? msg.message : null,
    messageTimestamp: msg.messageTimestamp,
    pushName: typeof msg.pushName === 'string' ? msg.pushName : undefined,
  };
}

/**
 * Envuelve un listener de eventos para que un throw no mate el process.
 * Ejemplo: sock.ev.on('messages.upsert', ezzHardenListener(handler))
 */
export function ezzHardenListener(handler, onError) {
  return (...args) => {
    try {
      const r = handler(...args);
      if (r && typeof r.then === 'function') {
        return r.catch((err) => {
          if (typeof onError === 'function') onError(err, args);
        });
      }
      return r;
    } catch (err) {
      if (typeof onError === 'function') onError(err, args);
    }
  };
}

/**
 * Valida que un content de sendMessage sea objeto plano usable.
 * No modifica el protocolo; solo evita envíos claramente rotos.
 */
export function ezzIsSendableContent(content) {
  return Boolean(content && typeof content === 'object' && !Array.isArray(content));
}

/**
 * Deep-get sin throw: ezzGet(msg, 'message.conversation', '')
 */
export function ezzGet(obj, path, fallback = undefined) {
  try {
    const parts = String(path).split('.');
    let cur = obj;
    for (const p of parts) {
      if (cur == null) return fallback;
      cur = cur[p];
    }
    return cur === undefined ? fallback : cur;
  } catch {
    return fallback;
  }
}

export default {
  ezzSafe,
  ezzSafeAsync,
  ezzSanitizeMessage,
  ezzHardenListener,
  ezzIsSendableContent,
  ezzGet,
};
