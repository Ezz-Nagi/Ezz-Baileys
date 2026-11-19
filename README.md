<h1 align="center">
  <img src="media/ezz.jpg" width="180" alt="Ezz Baileys" style="border-radius:20px;box-shadow:0 8px 32px rgba(0,0,0,.35)" />
  <br/>
  <br/>
  <b>Ezz Baileys</b>
</h1>

<p align="center">
  <b>WhatsApp Multi-Device API</b><br/>
  Independiente · Orientada a bots MD · Por <a href="https://github.com/Ezz-Nagi"><b>Ezz</b></a>
</p>

<p align="center">
  <img alt="version" src="https://img.shields.io/badge/version-1.3.5-0d1117?style=for-the-badge" />
  <img alt="node" src="https://img.shields.io/badge/node-%3E%3D20-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img alt="license" src="https://img.shields.io/badge/license-MIT-blue?style=for-the-badge" />
  <img alt="lid" src="https://img.shields.io/badge/LID-ready-6e40c9?style=for-the-badge" />
  <img alt="cipher" src="https://img.shields.io/badge/cipher-pre%2Fpost-e85d04?style=for-the-badge" />
</p>

<p align="center">
  <a href="#instalacion">Instalación</a> ·
  <a href="#inicio-rapido">Inicio rápido</a> ·
  <a href="#comparativa">Comparativa</a> ·
  <a href="#funcionalidades">Funcionalidades</a> ·
  <a href="#cipher-ezz">Cipher</a> ·
  <a href="#modulos-ezz">Módulos</a> ·
  <a href="FEATURES.md">FEATURES</a> ·
  <a href="CHANGELOG.md">CHANGELOG</a>
</p>

---

> [!IMPORTANT]
> Proyecto **independiente**. No está afiliado a WhatsApp, Meta ni WhiskeySockets.
> Uso bajo tu responsabilidad. Cumple las políticas de WhatsApp y la legislación aplicable.

---

## Instalación

```bash
npm install github:Ezz-Nagi/Ezz-Baileys
```

En el archivo `package.json` de tu bot:

```json
{
  "dependencies": {
    "ezz-baileys": "github:Ezz-Nagi/Ezz-Baileys"
  }
}
```

Alias si importas el paquete como `baileys`:

```json
{
  "dependencies": {
    "baileys": "github:Ezz-Nagi/Ezz-Baileys"
  }
}
```

| Requisito | Valor |
|-----------|-------|
| Node.js | **20 o superior** |
| `libsignal` | Incluido en `vendor/` |

---

## Inicio rápido

```js
import makeWASocket, {
  useMultiFileAuthState,
  Browsers,
  ezzHardenListener,
  ezzIsSocketOpen,
} from "ezz-baileys";

const { state, saveCreds } = await useMultiFileAuthState("./session");

const sock = makeWASocket({
  auth: state,
  browser: Browsers.ubuntu("Chrome"),
  syncFullHistory: false,
  ezz: {
    socketGuard: true,
    reconnectPolicy: true,
    authGuard: true,
    sessionLock: true,
    // cipher: true, // Análisis del sobre durante 10 segundos
  },
});

sock.ev.on("creds.update", saveCreds);

sock.ev.on(
  "connection.update",
  ezzHardenListener(({ connection }) => {
    if (connection === "open") {
      console.log("Listo", ezzIsSocketOpen(sock));
    }
  })
);
```

---

## Comparativa

### Frente a Baileys oficial

| Área | Oficial | **Ezz** |
|------|---------|---------|
| Protocolo MD | Sí | Sí |
| Botones, carruseles y listas | Limitado | Builders integrados |
| LID a JID | Básico | Caché persistente |
| Cola prioritaria | No | CRITICAL a BACKGROUND |
| Mensajes programados | No | Cron y once |
| Cipher pre/post decrypt | No | Activación opcional; 10 segundos en memoria |
| Hardening y estado del WebSocket | Manual | Módulos Ezz |
| `libsignal` | Puede presentar fragilidad | Incluido en el repositorio |

### Frente a otros forks completos

| Área | Forks típicos | **Ezz** |
|------|---------------|---------|
| Código ofuscado | Frecuente | **No** |
| Funcionalidades siempre activas | A veces | **Activación opcional por socket** |
| Aislamiento multi-bot | Poco frecuente | Flags por instancia |

---

## Funcionalidades

<details>
<summary><b>Núcleo del protocolo</b></summary>

