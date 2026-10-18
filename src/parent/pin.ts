/* Parent PIN: 4 digits, stored as a salted SHA-256 hash in this browser only.
   The parent area opens only after the PIN is typed, and closes again on
   reload, on Lock, and whenever the child view is opened.
   Any browser key that starts with PARENT_STORAGE_PREFIX is parent data and is
   wiped by resetParentData(). Later parent features (notebook, explanations)
   should store under parentStorageKey() so the reset covers them too.
   Four digits is a speed bump for a child, not real security. */

import { sha256Hex } from './sha256.ts';

export const PARENT_STORAGE_PREFIX = 'sprout.parent.';
export const MAX_TRIES = 5;
export const WAIT_MS = 30_000;

export function parentStorageKey(name: string): string {
  return `${PARENT_STORAGE_PREFIX}${name}`;
}

const PIN_KEY = parentStorageKey('pin');
const TRIES_KEY = parentStorageKey('pinTries');

type StoredPin = { v: 1; salt: string; hash: string };
type Tries = { count: number; waitUntil: number };

let unlocked = false;
const listeners = new Set<() => void>();

function store(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

function emit() {
  for (const listener of listeners) listener();
}

function readJson<T>(key: string): T | null {
  try {
    const raw = store()?.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  store()?.setItem(key, JSON.stringify(value));
}

function randomSalt(): string {
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function hashPin(salt: string, pin: string): string {
  return sha256Hex(`sprout-parent-pin:${salt}:${pin}`);
}

export function isValidPin(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}

export function hasParentPin(): boolean {
  const saved = readJson<StoredPin>(PIN_KEY);
  return Boolean(saved && saved.salt && saved.hash);
}

export function setParentPin(pin: string): void {
  if (!isValidPin(pin)) throw new Error('The PIN must be 4 numbers.');
  const salt = randomSalt();
  writeJson(PIN_KEY, { v: 1, salt, hash: hashPin(salt, pin) } satisfies StoredPin);
  store()?.removeItem(TRIES_KEY);
}

/** Milliseconds left before another try is allowed, or 0. */
export function pinWaitLeft(now = Date.now()): number {
  const tries = readJson<Tries>(TRIES_KEY);
  if (!tries || tries.waitUntil <= now) return 0;
  return tries.waitUntil - now;
}

export type PinCheck = 'ok' | 'wrong' | 'wait' | 'no-pin';

export function checkParentPin(pin: string, now = Date.now()): PinCheck {
  const saved = readJson<StoredPin>(PIN_KEY);
  if (!saved) return 'no-pin';
  if (pinWaitLeft(now) > 0) return 'wait';
  if (isValidPin(pin) && hashPin(saved.salt, pin) === saved.hash) {
    store()?.removeItem(TRIES_KEY);
    return 'ok';
  }
  const before = readJson<Tries>(TRIES_KEY);
  const count = (before && before.count < MAX_TRIES ? before.count : 0) + 1;
  writeJson(TRIES_KEY, { count, waitUntil: count >= MAX_TRIES ? now + WAIT_MS : 0 } satisfies Tries);
  return count >= MAX_TRIES ? 'wait' : 'wrong';
}

/** Opens the parent area for this page load if the PIN matches. */
export function unlockParent(pin: string): boolean {
  if (checkParentPin(pin) !== 'ok') return false;
  unlocked = true;
  emit();
  return true;
}

export function lockParent(): void {
  if (!unlocked) return;
  unlocked = false;
  emit();
}

export function isParentUnlocked(): boolean {
  return unlocked;
}

export function subscribeParent(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Forgot-PIN path: removes the PIN and every parent key in this browser. */
export function resetParentData(): string[] {
  const removed: string[] = [];
  for (const area of [store(), sessionArea()]) {
    if (!area) continue;
    const keys: string[] = [];
    for (let i = 0; i < area.length; i++) {
      const key = area.key(i);
      if (key && key.startsWith(PARENT_STORAGE_PREFIX)) keys.push(key);
    }
    for (const key of keys) {
      area.removeItem(key);
      removed.push(key);
    }
  }
  unlocked = false;
  emit();
  return removed;
}

function sessionArea(): Storage | null {
  try {
    return globalThis.sessionStorage ?? null;
  } catch {
    return null;
  }
}
