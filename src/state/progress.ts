/* Progress — which units the learner has completed, saved in the browser
   so it survives reloads. */

const KEY = 'sprout.completed.v1';
const SEED = ['s1u1']; // "Hello" starts done, so "Around the Home" is the first START

export function loadCompleted(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [...SEED];
  } catch {
    return [...SEED];
  }
}

export function saveCompleted(ids: string[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    /* ignore (e.g. private browsing) */
  }
}
