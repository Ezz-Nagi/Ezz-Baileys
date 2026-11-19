/**
 * Ezz Builder — botones, carruseles, listas y rich messages
 * Reexporta y envuelve el message_builder Modded con marca Ezz.
 */

export {
  Button,
  ButtonV2,
  Carousel,
  AIRich,
  Toolkit,
  RowBuilder,
  CardBuilder,
} from '../Modded/message_builder.js';

/** Atajo: botón quick reply */
export function ezzQuickReply(display_text, id) {
  return {
    name: 'quick_reply',
    buttonParamsJson: JSON.stringify({ display_text, id }),
  };
}

/** Atajo: CTA URL */
export function ezzCtaUrl(display_text, url, merchant_url) {
  return {
    name: 'cta_url',
    buttonParamsJson: JSON.stringify({
      display_text,
      url,
      merchant_url: merchant_url || url,
    }),
  };
}

/** Atajo: CTA copy */
export function ezzCtaCopy(display_text, copy_code) {
  return {
    name: 'cta_copy',
    buttonParamsJson: JSON.stringify({ display_text, copy_code }),
  };
}

/** Atajo: lista single_select */
export function ezzList(title, sections) {
  return {
    name: 'single_select',
    buttonParamsJson: JSON.stringify({ title, sections }),
  };
}

/** Payload interactivo listo para sock.sendMessage */
export function ezzInteractive({ title, footer, header, buttons }) {
  return {
    interactiveMessage: {
      title: title || 'Ezz Baileys',
      footer: footer || 'Ezz',
      header: header || '',
      buttons: buttons || [],
    },
  };
}

export default {
  ezzQuickReply,
  ezzCtaUrl,
  ezzCtaCopy,
  ezzList,
  ezzInteractive,
};
