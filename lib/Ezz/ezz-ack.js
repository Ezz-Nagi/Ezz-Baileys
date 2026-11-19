/**
 * Ezz ACK helper — construcción de receipts (opt-in uso por el caller).
 */

import { isEzzEnabled } from './ezz-config.js';

export function ezzBuildAck({ to, id, participant, type = 'inactive' }) {
  if (!isEzzEnabled('ackHelper')) {
    return null;
  }
  const attrs = {
    to,
    id,
    type,
  };
  if (participant) attrs.participant = participant;
  return {
    tag: 'receipt',
    attrs,
    content: undefined,
  };
}

export async function ezzSendAck(sock, params) {
  if (!isEzzEnabled('ackHelper')) return false;
  const node = ezzBuildAck(params);
  if (!node || !sock?.sendNode) return false;
  await sock.sendNode(node);
  return true;
}

export default { ezzBuildAck, ezzSendAck };
