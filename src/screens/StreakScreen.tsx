/* StreakScreen — a calm month grid. Practiced days are soft green leaf-dots;
   missed days are neutral (never red); an auto-applied freeze is shown warmly. */

interface StreakScreenProps {
  onBack: () => void;
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const OFFSET = 4; // month starts mid-week (mock data)
const DAYS = 30;
const PRACTICED = new Set([1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12]);
const FREEZE = 6;
const TODAY = 12;

function dayClass(d: number): string {
  if (d === TODAY) return 'sday sday--today';
  if (d === FREEZE) return 'sday sday--freeze';
  if (PRACTICED.has(d)) return 'sday sday--done';
  if (d > TODAY) return 'sday sday--future';
  return 'sday';
}

const STREAK = TODAY; // current streak length (days)
const MILES = [
  { days: 1, emoji: '🌱', label: 'Sprout' },
  { days: 7, emoji: '🌿', label: 'Sapling' },
  { days: 30, emoji: '🌳', label: 'Tree' },
  { days: 100, emoji: '🌸', label: 'Bloom' },
];

export default function StreakScreen({ onBack }: StreakScreenProps) {
  const current = [...MILES].reverse().find((m) => STREAK >= m.days) ?? MILES[0];
  const next = MILES.find((m) => m.days > STREAK) ?? null;
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
          <span className="streak__count">🍃 {STREAK}</span>
          <span className="streak__label">day streak — your garden grew every day</span>
        </div>

        <div className="srail" aria-label="Streak milestones">
          {MILES.map((m) => {
            const reached = STREAK >= m.days;
            const here = m.label === current.label;
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
          {next ? `${next.days - STREAK} more days to a ${next.label} ${next.emoji} — keep growing, gently.` : `You've grown a full ${current.label}! 🌸`}
        </p>

        <div className="cal">
          <div className="cal__week">
            {WEEKDAYS.map((w, i) => <span key={i} className="cal__wd">{w}</span>)}
          </div>
          <div className="cal__grid">
            {Array.from({ length: OFFSET }).map((_, i) => (
              <span key={`b${i}`} className="sday sday--blank" aria-hidden="true" />
            ))}
            {Array.from({ length: DAYS }).map((_, i) => {
              const d = i + 1;
              return <span key={d} className={dayClass(d)}>{d}</span>;
            })}
          </div>
        </div>

        <p className="streak__note">🍃 A leaf kept your garden safe on day {FREEZE} — no streak lost.</p>
      </main>
    </div>
  );
}
