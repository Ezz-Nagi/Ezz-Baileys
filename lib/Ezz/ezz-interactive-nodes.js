/**
 * Ezz Interactive Nodes — nodos binarios que WhatsApp espera para botones/native_flow.
 * Inspirado en helpers de forks con botones (sin malware). Uso explícito por el caller.
 */

export function ezzIsGroupJid(jid = '') {
  return String(jid).endsWith('@g.us');
}

/**
 * additionalNodes típicos para que el cliente móvil pinte interactive/native_flow.
 */
export function ezzInteractiveAdditionalNodes(jid, options = {}) {
  const nodes = [];
  if (ezzIsGroupJid(jid)) {
    nodes.push({
      tag: 'biz',
      attrs: {},
      content: [
        {
          tag: 'interactive',
          attrs: { type: 'native_flow', v: options.v || '1' },
          content: [
            {
              tag: 'native_flow',
              attrs: { name: options.flowName || 'mixed', v: options.flowV || '2' },
            },
          ],
        },
      ],
    });
  } else {
    nodes.push({
      tag: 'biz',
      attrs: {},
      content: [
        {
          tag: 'interactive',
          attrs: { type: 'native_flow', v: options.v || '1' },
          content: [
            {
              tag: 'native_flow',
              attrs: { name: options.flowName || 'mixed', v: options.flowV || '2' },
            },
          ],
        },
      ],
    });
    // algunos clientes 1:1 esperan marca bot
    if (options.bot !== false) {
      nodes.push({
        tag: 'bot',
        attrs: { biz_bot: '1' },
      });
    }
  }
  return nodes;
}

/**
 * Normaliza botones legacy → native_flow { name, buttonParamsJson }.
 */
export function ezzNormalizeButtons(buttons = []) {
  return (buttons || []).map((b, i) => {
    if (b?.name && b?.buttonParamsJson) return b;
    if (b?.buttonId || b?.buttonText) {
      const text = b.buttonText?.displayText || b.buttonText || b.text || `btn_${i}`;
      const id = b.buttonId || b.id || `btn_${i}`;
      return {
        name: 'quick_reply',
        buttonParamsJson: JSON.stringify({ display_text: text, id }),
      };
    }
    if (b?.id && b?.text) {
      return {
        name: 'quick_reply',
        buttonParamsJson: JSON.stringify({ display_text: b.text, id: b.id }),
      };
    }
    return b;
  });
}

export default {
  ezzIsGroupJid,
  ezzInteractiveAdditionalNodes,
  ezzNormalizeButtons,
};
