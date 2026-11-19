/**
 * Ezz Sec — utilidades de ciberseguridad ofensivas-defensivas para la librería.
 * No es un scanner de terceros; protege el proceso del bot.
 */

import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import { isEzzEnabled } from './ezz-config.js';

/** Redacta campos sensibles de objetos antes de loguear */
export function ezzRedactSecrets(obj, depth = 0) {
  if (obj == null || depth > 6) return obj;
  if (typeof obj !== 'object') return obj;
  if (Buffer.isBuffer(obj) || obj instanceof Uint8Array) {
    return `<bytes:${obj.length}>`;
  }
  if (Array.isArray(obj)) return obj.map((x) => ezzRedactSecrets(x, depth + 1));
  const sensitive =
    /pass|secret|token|key|cred|auth|cookie|session|private|noise|identity|advSecret/i;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (sensitive.test(k)) out[k] = typeof v === 'string' ? `<redacted:${v.length}>` : '<redacted>';
    else out[k] = ezzRedactSecrets(v, depth + 1);
  }
  return out;
}

/** Hash estable de un buffer/string (auditoría, no almacena secreto) */
export function ezzFingerprint(data) {
  const buf = Buffer.isBuffer(data) ? data : Buffer.from(String(data));
  return createHash('sha256').update(buf).digest('hex').slice(0, 16);
}

/** Comparación en tiempo constante de dos strings */
export function ezzSafeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  try {
    return timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

/** Nonce / id aleatorio seguro */
export function ezzRandomId(bytes = 16) {
  return randomBytes(bytes).toString('hex');
}

/**
 * Detector simple de ráfagas (posible flood hacia el bot).
 * createEzzFloodGuard({ max: 30, windowMs: 10000 })
 */
export function createEzzFloodGuard(options = {}) {
  const max = options.max ?? 40;
  const windowMs = options.windowMs ?? 10_000;
  /** @type {Map<string, number[]>} */
  const hits = new Map();

  return {
    /** @returns {boolean} true si permitido */
    check(key = 'global') {
      const now = Date.now();
      const arr = (hits.get(key) || []).filter((t) => now - t < windowMs);
      arr.push(now);
      hits.set(key, arr);
      return arr.length <= max;
    },
    reset(key) {
      if (key) hits.delete(key);
      else hits.clear();
    },
  };
}

/**
 * Valida que un JID tenga forma razonable (anti-inyección en logs/paths).
 */
export function ezzAssertJid(jid) {
  const s = String(jid || '');
  if (!/^[a-zA-Z0-9._\-]+@[a-zA-Z0-9.\-]+$/.test(s) && !/^\d+@lid$/.test(s)) {
    const err = new Error('Ezz Sec: JID inválido');
    err.code = 'EZZ_BAD_JID';
    throw err;
  }
  return s;
}

/** Aviso de sesión: permisos recomendados (no modifica archivos) */
export function ezzSessionHardeningTips() {
  return [
    'Guarda creds.json / session fuera de repos públicos',
    'Permisos 600 en archivos de sesión cuando el OS lo permita',
    'No loguees authState.creds ni keys Signal',
    'Activa ezz-hardening en listeners de messages.upsert',
    'Cipher opt-in solo en entornos de análisis (TTL 10s memoria)',
  ];
}

export function ezzSecEnabled(sock) {
  return isEzzEnabled('errorHook', sock) || process.env.EZZ_SEC === '1';
}

export default {
  ezzRedactSecrets,
  ezzFingerprint,
  ezzSafeEqual,
  ezzRandomId,
  createEzzFloodGuard,
  ezzAssertJid,
  ezzSessionHardeningTips,
  ezzSecEnabled,
};
