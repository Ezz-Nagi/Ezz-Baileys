/**
 * Ejemplo mínimo Ezz Baileys — conectar, responder, programar un mensaje.
 * Uso: node Example/bot.js
 */
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  Browsers,
  ezzHardenListener,
  ezzIsSocketOpen,
  ezzShouldReconnect,
  ezzReconnectDelay,
  startScheduler,
  scheduleMessage,
} from '../lib/index.js';

const { state, saveCreds } = await useMultiFileAuthState('./session-example');

const sock = makeWASocket({
  auth: state,
  browser: Browsers.ubuntu('Chrome'),
  syncFullHistory: false,
  ezz: {
    socketGuard: true,
    reconnectPolicy: true,
    authGuard: true,
    sessionLock: true,
  },
});

sock.ev.on('creds.update', saveCreds);

sock.ev.on(
  'connection.update',
  ezzHardenListener((update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) console.log('QR recibido — escanéalo con WhatsApp');
    if (connection === 'open') {
      console.log('conectado', ezzIsSocketOpen(sock));
      startScheduler(sock);
      // ejemplo: programar un ping en 2 minutos a tu propio JID (cámbialo)
      // scheduleMessage(sock.user.id, { text: 'ping programado' }, Date.now() + 120000);
    }
    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode;
      console.log('close', code, 'reconnect?', ezzShouldReconnect(code));
      if (code !== DisconnectReason.loggedOut && ezzShouldReconnect(code)) {
        setTimeout(() => console.log('reinicia el proceso para reconectar'), ezzReconnectDelay(0));
      }
    }
  })
);

sock.ev.on(
  'messages.upsert',
  ezzHardenListener(async ({ messages, type }) => {
    if (type !== 'notify') return;
    const m = messages?.[0];
    if (!m?.message || m.key.fromMe) return;
    const jid = m.key.remoteJid;
    const text =
      m.message.conversation ||
      m.message.extendedTextMessage?.text ||
      '';
    if (text.trim().toLowerCase() === 'ping') {
      await sock.sendMessage(jid, { text: 'pong (Ezz Baileys)' }, { quoted: m });
    }
  })
);
