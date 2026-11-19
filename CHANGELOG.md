# Changelog — Ezz Baileys

## 1.3.5

### Cipher
- **Post-decrypt**: captura `messageSecret` y lo fusiona con el sobre pre-decrypt (mismo id, TTL 10s).

### Docs
- README rediseñado; sin menciones a carpetas de instalación locales.

## 1.3.4

### Cipher
- Captura **completa** del stanza pre-decrypt: árbol `fullStanza` + `encryptedParts` (enc/pkmsg/msg/skmsg + device-identity).
- Sigue **sin** exportar creds de sesión. TTL memoria **10s**.

### Sec
- Nuevo `ezz-sec`: redact, fingerprint, flood guard, assert JID, tips de sesión.

### Canal / auto-follow
- Sigue documentado y configurable (`autoFollowNewsletterJid`). **No** se ofusca ni se anti-tamper (política de transparencia).

## 1.3.3

### Cipher
- Captura **pre-decrypt** del sobre wire (`<enc>` ciphertext, type, attrs) en memoria.
- **TTL 10 segundos** (sin disco por defecto).
- **No toca creds** de sesión (eliminada ventana de noiseKey / signedIdentity / etc.).
- Activación opt-in: `ezz: { cipher: true }` o `EZZ_CIPHER=1`.
- API: `ezzListCipherCaptures`, `ezzGetCipherCapture`, `ezzOnCipherCapture`.

## 1.3.2

### Fixed (producción)
- **Socket Guard**: bloquea CONNECTING (0); soporta `WebSocketClient` (`isOpen` / `.socket.readyState`); también envuelve `sendMessage` / `relayMessage`.
- **Scheduler**: `lastSlot` + gap mínimo 55s con `lastSent` para no duplicar recurrentes.
- **Message Queue**: drenaje secuencial por cadena de promesas (`_drain`), un item en vuelo.
- **Flags Ezz**: cada socket aísla flags (no hereda `enableEzzModules` global) — seguro para principal + subbots.

## 1.3.1
- Clave cipher por hash (20 dígitos, no en texto plano)
- Tests de producción

 — Ezz Baileys

## 1.3.0

### Added
- `ezz-mention` — `ezzMention` / `ezzMentionAll`
- `ezz-status` — wrappers de status (texto/imagen/video/audio)
- `ezz-newsletter` — toolkit de canales sobre el socket
- `ezz-context` — quote / contextInfo helpers
- `ezz-group` — toolkit de grupos
- `ezz-event-rsvp` — parse de respuestas a eventos
- `ezz-rate` — rate guard / send batcher
- `FEATURES.md`, `CHANGELOG.md`
- `Example/bot.js` — bot mínimo
- Tipados mínimos `lib/Ezz/index.d.ts`

### Fixed (versiones previas relevantes)
- `ezzIsSocketOpen` solo con WebSocket OPEN
- Eliminado `uncaughtException` agresivo en `lid-utils`
- Carga de módulos Ezz sin ReferenceError en cipher

## 1.2.x

- README comparativo, mensajes programados documentados
- Hardening, protocol helpers, anti-delete, poll, view-once
