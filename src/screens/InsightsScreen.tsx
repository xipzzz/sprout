/* InsightsScreen — a calm look at progress. No targets to miss, no red,
   no "you're behind" — just a gentle picture of how the garden is growing. */

import Pip from '../components/Pip';
import { hud } from '../data/course';

interface InsightsScreenProps {
  onBack: () => void;
  completed: string[];
}

// A gentle representative week of leaves earned (Mon→Sun, today last).
const WEEK = [3, 5, 2, 6, 4, 7, 5];
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function InsightsScreen({ onBack, completed }: InsightsScreenProps) {
  const units = completed.length;
  const words = units * 4; // rough estimate until per-unit vocab is tracked
  const weekTotal = WEEK.reduce((a, b) => a + b, 0);
  const best = Math.max(...WEEK);
  const max = Math.max(...WEEK, 1);

  const stats = [
    { icon: '📖', num: words, label: 'Words grown' },
    { icon: '🌳', num: units, label: 'Units finished' },
    { icon: '🍃', num: weekTotal, label: 'Leaves this week' },
    { icon: '🌟', num: hud.gems, label: 'Gems saved' },
  ];

  return (
    <div className="screen insights">
      <header className="streak__top">
        <button type="button" className="lesson__close" onClick={onBack} aria-label="Back">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
               strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <h1 className="streak__title">Insights</h1>
      </header>

      <main className="screen__body insights__body">
        <div className="insights__stats">
          {stats.map((s) => (
            <div key={s.label} className="insights__stat">
              <span className="insights__stat-icon" aria-hidden="true">{s.icon}</span>
              <span className="insights__stat-num">{s.num}</span>
              <span className="insights__stat-lbl">{s.label}</span>
            </div>
          ))}
        </div>

        <section className="insights__card">
          <h2 className="insights__card-title">This week</h2>
          <div className="insights__chart" role="img" aria-label={`Leaves earned each day this week, ${weekTotal} in total`}>
            {WEEK.map((v, i) => (
              <div key={i} className="insights__bar-col">
                <div className="insights__bar-track">
                  <div
                    className={`insights__bar${v === best ? ' insights__bar--best' : ''}`}
                    style={{ height: `${Math.round((v / max) * 100)}%` }}
                  />
                </div>
                <span className="insights__bar-day">{DAYS[i]}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="insights__note">
          <Pip className="insights__pip" />
          <p>Every little bit helps your garden grow. There's no catching up to do — only growing. 🌱</p>
        </div>
      </main>
    </div>
  );
}
