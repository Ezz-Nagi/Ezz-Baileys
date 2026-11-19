# Ezz Baileys — Features

Versión documentada: **1.3.0**

## Protocolo

| Área | Detalle |
|------|---------|
| Multi-Device | Socket Noise + Signal |
| Send / Recv | Texto, media, reacciones, edit, delete |
| Groups | Metadata, invite, participantes, settings |
| Communities | Soporte de comunidades |
| Business | Catálogo / perfil |
| Newsletters | Follow, mute, metadata, create/update |
| VoIP | `VoipClient` |
| App state | mute, pin, archive, star… |

## Identidad y entrega

| Feature | Módulo |
|---------|--------|
| LID ↔ JID | `lid-utils` |
| Cola prioritaria | `message-queue` |
| Reintentos | `message-retry-manager` |
| Smart reconnect | `smart-reconnect`, `ezz-reconnect-policy` |
| Rate guard | `ezz-rate` |

## Mensajería

| Feature | Módulo / API |
|---------|----------------|
| Botones / carrusel | `message_builder`, `ezz-builder` |
| Polls / events | `ezz-poll` |
| View once | `ezz-view-once` |
| Pin / keep / limit share | `ezz-protocol` |
| Status | `status-posting`, `ezz-status` |
| Álbumes | `ezz-album` |
| Mentions / mentionAll | `ezz-mention` |
| Context / quote | `ezz-context` |
| Programados | `scheduled-messages` |
| Anti-delete local | `ezz-anti-delete` |
| Event RSVP parse | `ezz-event-rsvp` |

## Resiliencia

| Feature | Módulo |
|---------|--------|
| Hardening | `ezz-hardening` |
| Health WS real | `ezz-health` |
| Session lock | `ezz-session-lock` |
| Offline buffer | `ezz-offline-buffer` |
| Socket guard | `ezz-socket-guard` |
| Dedupe | `ezz-dedupe` |

## Toolkits

| API | Descripción |
|-----|-------------|
| `ezzGroup(sock)` | Wrappers de grupos |
| `ezzNewsletter(sock)` | Wrappers de canales |
| `createEzzRateGuard()` | Delay entre envíos |

## Dependencias embebidas

- `vendor/libsignal` — sin `git+https` (Termux OK)
