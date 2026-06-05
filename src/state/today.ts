/* today.ts — the Home "Today" daily checklist key, shared so other places can
   auto-tick it when an action actually happens (finish a lesson, read a tale,
   visit the garden). Resets per calendar day. */

export function todayKey(): string {
  return `sprout.today.${new Date().toDateString()}`;
}

export function markTodayDone(id: string): void {
  try {
    const k = todayKey();
    const list: string[] = JSON.parse(localStorage.getItem(k) || '[]');
    if (!list.includes(id)) {
      list.push(id);
      localStorage.setItem(k, JSON.stringify(list));
    }
  } catch {
    /* ignore */
  }
}
