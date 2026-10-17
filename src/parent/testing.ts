/* Helpers for the Node tests: in-memory storage and a tiny assert.
   No node: imports, so the files type-check with the app tsconfig. */

export function check(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Test failed: ${message}`);
}

export function same<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    throw new Error(`Test failed: ${message}\n  expected: ${String(expected)}\n  actual:   ${String(actual)}`);
  }
}

export function throws(run: () => unknown, pattern: RegExp, message: string): void {
  try {
    run();
  } catch (err) {
    const text = err instanceof Error ? err.message : String(err);
    check(pattern.test(text), `${message} (threw "${text}")`);
    return;
  }
  throw new Error(`Test failed: ${message} (did not throw)`);
}

class MemoryStorage implements Storage {
  private data = new Map<string, string>();
  get length() {
    return this.data.size;
  }
  clear() {
    this.data.clear();
  }
  getItem(key: string) {
    return this.data.has(key) ? (this.data.get(key) as string) : null;
  }
  key(index: number) {
    return [...this.data.keys()][index] ?? null;
  }
  removeItem(key: string) {
    this.data.delete(key);
  }
  setItem(key: string, value: string) {
    this.data.set(key, String(value));
  }
}

export function installMemoryStorage(): { local: Storage; session: Storage } {
  const local = new MemoryStorage();
  const session = new MemoryStorage();
  Object.defineProperty(globalThis, 'localStorage', { value: local, configurable: true, writable: true });
  Object.defineProperty(globalThis, 'sessionStorage', { value: session, configurable: true, writable: true });
  return { local, session };
}
