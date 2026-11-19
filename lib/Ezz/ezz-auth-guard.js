/**
 * Ezz Auth Guard — validaciones de credenciales / auth state a nivel librería.
 */

export function ezzHasCreds(authState) {
  const creds = authState?.creds || authState;
  return Boolean(creds && (creds.me || creds.noiseKey || creds.signedIdentityKey));
}

export function ezzIsRegistered(authState) {
  const creds = authState?.creds || authState;
  return Boolean(creds?.registered && creds?.me?.id);
}

export function ezzAuthSummary(authState) {
  const creds = authState?.creds || authState || {};
  return {
    registered: Boolean(creds.registered),
    hasMe: Boolean(creds.me?.id),
    hasNoiseKey: Boolean(creds.noiseKey),
    hasSignedIdentity: Boolean(creds.signedIdentityKey),
    hasSignedPreKey: Boolean(creds.signedPreKey),
    registrationId: creds.registrationId ?? null,
    platform: creds.platform ?? null,
    deviceId: creds.deviceId ?? null,
  };
}

export function ezzAssertAuth(authState) {
  if (!ezzHasCreds(authState)) {
    const err = new Error('Ezz Baileys: auth state missing credentials');
    err.code = 'EZZ_NO_CREDS';
    throw err;
  }
  return true;
}

export default {
  ezzHasCreds,
  ezzIsRegistered,
  ezzAuthSummary,
  ezzAssertAuth,
};
