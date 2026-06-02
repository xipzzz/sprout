/* GardenScreen — the reward home. The blooms you grow by learning,
   a current seedling that grows with practice, and Monthly Blooms.
   (Content as data; earned blooms show their flower, others a seed.) */

import TabBar, { type TabKey } from '../components/TabBar';
import Pip from '../components/Pip';

interface GardenScreenProps {
  tab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

const blooms = [
  { id: 'b1', emoji: '🌼', label: 'Hello',          earned: true },
  { id: 'b2', emoji: '🌿', label: 'First Words',    earned: true },
  { id: 'b3', emoji: '🌸', label: 'Around the Home', earned: false },
  { id: 'b4', emoji: '🌻', label: 'Family',         earned: false },
  { id: 'b5', emoji: '🌷', label: 'Colors',         earned: false },
  { id: 'b6', emoji: '🪻', label: 'Numbers',        earned: false },
];

export default function GardenScreen({ tab, onTabChange }: GardenScreenProps) {
  const grown = blooms.filter((b) => b.earned).length;

  return (
    <div className="screen garden">
      <header className="garden__head">
        <h1 className="garden__title">Your Garden</h1>
        <p className="garden__sub">{grown} blooms grown · keep practicing to grow more 🌱</p>
      </header>

      <main className="screen__body">
        <div className="seedling">
          <Pip className="seedling__pip" />
          <p className="seedling__cap">Your seedling is growing</p>
        </div>

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
      </main>

      <TabBar active={tab} onChange={onTabChange} />
    </div>
  );
}
