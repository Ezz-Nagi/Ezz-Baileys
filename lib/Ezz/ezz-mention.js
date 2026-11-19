/**
 * Ezz Mention helpers
 */

/** Menciona JIDs en un texto (añade contextInfo.mentionedJid) */
export function ezzMention(text, jids = []) {
  const mentionedJid = (Array.isArray(jids) ? jids : [jids]).filter(Boolean);
  return {
    text: text || '',
    mentions: mentionedJid,
  };
}

/**
 * mentionAll: el bot debe pasar la lista de participantes.
 * No hace query de red; solo arma el payload.
 */
export function ezzMentionAll(text, participants = []) {
  const jids = participants
    .map((p) => (typeof p === 'string' ? p : p?.id || p?.jid || p?.phoneNumber))
    .filter((j) => typeof j === 'string' && j.includes('@'));
  return ezzMention(text, jids);
}

export default { ezzMention, ezzMentionAll };
