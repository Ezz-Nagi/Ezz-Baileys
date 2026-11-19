/**
 * Ezz Reconnect Policy — política de reconexión (opt-in vía enableEzzModules).
 * No importa Types/ para poder cargarse sin node_modules resueltos en análisis estático.
 */

// Códigos alineados con DisconnectReason de Baileys
const DisconnectReason = {
  connectionClosed: 428,
  connectionLost: 408,
  connectionReplaced: 440,
  timedOut: 408,
  loggedOut: 401,
  badSession: 500,
  restartRequired: 515,
  multideviceMismatch: 411,
};

const RECOVERABLE = new Set([
  DisconnectReason.connectionClosed,
  DisconnectReason.connectionLost,
  DisconnectReason.connectionReplaced,
  DisconnectReason.timedOut,
  DisconnectReason.restartRequired,
]);

const FATAL = new Set([
  DisconnectReason.loggedOut,
  DisconnectReason.badSession,
  DisconnectReason.multideviceMismatch,
]);

export function ezzShouldReconnect(lastDisconnect) {
  const code =
    lastDisconnect?.error?.output?.statusCode ??
    lastDisconnect?.error?.statusCode ??
    lastDisconnect?.statusCode;
  if (code == null) return true;
  if (FATAL.has(code)) return false;
  if (RECOVERABLE.has(code)) return true;
  if ([408, 440, 500, 503].includes(code)) return true;
  return code !== DisconnectReason.loggedOut;
}

export function ezzReconnectDelay(attempt, options = {}) {
  const base = options.baseMs ?? 1000;
  const max = options.maxMs ?? 60_000;
  const factor = options.factor ?? 1.6;
  const jitter = options.jitter ?? 0.25;
  let ms = Math.min(max, Math.floor(base * Math.pow(factor, Math.max(0, attempt))));
  const j = ms * jitter * (Math.random() * 2 - 1);
  return Math.max(200, Math.floor(ms + j));
}

export function ezzClassifyDisconnect(lastDisconnect) {
  const code =
    lastDisconnect?.error?.output?.statusCode ??
    lastDisconnect?.error?.statusCode ??
    null;
  return {
    code,
    recoverable: ezzShouldReconnect(lastDisconnect),
    fatal: code != null && FATAL.has(code),
    reason: lastDisconnect?.error?.message || null,
  };
}

export default {
  ezzShouldReconnect,
  ezzReconnectDelay,
  ezzClassifyDisconnect,
};
