/* GardenScreen — the reward home. Blooms are tied to real progress (one per
   section, earned when the whole section is finished), plus a calm "Year in
   Bloom" overview of the season so far. */

import TabBar, { type TabKey } from '../components/TabBar';
import Pip from '../components/Pip';
import { courseWithProgress } from '../data/course';

interface GardenScreenProps {
  tab: TabKey;
  onTabChange: (tab: TabKey) => void;
  completed: string[];
  onOpenTales: () => void;
}

// One distinct flower per section, in order.
const SECTION_FLOWERS = ['🌼', '🌸', '🌻', '🌷', '🪻'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function GardenScreen({ tab, onTabChange, completed, onOpenTales }: GardenScreenProps) {
  const sections = courseWithProgress(completed);
  const blooms = sections.map((s, i) => ({
    id: s.id,
    emoji: SECTION_FLOWERS[i % SECTION_FLOWERS.length],
    label: s.title,
    earned: s.status === 'done',
  }));
  const grown = blooms.filter((b) => b.earned).length;
  const currentMonth = new Date().getMonth();

  return (
    <div className="screen garden">
      <header className="garden__head">
        <h1 className="garden__title">Your Garden</h1>
        <p className="garden__sub">{grown} {grown === 1 ? 'bloom' : 'blooms'} grown · keep practicing to grow more 🌱</p>
      </header>

      <main className="screen__body">
        <div className="seedling">
          <Pip className="seedling__pip" />
          <p className="seedling__cap">Your seedling is growing</p>
        </div>

        <button type="button" className="tales-cta" onClick={onOpenTales}>
          <span className="tales-cta__icon" aria-hidden="true">📖</span>
          <span className="tales-cta__text">
            <span className="tales-cta__title">Garden Tales</span>
            <span className="tales-cta__sub">Read a calm story together</span>
          </span>
          <span className="tales-cta__chev" aria-hidden="true">›</span>
        </button>

        <h2 className="garden__section">Monthly Blooms</h2>
        <div className="bloom-grid">
          {blooms.map((b) => (
            <button
              key={b.id}
              type="button"
              className={`bloom${b.earned ? '' : ' bloom--locked'}`}
              aria-label={`${b.label}${b.earned ? ' — grown' : ' — not yet grown'}`}
            >
              <span className="bloom__emoji" aria-hidden="true">{b.earned ? b.emoji : '🌱'}</span>
              <span className="bloom__label">{b.label}</span>
            </button>
          ))}
        </div>

        <h2 className="garden__section">Year in Bloom</h2>
        <div className="year" role="img" aria-label="Your year so far, month by month">
          {MONTHS.map((m, i) => {
            const state = i < currentMonth ? 'past' : i === currentMonth ? 'now' : 'future';
            return (
              <div key={m} className={`year__cell year__cell--${state}`}>
                <span className="year__mark" aria-hidden="true">{state === 'now' ? '🌼' : state === 'past' ? '·' : ''}</span>
                <span className="year__month">{m}</span>
              </div>
            );
          })}
        </div>
        <p className="year__cap">This is your first season — watch it fill in, one bloom at a time. 🌱</p>
      </main>

      <TabBar active={tab} onChange={onTabChange} />
    </div>
  );
}
