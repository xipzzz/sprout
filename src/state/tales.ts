/* tales.ts — a tiny "you've read it" log for Garden Tales, so the library
   can show which tales are done. localStorage-backed, additive (never resets). */

const KEY = 'sprout.talesRead.v1';

function load(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch { return new Set(); }
}
function save(s: Set<string>): void {
  try { localStorage.setItem(KEY, JSON.stringify([...s])); } catch { /* ignore */ }
}

export function markTaleRead(id: string): void {
  const s = load();
  if (!s.has(id)) { s.add(id); save(s); }
}
export function talesRead(): Set<string> {
  return load();
}
