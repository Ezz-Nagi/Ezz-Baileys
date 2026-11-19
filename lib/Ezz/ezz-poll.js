/**
 * Ezz Poll / Event helpers — builders de payload.
 */

export function ezzPoll(name, values, options = {}) {
  return {
    poll: {
      name,
      values,
      selectableCount: options.selectableCount ?? 1,
      toAnnouncementGroup: options.toAnnouncementGroup ?? false,
      ...(options.endDate ? { endDate: options.endDate } : {}),
      ...(options.hideVoter != null ? { hideVoter: options.hideVoter } : {}),
      ...(options.canAddOption != null ? { canAddOption: options.canAddOption } : {}),
    },
  };
}

export function ezzEvent(options = {}) {
  return {
    event: {
      name: options.name || 'Event',
      description: options.description,
      startDate: options.startDate || new Date(Date.now() + 3600000),
      endDate: options.endDate,
      call: options.call,
      isCancelled: options.isCancelled ?? false,
      isScheduleCall: options.isScheduleCall ?? false,
      extraGuestsAllowed: options.extraGuestsAllowed ?? false,
      location: options.location,
    },
  };
}

export default { ezzPoll, ezzEvent };
