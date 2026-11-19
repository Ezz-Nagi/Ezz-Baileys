/**
 * Ezz Status — wrappers sobre status-posting (sin duplicar lógica pesada).
 */
import {
  createTextStatus,
  createImageStatus,
  createVideoStatus,
  createAudioStatus,
  STATUS_BROADCAST_JID,
  STATUS_BACKGROUNDS,
  STATUS_FONTS,
} from '../Utils/status-posting.js';

export { STATUS_BROADCAST_JID, STATUS_BACKGROUNDS, STATUS_FONTS };

export function ezzStatusText(text, options = {}) {
  return createTextStatus({ text, ...options });
}

export function ezzStatusImage(media, options = {}) {
  return createImageStatus(media, options);
}

export function ezzStatusVideo(media, options = {}) {
  return createVideoStatus(media, options);
}

export function ezzStatusAudio(media, options = {}) {
  return createAudioStatus(media, options);
}

/** JID destino de estados */
export function ezzStatusJid() {
  return STATUS_BROADCAST_JID;
}

export default {
  ezzStatusText,
  ezzStatusImage,
  ezzStatusVideo,
  ezzStatusAudio,
  ezzStatusJid,
  STATUS_BROADCAST_JID,
  STATUS_BACKGROUNDS,
  STATUS_FONTS,
};
