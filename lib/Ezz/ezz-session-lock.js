/**
 * Ezz Session Lock — mutex por dirección Signal (opt-in).
 * Evita carreras encrypt/decrypt sobre la misma sesión.
 */

import { isEzzEnabled } from './ezz-config.js';

const locks = new Map();

function getLock(key) {
  let entry = locks.get(key);
  if (!entry) {
    entry = { queue: Promise.resolve(), ref: 0 };
    locks.set(key, entry);
  }
  return entry;
}

export async function ezzWithSessionLock(key, task) {
  if (!isEzzEnabled('sessionLock')) {
    return task();
  }
  const k = String(key || 'default');
  const entry = getLock(k);
  entry.ref++;
  const prev = entry.queue;
  let release;
  entry.queue = new Promise((r) => { release = r; });
  await prev;
  try {
    return await task();
  } finally {
    release();
    entry.ref--;
    if (entry.ref <= 0 && locks.get(k) === entry) locks.delete(k);
  }
}

export default { ezzWithSessionLock };
