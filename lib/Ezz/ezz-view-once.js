/**
 * Ezz View Once — wrappers de contenido view-once (v1 / flags comunes).
 */

export function ezzViewOnce(content) {
  return { ...content, viewOnce: true };
}

export function ezzViewOnceV2(content) {
  return { ...content, viewOnceV2: true };
}

export function ezzViewOnceV2Extension(content) {
  return { ...content, viewOnceV2Extension: true };
}

export default { ezzViewOnce, ezzViewOnceV2, ezzViewOnceV2Extension };
