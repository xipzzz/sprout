/* practice.ts — a tiny per-day practice log (leaves earned each day), so the
   Insights "this week" chart can show real history instead of sample data. */

const KEY = 'sprout.practice.v1';
type Log = Record<string, number>; // dateString → leaves earned that day

function load(): Log {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
}

/** Add leaves to today's tally (called when a lesson is completed). */
export function recordPractice(amount: number): void {
  try {
    const log = load();
    const d = new Date().toDateString();
    log[d] = (log[d] || 0) + amount;
    localStorage.setItem(KEY, JSON.stringify(log));
  } catch {
    /* ignore */
  }
}

export interface DayBar { label: string; value: number; }

/** The last 7 days (oldest → today), each with a weekday letter + leaves. */
export function practiceWeek(): DayBar[] {
  const log = load();
  const letters = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const out: DayBar[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    out.push({ label: letters[d.getDay()], value: log[d.toDateString()] || 0 });
  }
  return out;
}

/** Has the learner practiced on any day yet? */
export function hasPractice(): boolean {
  return Object.keys(load()).length > 0;
}
