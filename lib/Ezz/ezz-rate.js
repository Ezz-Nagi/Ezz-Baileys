/**
 * Ezz Rate guard / send batcher — delay entre envíos (mitigación de ritmo).
 * No es anti-ban mágico; solo serializa y espera.
 */

export function createEzzRateGuard(options = {}) {
  const minDelayMs = options.minDelayMs ?? 800;
  const maxDelayMs = options.maxDelayMs ?? minDelayMs;
  let chain = Promise.resolve();
  let lastAt = 0;

  function delayForNext() {
    const now = Date.now();
    const base = minDelayMs + Math.floor(Math.random() * Math.max(0, maxDelayMs - minDelayMs));
    const wait = Math.max(0, lastAt + base - now);
    lastAt = now + wait;
    return wait;
  }

  async function schedule(fn) {
    const run = chain.then(async () => {
      const wait = delayForNext();
      if (wait > 0) await new Promise((r) => setTimeout(r, wait));
      return fn();
    });
    chain = run.catch(() => {});
    return run;
  }

  return {
    /** Envuelve sock.sendMessage con delay */
    wrapSend(sock) {
      const original = sock.sendMessage.bind(sock);
      return (jid, content, opt) => schedule(() => original(jid, content, opt));
    },
    schedule,
    get pending() {
      return chain;
    },
  };
}

export default { createEzzRateGuard };
