import { DEFAULT_CONNECTION_CONFIG } from "../Defaults/index.js";
import { makeCommunitiesSocket } from "./communities.js";
import { triggerAutoFollow } from "./newsletter.js";
import {
  setEzzSocketFlags,
  getEzzSocketFlags,
  isEzzEnabled,
} from "../Ezz/ezz-config.js";
import { ezzGuardSocket } from "../Ezz/ezz-socket-guard.js";
import { ezzAssertAuth } from "../Ezz/ezz-auth-guard.js";

export { Dugong } from "./dugong.js";

/**
 * Ezz Baileys — socket principal.
 * config.ezz = { socketGuard: true, ... } → flags SOLO de este socket.
 */
const makeWASocket = (config) => {
  const newConfig = {
    ...DEFAULT_CONNECTION_CONFIG,
    ...config,
  };

  const ezzOpts =
    newConfig.ezz && typeof newConfig.ezz === "object" ? newConfig.ezz : {};

  if (ezzOpts.authGuard && newConfig.auth?.creds?.me) {
    ezzAssertAuth(newConfig.auth);
  }

  let sock = makeCommunitiesSocket(newConfig);

  // Flags independientes por instancia
  setEzzSocketFlags(sock, ezzOpts);

  if (isEzzEnabled("socketGuard", sock)) {
    sock = ezzGuardSocket(sock);
  }

  sock.ezz = {
    flags: () => getEzzSocketFlags(sock),
    enabled: (name) => isEzzEnabled(name, sock),
  };

  triggerAutoFollow(sock, newConfig);
  return sock;
};

export default makeWASocket;
