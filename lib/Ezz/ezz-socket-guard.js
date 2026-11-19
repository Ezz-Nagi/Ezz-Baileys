/**
 * Ezz Socket Guard — bloquea query/send si el WS no está OPEN.
 * Soporta ws crudo (readyState) y WebSocketClient de Baileys (isOpen / .socket).
 */

import { isEzzEnabled } from './ezz-config.js';

const GUARDED = Symbol('ezzSocketGuarded');

/** 0 CONNECTING · 1 OPEN · 2 CLOSING · 3 CLOSED · null desconocido */
export function ezzGetReadyState(sock) {
  const ws = sock?.ws;
  if (!ws) return null;
  if (typeof ws.readyState === 'number') return ws.readyState;
  if (ws.socket && typeof ws.socket.readyState === 'number') return ws.socket.readyState;
  if (typeof ws.isOpen === 'boolean') {
    if (ws.isOpen) return 1;
    if (ws.isConnecting) return 0;
    if (ws.isClosing) return 2;
    if (ws.isClosed) return 3;
    return 3;
  }
  return null;
}

export function ezzAssertSocket(sock, action = 'operation') {
  if (!sock) {
    const err = new Error(`Ezz Baileys: socket missing for ${action}`);
    err.code = 'EZZ_NO_SOCKET';
    throw err;
  }
  const rs = ezzGetReadyState(sock);
  // ÚNICAMENTE OPEN (1). CONNECTING (0) también se bloquea.
  if (rs !== 1) {
    const err = new Error(
      `Ezz Baileys: websocket not open (readyState=${rs ?? 'none'}) for ${action}`
    );
    err.code = 'EZZ_WS_CLOSED';
    err.retryable = rs === 0;
    throw err;
  }
  return true;
}

function markGuarded(sock, key) {
  sock[GUARDED] = { ...(sock[GUARDED] || {}), [key]: true };
}

export function ezzWrapQuery(sock) {
  if (!sock?.query || sock[GUARDED]?.query) return sock;
  const original = sock.query.bind(sock);
  sock.query = async (node, timeoutMs) => {
    ezzAssertSocket(sock, 'query');
    return original(node, timeoutMs);
  };
  markGuarded(sock, 'query');
  return sock;
}

export function ezzWrapSendRaw(sock) {
  if (sock[GUARDED]?.sendRaw) return sock;
  if (typeof sock.sendRawMessage === 'function') {
    const original = sock.sendRawMessage.bind(sock);
    sock.sendRawMessage = async (...args) => {
      ezzAssertSocket(sock, 'sendRawMessage');
      return original(...args);
    };
  }
  if (typeof sock.sendNode === 'function') {
    const original = sock.sendNode.bind(sock);
    sock.sendNode = async (...args) => {
      ezzAssertSocket(sock, 'sendNode');
      return original(...args);
    };
  }
  markGuarded(sock, 'sendRaw');
  return sock;
}

/** También protege sendMessage / relayMessage (lo que usan los bots) */
export function ezzWrapSendMessage(sock) {
  if (sock[GUARDED]?.sendMessage) return sock;
  if (typeof sock.sendMessage === 'function') {
    const original = sock.sendMessage.bind(sock);
    sock.sendMessage = async (...args) => {
      ezzAssertSocket(sock, 'sendMessage');
      return original(...args);
    };
  }
  if (typeof sock.relayMessage === 'function') {
    const original = sock.relayMessage.bind(sock);
    sock.relayMessage = async (...args) => {
      ezzAssertSocket(sock, 'relayMessage');
      return original(...args);
    };
  }
  markGuarded(sock, 'sendMessage');
  return sock;
}

export function ezzGuardSocket(sock, flags) {
  const on =
    flags && typeof flags === 'object'
      ? Boolean(flags.socketGuard)
      : isEzzEnabled('socketGuard', sock);
  if (!on) return sock;
  ezzWrapQuery(sock);
  ezzWrapSendRaw(sock);
  ezzWrapSendMessage(sock);
  return sock;
}

export default {
  ezzGetReadyState,
  ezzAssertSocket,
  ezzWrapQuery,
  ezzWrapSendRaw,
  ezzWrapSendMessage,
  ezzGuardSocket,
};
