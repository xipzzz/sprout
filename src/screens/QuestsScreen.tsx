/* QuestsScreen — gentle goals, done at your own pace (calm, no pressure).
   Progress is now real: words & blooms come from your actual progress, and the
   daily quests reflect today's checklist on the Home card. */

import { courseWithProgress } from '../data/course';

interface QuestsScreenProps {
  onBack: () => void;
  completed: string[];
}

export default function QuestsScreen({ onBack, completed }: QuestsScreenProps) {
  const words = completed.length * 4; // rough estimate until per-unit vocab is tracked
  const blooms = courseWithProgress(completed).filter((s) => s.status === 'done').length;
  let todayDone: string[] = [];
  try { todayDone = JSON.parse(localStorage.getItem(`sprout.today.${new Date().toDateString()}`) || '[]'); } catch { /* ignore */ }

  const quests = [
    { id: 'today', emoji: '🌱', title: 'Practice today', have: todayDone.includes('lesson') ? 1 : 0, need: 1, reward: '🍃 10' },
    { id: 'words', emoji: '📖', title: 'Grow 5 new words', have: words, need: 5, reward: '💎 20' },
    { id: 'blooms', emoji: '🌸', title: 'Grow 3 blooms', have: blooms, need: 3, reward: '🍃 30' },
    { id: 'garden', emoji: '🌳', title: 'Visit your garden today', have: todayDone.includes('garden') ? 1 : 0, need: 1, reward: '🍃 5' },
  ];

  return (
    <div className="screen quests">
      <header className="streak__top">
        <button type="button" className="lesson__close" onClick={onBack} aria-label="Back">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
               strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <h1 className="streak__title">Quests</h1>
      </header>

      <main className="screen__body">
        <p className="quests__intro">Gentle goals — do them at your own pace 🌱</p>
        <ul className="quests__list">
          {quests.map((q) => {
            const have = Math.min(q.have, q.need);
            const done = q.have >= q.need;
            const pct = Math.min(100, Math.round((q.have / q.need) * 100));
            return (
              <li key={q.id} className="quest">
                <span className="quest__icon" aria-hidden="true">{done ? '✅' : q.emoji}</span>
                <span className="quest__body">
                  <span className="quest__title">{q.title}</span>
                  <span className="quest__bar"><span className="progress__fill" style={{ width: `${pct}%` }} /></span>
                  <span className="quest__meta">{have}/{q.need}</span>
                </span>
                <span className="quest__reward">{q.reward}</span>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
