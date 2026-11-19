/**
 * Ezz Newsletter helpers — wrappers del socket (no reimplementan protocolo).
 * Uso: const api = ezzNewsletter(sock)
 */

function asNewsletterJid(id) {
  if (!id) return id;
  const s = String(id).trim();
  if (s.endsWith('@newsletter')) return s;
  if (/^\d+$/.test(s)) return `${s}@newsletter`;
  return s;
}

export function ezzNewsletter(sock) {
  return {
    jid: asNewsletterJid,
    follow: (jid) => sock.newsletterAction?.(asNewsletterJid(jid), 'follow'),
    unfollow: (jid) => sock.newsletterAction?.(asNewsletterJid(jid), 'unfollow'),
    mute: (jid) => sock.newsletterAction?.(asNewsletterJid(jid), 'mute'),
    unmute: (jid) => sock.newsletterAction?.(asNewsletterJid(jid), 'unmute'),
    action: (jid, type) => sock.newsletterAction?.(asNewsletterJid(jid), type),
    subscribed: () => sock.newsletterFetchAllSubscribed?.() ?? sock.newsletterFetchAllSubscribe?.(),
    metadata: (jid, params) => sock.newsletterMetadata?.(asNewsletterJid(jid), params),
    create: (name, description) => sock.newsletterCreate?.(name, description),
    update: (jid, updates) => sock.newsletterUpdate?.(asNewsletterJid(jid), updates),
  };
}

export { asNewsletterJid as ezzAsNewsletterJid };

export default { ezzNewsletter, ezzAsNewsletterJid: asNewsletterJid };
