/**
 * Ezz Group toolkit — wrappers del socket de grupos.
 */

export function ezzGroup(sock) {
  return {
    metadata: (jid) => sock.groupMetadata?.(jid),
    inviteCode: (jid) => sock.groupInviteCode?.(jid),
    acceptInvite: (code) => sock.groupAcceptInvite?.(code),
    acceptInviteV4: (key, inviteMessage) => sock.groupAcceptInviteV4?.(key, inviteMessage),
    participantsUpdate: (jid, participants, action) =>
      sock.groupParticipantsUpdate?.(jid, participants, action),
    updateSubject: (jid, subject) => sock.groupUpdateSubject?.(jid, subject),
    updateDescription: (jid, description) => sock.groupUpdateDescription?.(jid, description),
    leave: (jid) => sock.groupLeave?.(jid),
    create: (subject, participants) => sock.groupCreate?.(subject, participants),
    settingUpdate: (jid, setting) => sock.groupSettingUpdate?.(jid, setting),
    inviteInfo: (code) => sock.groupGetInviteInfo?.(code),
    revokeInvite: (jid) => sock.groupRevokeInvite?.(jid),
  };
}

/** Extrae ids de participantes desde metadata */
export function ezzGroupParticipantIds(metadata) {
  const list = metadata?.participants || [];
  return list
    .map((p) => p?.id || p?.jid || p?.phoneNumber)
    .filter((j) => typeof j === 'string');
}

export default { ezzGroup, ezzGroupParticipantIds };
