/**
 * Ezz Feature flags — capacidades de protocolo expuestas por la librería.
 */

export const EzzFeatures = {
  INTERACTIVE: 'interactive',
  ALBUM: 'album',
  NEWSLETTER: 'newsletter',
  VOIP: 'voip',
  LID: 'lid',
  USERNAME: 'username',
  STATUS: 'status',
  PRODUCT: 'product',
  PAYMENT: 'payment',
  EVENT: 'event',
  CAROUSEL: 'carousel',
  CIPHER_CAPTURE: 'cipher_capture',
};

const ENABLED = new Set([
  EzzFeatures.INTERACTIVE,
  EzzFeatures.ALBUM,
  EzzFeatures.NEWSLETTER,
  EzzFeatures.VOIP,
  EzzFeatures.LID,
  EzzFeatures.STATUS,
  EzzFeatures.PRODUCT,
  EzzFeatures.PAYMENT,
  EzzFeatures.EVENT,
  EzzFeatures.CAROUSEL,
]);

export function ezzSupports(feature) {
  if (feature === EzzFeatures.CIPHER_CAPTURE) {
    return process.env.EZZ_CIPHER === '1';
  }
  return ENABLED.has(feature);
}

export function ezzListFeatures() {
  return {
    always: [...ENABLED],
    optional: {
      cipher_capture: process.env.EZZ_CIPHER === '1',
    },
  };
}

export default { EzzFeatures, ezzSupports, ezzListFeatures };
