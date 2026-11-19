/**
 * Ezz module flags — desactivados por defecto.
 * Global: enableEzzModules({ socketGuard: true })
 * Por socket: makeWASocket({ ezz: { socketGuard: true } }) → WeakMap
 */

const globalFlags = {
  cipher: false,
  socketGuard: false,
  pipeline: false,
  reconnectPolicy: false,
  authGuard: false,
  sessionLock: false,
  offlineBuffer: false,
  ackHelper: false,
  errorHook: false,
};

/** @type {WeakMap<object, Record<string, boolean>>} */
const socketFlags = new WeakMap();

function normalize(options = {}) {
  const out = {};
  for (const [k, v] of Object.entries(options)) {
    if (k in globalFlags) out[k] = Boolean(v);
  }
  return out;
}

export function enableEzzModules(options = {}) {
  const n = normalize(options);
  for (const [k, v] of Object.entries(n)) globalFlags[k] = v;
  return { ...globalFlags };
}

export function disableEzzModules(...names) {
  if (!names.length) {
    for (const k of Object.keys(globalFlags)) globalFlags[k] = false;
  } else {
    for (const n of names) {
      if (n in globalFlags) globalFlags[n] = false;
    }
  }
  return { ...globalFlags };
}

export function setEzzSocketFlags(sock, options = {}) {
  if (!sock || typeof sock !== 'object') return null;
  // Aislamiento total: cada socket parte de defaults en false y solo aplica sus opciones.
  // No hereda enableEzzModules global (evita contagio entre principal/subbots).
  const base = {};
  for (const k of Object.keys(globalFlags)) base[k] = false;
  const merged = { ...base, ...normalize(options) };
  socketFlags.set(sock, merged);
  return { ...merged };
}

export function getEzzSocketFlags(sock) {
  if (sock && socketFlags.has(sock)) return { ...socketFlags.get(sock) };
  return { ...globalFlags };
}

export function isEzzEnabled(name, sock) {
  if (sock && socketFlags.has(sock)) {
    return Boolean(socketFlags.get(sock)[name]);
  }
  return Boolean(globalFlags[name]);
}

export function getEzzFlags() {
  return { ...globalFlags };
}

export default {
  enableEzzModules,
  disableEzzModules,
  setEzzSocketFlags,
  getEzzSocketFlags,
  isEzzEnabled,
  getEzzFlags,
};
