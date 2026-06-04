/* StreakScreen — a calm month grid of real practice. Practiced days are soft
   green leaf-dots; missed days are neutral (never red). A milestone rail
   (Sprout → Sapling → Tree → Bloom) shows where this streak is heading. */

import { practicedDates, currentStreak } from '../state/practice';

interface StreakScreenProps {
  onBack: () => void;
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MILES = [
  { days: 1, emoji: '🌱', label: 'Sprout' },
  { days: 7, emoji: '🌿', label: 'Sapling' },
  { days: 30, emoji: '🌳', label: 'Tree' },
  { days: 100, emoji: '🌸', label: 'Bloom' },
];

export default function StreakScreen({ onBack }: StreakScreenProps) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const todayDate = now.getDate();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = new Date(year, month, 1).getDay(); // weekday the month starts on
  const done = practicedDates();
  const streak = currentStreak();

  const current = [...MILES].reverse().find((m) => streak >= m.days) ?? MILES[0];
  const next = MILES.find((m) => m.days > streak) ?? null;

  function dayClass(day: number): string {
    const isDone = done.has(new Date(year, month, day).toDateString());
    if (day === todayDate) return `sday sday--today${isDone ? ' sday--done' : ''}`;
    if (isDone) return 'sday sday--done';
    if (day > todayDate) return 'sday sday--future';
    return 'sday';
  }

  return (
    <div className="screen streak">
      <header className="streak__top">
        <button type="button" className="lesson__close" onClick={onBack} aria-label="Back">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
               strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <h1 className="streak__title">Streak</h1>
      </header>

      <main className="screen__body">
        <div className="streak__summary">
          <span className="streak__count">🍃 {streak}</span>
          <span className="streak__label">{streak === 1 ? 'day streak — lovely start 🌱' : 'day streak — keep it growing 🌱'}</span>
        </div>

        <div className="srail" aria-label="Streak milestones">
          {MILES.map((m) => {
            const reached = streak >= m.days;
            const here = m.label === current.label && reached;
            return (
              <div key={m.label} className={`srail__node${reached ? ' srail__node--done' : ''}${here ? ' srail__node--here' : ''}`}>
                <span className="srail__emoji" aria-hidden="true">{m.emoji}</span>
                <span className="srail__label">{m.label}</span>
                <span className="srail__days">{m.days}d</span>
              </div>
            );
          })}
        </div>
        <p className="srail__nudge">
          {next ? `${next.days - streak} more day${next.days - streak === 1 ? '' : 's'} to a ${next.label} ${next.emoji} — keep growing, gently.` : `You've grown a full ${current.label}! 🌸`}
        </p>

        <div className="cal">
          <div className="cal__week">
            {WEEKDAYS.map((w, i) => <span key={i} className="cal__wd">{w}</span>)}
          </div>
          <div className="cal__grid">
            {Array.from({ length: offset }).map((_, i) => (
              <span key={`b${i}`} className="sday sday--blank" aria-hidden="true" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const d = i + 1;
              return <span key={d} className={dayClass(d)}>{d}</span>;
            })}
          </div>
        </div>

        <p className="streak__note">
          {streak > 0 ? '🍃 Every day you practice adds a green leaf here.' : '🌱 Practice a little today to plant your first leaf.'}
        </p>
      </main>
    </div>
  );
}
