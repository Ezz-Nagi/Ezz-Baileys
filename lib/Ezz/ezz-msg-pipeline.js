import { isEzzEnabled } from './ezz-config.js';
/**
 * Ezz Message Pipeline — hooks de librería antes/después de procesar nodos.
 * Permite middleware interno sin lógica de comandos de bot.
 */

const preDecryptHooks = new Set();
const postDecryptHooks = new Set();
const preEncodeHooks = new Set();

export function ezzOnPreDecrypt(fn) {
  if (typeof fn === 'function') preDecryptHooks.add(fn);
  return () => preDecryptHooks.delete(fn);
}

export function ezzOnPostDecrypt(fn) {
  if (typeof fn === 'function') postDecryptHooks.add(fn);
  return () => postDecryptHooks.delete(fn);
}

export function ezzOnPreEncode(fn) {
  if (typeof fn === 'function') preEncodeHooks.add(fn);
  return () => preEncodeHooks.delete(fn);
}

export async function ezzRunPreDecrypt(stanza, ctx = {}) {
  if (!isEzzEnabled('pipeline')) return;
  for (const fn of preDecryptHooks) {
    try { await fn(stanza, ctx); } catch {}
  }
}

export async function ezzRunPostDecrypt(message, ctx = {}) {
  if (!isEzzEnabled('pipeline')) return;
  for (const fn of postDecryptHooks) {
    try { await fn(message, ctx); } catch {}
  }
}

export async function ezzRunPreEncode(content, ctx = {}) {
  if (!isEzzEnabled('pipeline')) return content;
  let out = content;
  for (const fn of preEncodeHooks) {
    try {
      const r = await fn(out, ctx);
      if (r !== undefined) out = r;
    } catch {}
  }
  return out;
}

export function ezzClearPipeline() {
  preDecryptHooks.clear();
  postDecryptHooks.clear();
  preEncodeHooks.clear();
}

export default {
  ezzOnPreDecrypt,
  ezzOnPostDecrypt,
  ezzOnPreEncode,
  ezzRunPreDecrypt,
  ezzRunPostDecrypt,
  ezzRunPreEncode,
  ezzClearPipeline,
};
