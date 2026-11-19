/**
 * Ezz Context / quote helpers
 */

export function ezzQuote(quotedMsg) {
  if (!quotedMsg) return undefined;
  return quotedMsg;
}

/** Opciones de sendMessage con quoted */
export function ezzWithQuote(options = {}, quotedMsg) {
  return { ...options, quoted: quotedMsg };
}

/** contextInfo mínimo */
export function ezzContextInfo({ mentionedJid, stanzaId, participant, remoteJid, quotedMessage } = {}) {
  const ctx = {};
  if (mentionedJid) ctx.mentionedJid = Array.isArray(mentionedJid) ? mentionedJid : [mentionedJid];
  if (stanzaId) ctx.stanzaId = stanzaId;
  if (participant) ctx.participant = participant;
  if (remoteJid) ctx.remoteJid = remoteJid;
  if (quotedMessage) ctx.quotedMessage = quotedMessage;
  return ctx;
}

export default { ezzQuote, ezzWithQuote, ezzContextInfo };
