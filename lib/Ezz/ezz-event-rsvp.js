/**
 * Ezz Event RSVP — lectura simple de respuestas a eventos.
 */

export function ezzIsEventResponse(msg) {
  return Boolean(msg?.message?.eventResponseMessage || msg?.message?.protocolMessage?.eventResponseMessage);
}

export function ezzParseEventResponse(msg) {
  const er =
    msg?.message?.eventResponseMessage ||
    msg?.message?.protocolMessage?.eventResponseMessage ||
    null;
  if (!er) return null;
  return {
    response: er.response ?? er.eventResponseType ?? null,
    extraGuestCount: er.extraGuestCount ?? 0,
    key: msg.key,
    timestamp: msg.messageTimestamp,
    raw: er,
  };
}

export default { ezzIsEventResponse, ezzParseEventResponse };
