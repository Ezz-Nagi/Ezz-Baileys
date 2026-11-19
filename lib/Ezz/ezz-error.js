/**
 * Ezz Error — manejo estructurado de errores para Ezz Baileys
 */

export class EzzError extends Error {
  constructor(code, message, options = {}) {
    super(message);
    this.name = 'EzzError';
    this.code = code;
    this.statusCode = options.statusCode ?? null;
    this.cause = options.cause ?? null;
    this.context = options.context ?? {};
    this.retryable = options.retryable ?? false;
    this.timestamp = Date.now();
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      retryable: this.retryable,
      context: this.context,
      timestamp: this.timestamp,
    };
  }
}

export const EzzErrorCode = {
  CONNECTION: 'EZZ_CONNECTION',
  AUTH: 'EZZ_AUTH',
  DECRYPT: 'EZZ_DECRYPT',
  ENCRYPT: 'EZZ_ENCRYPT',
  MEDIA: 'EZZ_MEDIA',
  RATE_LIMIT: 'EZZ_RATE_LIMIT',
  TIMEOUT: 'EZZ_TIMEOUT',
  VALIDATION: 'EZZ_VALIDATION',
  PROTOCOL: 'EZZ_PROTOCOL',
  UNKNOWN: 'EZZ_UNKNOWN',
};

export function wrapError(err, code = EzzErrorCode.UNKNOWN, context = {}) {
  if (err instanceof EzzError) {
    err.context = { ...err.context, ...context };
    return err;
  }
  const statusCode = err?.output?.statusCode ?? err?.statusCode ?? null;
  const retryable = [408, 440, 500, 503].includes(statusCode) ||
    code === EzzErrorCode.TIMEOUT ||
    code === EzzErrorCode.CONNECTION;
  return new EzzError(code, err?.message || String(err), {
    statusCode,
    cause: err,
    context,
    retryable,
  });
}

export async function withRetry(fn, options = {}) {
  const {
    retries = 3,
    delayMs = 1000,
    factor = 2,
    onRetry = null,
  } = options;
  let lastError;
  let wait = delayMs;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn(attempt);
    } catch (err) {
      lastError = wrapError(err, EzzErrorCode.UNKNOWN, { attempt });
      if (!lastError.retryable || attempt === retries) break;
      if (onRetry) onRetry(lastError, attempt);
      await new Promise((r) => setTimeout(r, wait));
      wait = Math.min(wait * factor, 30000);
    }
  }
  throw lastError;
}

export function safeAsync(fn, onError) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (err) {
      const e = wrapError(err);
      if (onError) onError(e);
      return null;
    }
  };
}


const errorListeners = new Set();

export function ezzOnError(fn) {
  if (typeof fn === 'function') errorListeners.add(fn);
  return () => errorListeners.delete(fn);
}

export function ezzReportError(err, context = {}) {
  const e = wrapError(err, err?.code || EzzErrorCode.UNKNOWN, context);
  // solo notifica si el usuario activó errorHook
  for (const fn of errorListeners) {
    try { fn(e); } catch {}
  }
  return e;
}

export default {
  EzzError,
  EzzErrorCode,
  wrapError,
  withRetry,
  safeAsync,
  ezzOnError,
  ezzReportError,
};
