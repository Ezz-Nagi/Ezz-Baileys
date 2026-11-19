/**
 * Ezz Album — helper de payload álbum (imagen/video).
 * No envía solo; construye el content para sock.sendMessage.
 */

export function ezzAlbum(items = [], caption = '') {
  const album = (items || []).map((it) => {
    if (it.image || it.video) return it;
    if (it.url && it.type === 'video') return { video: { url: it.url }, caption: it.caption };
    if (it.url) return { image: { url: it.url }, caption: it.caption };
    if (Buffer.isBuffer(it)) return { image: it };
    return it;
  });
  const payload = { album };
  if (caption) payload.caption = caption;
  return payload;
}

export default { ezzAlbum };
