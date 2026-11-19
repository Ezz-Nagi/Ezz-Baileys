/**
 * Ezz Proto Util — utilidades de protocolo / nodos binarios a nivel librería.
 */

export function ezzNodeAttrs(node) {
  return node?.attrs ? { ...node.attrs } : {};
}

export function ezzFindChild(node, tag) {
  const content = node?.content;
  if (!Array.isArray(content)) return null;
  return content.find((c) => c && c.tag === tag) || null;
}

export function ezzFindChildren(node, tag) {
  const content = node?.content;
  if (!Array.isArray(content)) return [];
  return content.filter((c) => c && c.tag === tag);
}

export function ezzGetBinaryChild(node, tag) {
  const child = ezzFindChild(node, tag);
  if (!child) return null;
  if (Buffer.isBuffer(child.content)) return child.content;
  if (typeof child.content === 'string') return Buffer.from(child.content);
  return null;
}

export function ezzStanzaId(node) {
  return node?.attrs?.id || null;
}

export function ezzStanzaFrom(node) {
  return node?.attrs?.from || null;
}

export function ezzIsMessageStanza(node) {
  return node?.tag === 'message';
}

export function ezzIsIqStanza(node) {
  return node?.tag === 'iq';
}

export function ezzIsReceiptStanza(node) {
  return node?.tag === 'receipt';
}

export function ezzIsNotificationStanza(node) {
  return node?.tag === 'notification';
}

export default {
  ezzNodeAttrs,
  ezzFindChild,
  ezzFindChildren,
  ezzGetBinaryChild,
  ezzStanzaId,
  ezzStanzaFrom,
  ezzIsMessageStanza,
  ezzIsIqStanza,
  ezzIsReceiptStanza,
  ezzIsNotificationStanza,
};
