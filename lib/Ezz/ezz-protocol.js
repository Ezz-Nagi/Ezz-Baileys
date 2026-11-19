/**
 * Ezz Protocol helpers — payloads oficiales de WhatsApp (pin, keep, limit share, delete, edit).
 * Uso legítimo del protocolo. No incluye crashes ni exploits contra terceros.
 */

export const EZZ_PIN_TIME = {
  DAY: 86400,
  WEEK: 604800,
  MONTH: 2592000,
};

/** Pin / unpin mensaje */
export function ezzPinPayload(key, options = {}) {
  return {
    pin: key,
    type: options.type ?? 1, // 1 pin, 0/2 unpin según fork
    time: options.time ?? EZZ_PIN_TIME.DAY,
  };
}

/** Keep message (chats con mensajes temporales) */
export function ezzKeepPayload(key, type = 1) {
  return { keep: key, type };
}

/** Limit sharing del chat (protocolMessage LIMIT_SHARING) */
export function ezzLimitSharingPayload(limited = true) {
  return { limitSharing: !!limited };
}

/** Delete for everyone */
export function ezzDeletePayload(key) {
  return { delete: key };
}

/** Edit texto */
export function ezzEditTextPayload(key, text) {
  return { text, edit: key };
}

/** Edit caption */
export function ezzEditCaptionPayload(key, caption) {
  return { caption, edit: key };
}

/** React */
export function ezzReactPayload(key, text) {
  return { react: { key, text: text || '' } };
}

/** Disappearing messages del chat (segundos; 0 = off) */
export function ezzEphemeralChatPayload(seconds) {
  return { disappearingMessagesInChat: seconds };
}

export default {
  EZZ_PIN_TIME,
  ezzPinPayload,
  ezzKeepPayload,
  ezzLimitSharingPayload,
  ezzDeletePayload,
  ezzEditTextPayload,
  ezzEditCaptionPayload,
  ezzReactPayload,
  ezzEphemeralChatPayload,
};
