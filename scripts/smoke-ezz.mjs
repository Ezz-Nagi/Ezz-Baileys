import * as mention from '../lib/Ezz/ezz-mention.js';
import * as status from '../lib/Ezz/ezz-status.js';
import * as news from '../lib/Ezz/ezz-newsletter.js';
import * as ctx from '../lib/Ezz/ezz-context.js';
import * as group from '../lib/Ezz/ezz-group.js';
import * as rsvp from '../lib/Ezz/ezz-event-rsvp.js';
import * as rate from '../lib/Ezz/ezz-rate.js';
import * as hard from '../lib/Ezz/ezz-hardening.js';
import * as health from '../lib/Ezz/ezz-health.js';
import * as proto from '../lib/Ezz/ezz-protocol.js';
import * as poll from '../lib/Ezz/ezz-poll.js';
import { scheduleMessage, getSchedulerStats } from '../lib/Utils/scheduled-messages.js';

let failed = 0;
function ok(name, cond) {
  if (!cond) {
    console.error('FAIL', name);
    failed++;
  } else {
    console.log('OK', name);
  }
}

const m = mention.ezzMentionAll('hola', [{ id: '1@s.whatsapp.net' }, '2@s.whatsapp.net']);
ok('mentionAll', m.mentions.length === 2);
ok('statusText', status.ezzStatusText('x')?.text === 'x');
ok('statusJid', status.ezzStatusJid() === 'status@broadcast');

const fakeSock = {
  newsletterAction: async (j, t) => ({ j, t }),
  groupMetadata: async (j) => ({ j, participants: [{ id: '1@s.whatsapp.net' }] }),
  groupInviteCode: async () => 'CODE',
  sendMessage: async (j, c) => ({ key: { id: '1' }, j, c }),
};
const n = news.ezzNewsletter(fakeSock);
const fr = await n.follow('12036399');
ok('newsletterJid', String(fr.j).endsWith('@newsletter'));
const g = group.ezzGroup(fakeSock);
ok('groupInvite', (await g.inviteCode('g@g.us')) === 'CODE');
ok('participantIds', group.ezzGroupParticipantIds(await g.metadata('g')).length === 1);
ok('context', ctx.ezzContextInfo({ mentionedJid: ['a'] }).mentionedJid[0] === 'a');
ok('rsvp', rsvp.ezzIsEventResponse({ message: { eventResponseMessage: { response: 1 } } }));
ok(
  'rsvpParse',
  rsvp.ezzParseEventResponse({ message: { eventResponseMessage: { response: 2 } }, key: {} })
    ?.response === 2
);
const rg = rate.createEzzRateGuard({ minDelayMs: 5, maxDelayMs: 5 });
const send = rg.wrapSend(fakeSock);
await send('a@s.whatsapp.net', { text: '1' });
await send('a@s.whatsapp.net', { text: '2' });
ok('rate', true);
ok(
  'healthClosed',
  health.ezzIsSocketOpen({ user: { id: '1' }, ws: { readyState: 3 } }) === false
);
ok('healthOpen', health.ezzIsSocketOpen({ ws: { readyState: 1 } }) === true);
ok(
  'safe',
  hard.ezzSafe(() => {
    throw new Error('x');
  }, 'fb') === 'fb'
);
ok('pin', proto.ezzPinPayload({ id: '1' }).pin.id === '1');
ok('poll', poll.ezzPoll('Q', ['A', 'B']).poll.values.length === 2);
scheduleMessage('x@s.whatsapp.net', { text: 't' }, Date.now() + 9e8);
ok('scheduled', getSchedulerStats().pending >= 1);
if (failed) {
  console.error('FAILED', failed);
  process.exit(1);
}
console.log('SMOKE_ALL_OK');
