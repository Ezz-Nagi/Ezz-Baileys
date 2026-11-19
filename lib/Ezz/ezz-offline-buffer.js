/**
 * Ezz Offline Buffer — cola temporal de nodos mientras el socket no está listo (opt-in).
 */

import { isEzzEnabled } from './ezz-config.js';

const buffer = [];
let maxSize = 500;

export function ezzConfigureOfflineBuffer(options = {}) {
  if (typeof options.maxSize === 'number') maxSize = options.maxSize;
}

export function ezzOfflinePush(node) {
  if (!isEzzEnabled('offlineBuffer')) return false;
  if (buffer.length >= maxSize) buffer.shift();
  buffer.push({ node, at: Date.now() });
  return true;
}

export function ezzOfflineDrain(handler) {
  if (!isEzzEnabled('offlineBuffer')) {
    buffer.length = 0;
    return 0;
  }
  let n = 0;
  while (buffer.length) {
    const item = buffer.shift();
    try { handler(item.node, item); } catch {}
    n++;
  }
  return n;
}

export function ezzOfflineSize() {
  return buffer.length;
}

export function ezzOfflineClear() {
  buffer.length = 0;
}

export default {
  ezzConfigureOfflineBuffer,
  ezzOfflinePush,
  ezzOfflineDrain,
  ezzOfflineSize,
  ezzOfflineClear,
};