| Área | Detalle |
|------|---------|
| Socket MD | Noise y Multi-Device |
| Mensajes | Texto, multimedia, reacciones, edición y eliminación |
| Grupos y comunidades | Administración, metadatos y participantes |
| Business | Catálogo y perfil |
| Newsletters | Seguir, silenciar y consultar metadatos |
| VoIP | `VoipClient` |

</details>

<details>
<summary><b>Identidad y entrega</b></summary>

| Funcionalidad | Módulo |
|---------------|--------|
| LID a JID | `lid-utils` |
| Cola prioritaria | `message-queue` (procesamiento secuencial) |
| Reconexión inteligente | `ezz-reconnect-policy` |
| Control de velocidad | `ezz-rate` |

</details>

<details>
<summary><b>Mensajería enriquecida</b></summary>

| Funcionalidad | API |
|---------------|-----|
| Botones y carruseles | `Button`, `Carousel`, `ezz-builder` |
| Encuestas y View Once | `ezz-poll`, `ezz-view-once` |
| Pin, Keep y Edit | `ezz-protocol` |
| Estados | `ezz-status` |
| Menciones | `ezzMentionAll` |
| Mensajes programados | `scheduleMessage` y `recurringMessage` |

</details>

---

## Cipher Ezz

Captura del **sobre del mensaje** para análisis de View Once, reintentos y firmas en wire.

| Fase | Contenido |
|------|-----------|
| **Pre-decrypt** | Stanza completo, `<enc>` (pkmsg/msg/skmsg), ciphertext e `device-identity` |
| **Post-decrypt** | `messageSecret` (si el mensaje lo incluye), tipos de mensaje e indicador View Once |

- Solo se conserva en **memoria durante 10 segundos**.
- No exporta las credenciales de sesión del bot.
- Activación opcional: `ezz: { cipher: true }` o `EZZ_CIPHER=1`.

```js
import {
  ezzOnCipherCapture,
  ezzGetCipherCapture,
} from "ezz-baileys";

ezzOnCipherCapture((envelope) => {
  // envelope.encryptedParts    -> wire
  // envelope.messageSecretB64  -> post-decrypt
  // envelope.fullStanza
});
```

---

## Módulos Ezz

Todos los módulos están desactivados por defecto. Se pueden activar individualmente por socket:

```js
makeWASocket({
  ezz: {
    socketGuard: true,   // Bloquea envíos si el WebSocket no está OPEN
    reconnectPolicy: true,
    authGuard: true,
    sessionLock: true,
    cipher: false,
  },
});
```

| Módulo | Función |
|--------|---------|
| `ezz-hardening` | Listeners seguros |
| `ezz-health` | Verificación del estado real del WebSocket |
| `ezz-protocol` | Pin, Keep, Delete y Edit |
| `ezz-sec` | Redacción, control de flood y fingerprint |
| `ezz-cipher` | Captura del sobre pre/post decrypt |
| `ezz-group` y `ezz-newsletter` | Herramientas para grupos y newsletters |
| `ezz-rate` | Control de intervalos entre envíos |

---

## Mensajes programados

```js
import {
  startScheduler,
  scheduleMessage,
  recurringMessage
} from "ezz-baileys";

startScheduler(sock);

scheduleMessage(
  jid,
  { text: "Hola" },
  Date.now() + 60_000
);

recurringMessage(
  jid,
  { text: "Diario" },
  "0 9 * * *"
);
```

---

## Arquitectura

```text
ezz-baileys/
|-- lib/
|   |-- Socket/       connection, send, recv, groups, newsletter
|   |-- Utils/        lid, queue, scheduled, status, auth
|   |-- Ezz/          hardening, cipher, sec, builders, health
|   `-- Modded/       Button, Carousel, Toolkit
|-- WAProto/
`-- vendor/
    `-- libsignal/
```

---

## Libertad de uso

Puedes utilizar y modificar el protocolo y sus herramientas, siempre que no se empleen con fines dañinos, como:

- Acoso.
- Estafas.
- Spam no consentido.
- Daños a terceros.

---

## Autor

| Campo | Información |
|-------|-------------|
| Autor | **Ezz** · [@Ezz-Nagi](https://github.com/Ezz-Nagi) |
| Repositorio | [Ezz-Baileys](https://github.com/Ezz-Nagi/Ezz-Baileys) |

---

## Licencia

[MIT](./LICENSE) · © Ezz
