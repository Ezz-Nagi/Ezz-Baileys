/** Minimal typings for Ezz modules */
export function ezzIsSocketOpen(sock: any): boolean;
export function ezzHasSessionUser(sock: any): boolean;
export function ezzSocketHealth(sock: any): Record<string, unknown>;
export function ezzSafe<T>(fn: () => T, fallback?: T): T;
export function ezzHardenListener<T extends (...args: any[]) => any>(handler: T, onError?: (err: unknown, args: any[]) => void): (...args: Parameters<T>) => ReturnType<T> | void;
export function ezzSanitizeMessage(msg: any): any;
export function ezzMention(text: string, jids?: string[] | string): { text: string; mentions: string[] };
export function ezzMentionAll(text: string, participants?: any[]): { text: string; mentions: string[] };
export function ezzPinPayload(key: any, options?: { type?: number; time?: number }): any;
export function ezzPoll(name: string, values: string[], options?: Record<string, unknown>): any;
export function ezzNewsletter(sock: any): Record<string, Function>;
export function ezzGroup(sock: any): Record<string, Function>;
export function createEzzRateGuard(options?: { minDelayMs?: number; maxDelayMs?: number }): {
  wrapSend(sock: any): (jid: string, content: any, opt?: any) => Promise<any>;
  schedule<T>(fn: () => Promise<T> | T): Promise<T>;
};
export function createEzzMessageStore(options?: Record<string, unknown>): {
  put(msg: any): void;
  get(key: any): any;
  delete(key: any): void;
  size(): number;
  clear(): void;
};
export function enableEzzModules(flags?: Record<string, boolean>): void;
