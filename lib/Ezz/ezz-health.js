/**
 * Ezz Health — estado real del socket (OPEN únicamente).
 */
import { ezzGetReadyState } from './ezz-socket-guard.js';

export function ezzSocketHealth(sock) {
  const readyState = ezzGetReadyState(sock);
  const wsOpen = readyState === 1;
  return {
    hasUser: Boolean(sock?.user?.id),
    user: sock?.user || null,
    wsReadyState: readyState,
    wsOpen,
    isOpen: wsOpen,
    timestamp: Date.now(),
  };
}

/** true solo si el WebSocket está OPEN (1), nunca en CONNECTING */
export function ezzIsSocketOpen(sock) {
  return ezzSocketHealth(sock).wsOpen === true;
}

export function ezzHasSessionUser(sock) {
  return Boolean(sock?.user?.id);
}

export default { ezzSocketHealth, ezzIsSocketOpen, ezzHasSessionUser };
