/* GroveScreen — a calm, cooperative grove: a few people grow a shared garden.
   No ranks, no loss framing. A friendly leaderboard is opt-in (Settings). */

import TabBar, { type TabKey } from '../components/TabBar';

interface GroveScreenProps {
  tab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

const members = [
  { id: 'you', name: 'You', emoji: '🌱', leaves: 34 },
  { id: 'm1', name: 'Mia', emoji: '🌼', leaves: 52 },
  { id: 'm2', name: 'Leo', emoji: '🌿', leaves: 41 },
  { id: 'm3', name: 'Ava', emoji: '🌸', leaves: 28 },
  { id: 'm4', name: 'Sam', emoji: '🌻', leaves: 19 },
];
const GOAL = 250;

export default function GroveScreen({ tab, onTabChange }: GroveScreenProps) {
  const total = members.reduce((sum, m) => sum + m.leaves, 0);
  const pct = Math.min(100, Math.round((total / GOAL) * 100));

  return (
    <div className="screen grove">
      <header className="grove__head">
        <h1>Grove</h1>
        <p>You + {members.length - 1} friends growing a shared garden 🌳</p>
      </header>

      <main className="screen__body">
        <section className="grove__shared">
          <p className="grove__shared-label">This week's grove garden</p>
          <p className="grove__shared-count">{total} 🍃</p>
          <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={GOAL} aria-valuenow={total}>
            <div className="progress__fill" style={{ width: `${pct}%` }} />
          </div>
          <p className="grove__shared-goal">{total} of {GOAL} leaves toward a Golden Bloom for everyone</p>
        </section>

        <ul className="grove__members">
          {members.map((m) => (
            <li key={m.id} className="grove__member">
              <span className="grove__member-avatar" aria-hidden="true">{m.emoji}</span>
              <span className="grove__member-name">{m.name}</span>
              <span className="grove__member-leaves">{m.leaves} 🍃</span>
            </li>
          ))}
        </ul>

        <p className="grove__note">
          No ranks here — you grow together. You can turn on a friendly leaderboard anytime in Settings.
        </p>
      </main>

      <TabBar active={tab} onChange={onTabChange} />
    </div>
  );
}
