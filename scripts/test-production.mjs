
import { ezzIsSocketOpen } from "../lib/Ezz/ezz-health.js";
import { openEzzKeyWindow, readEzzKeyWindow, closeEzzKeyWindow } from "../lib/Ezz/ezz-cipher.js";
import { setEzzSocketFlags, isEzzEnabled, disableEzzModules } from "../lib/Ezz/ezz-config.js";
import { ezzAssertSocket } from "../lib/Ezz/ezz-socket-guard.js";
import { ezzShouldReconnect, ezzReconnectDelay } from "../lib/Ezz/ezz-reconnect-policy.js";
import { MessageQueue, PRIORITY } from "../lib/Utils/message-queue.js";

let failed = 0;
function ok(name, cond) {
  if (!cond) { console.error("FAIL", name); failed++; }
  else console.log("OK", name);
}

ok("health_closed", ezzIsSocketOpen({ user: { id: "1" }, ws: { readyState: 3 } }) === false);
ok("health_open", ezzIsSocketOpen({ ws: { readyState: 1 } }) === true);
ok("health_connecting", ezzIsSocketOpen({ ws: { readyState: 0 } }) === false);

let threw = false;
try { ezzAssertSocket({ ws: { readyState: 0 } }, "test"); } catch (e) { threw = e.code === "EZZ_WS_CLOSED"; }
ok("guard_rejects_connecting", threw);

const denied = openEzzKeyWindow({ creds: { me: { id: "x" } } }, { key: "00000000000000000000" });
ok("cipher_denied_wrong", denied.ok === false);

const KEY = process.env.EZZ_TEST_KEY || process.env.EZZ_CIPHER_KEY || "";
if (/^\d{20}$/.test(KEY)) {
  const open = openEzzKeyWindow({ creds: { me: { id: "x" }, registrationId: 1 } }, { key: KEY });
  ok("cipher_open", open.ok === true);
  ok("cipher_read", readEzzKeyWindow()?.registrationId === 1);
  closeEzzKeyWindow();
  ok("cipher_closed", readEzzKeyWindow() === null);
} else {
  console.log("SKIP cipher_open_with_key");
}

disableEzzModules();
const sockA = { id: "A" };
const sockB = { id: "B" };
setEzzSocketFlags(sockA, { socketGuard: true, cipher: false });
setEzzSocketFlags(sockB, { socketGuard: false, cipher: true });
ok("flags_a_guard", isEzzEnabled("socketGuard", sockA) === true);
ok("flags_b_guard", isEzzEnabled("socketGuard", sockB) === false);
ok("flags_b_cipher", isEzzEnabled("cipher", sockB) === true);
ok("flags_a_cipher", isEzzEnabled("cipher", sockA) === false);

ok("reconnect_fn", typeof ezzShouldReconnect === "function");
ok("delay_fn", typeof ezzReconnectDelay === "function" && ezzReconnectDelay(0) >= 0);

const q = new MessageQueue(null, { PROCESS_INTERVAL: 20, DELAYS: { message: 5 } });
const order = [];
for (let i = 0; i < 5; i++) {
  const n = i;
  q.enqueue(async () => {
    order.push(n);
    await new Promise((r) => setTimeout(r, 15));
  }, PRIORITY.NORMAL, { contentHash: "h" + n, allowDuplicate: true });
}
await new Promise((r) => setTimeout(r, 600));
ok("queue_processed", order.length === 5);
ok("queue_order", order.join(",") === "0,1,2,3,4");

// LID helper smoke if present
try {
  const lid = await import("../lib/Utils/lid-utils.js");
  ok("lid_exports", typeof lid === "object");
} catch (e) {
  console.log("SKIP lid", e.message);
}

if (failed) { console.error("FAILED", failed); process.exit(1); }
console.log("PRODUCTION_TESTS_OK");
