/* MeScreen — the learner's profile: a calm summary + links.
   (Links are placeholders for now; screens fill in per the roadmap.) */

import TabBar, { type TabKey } from '../components/TabBar';
import Pip from '../components/Pip';
import { hud } from '../data/course';

interface MeScreenProps {
  tab: TabKey;
  onTabChange: (tab: TabKey) => void;
  completed: string[];
  onOpenStreak: () => void;
  onOpenQuests: () => void;
  onOpenCustomize: () => void;
}

const links = [
  { id: 'streak', emoji: '🍃', label: 'Streak calendar' },
  { id: 'quests', emoji: '🎯', label: 'Quests' },
  { id: 'words', emoji: '📖', label: "Words I've grown" },
  { id: 'customize', emoji: '🎨', label: 'Customize Pip' },
  { id: 'invite', emoji: '💌', label: 'Invite a friend' },
  { id: 'settings', emoji: '⚙️', label: 'Settings' },
];

export default function MeScreen({ tab, onTabChange, completed, onOpenStreak, onOpenQuests, onOpenCustomize }: MeScreenProps) {
  const units = completed.length;
  const words = units * 4; // rough estimate until per-unit vocab is tracked

  return (
    <div className="screen me">
      <header className="me__head">
        <span className="me__avatar"><Pip /></span>
        <h1 className="me__name">Little Learner</h1>
        <p className="me__since">Growing your garden 🌱</p>
      </header>

      <main className="screen__body">
        <div className="me__tiles">
          <div className="tile"><span className="tile__icon" aria-hidden="true">🍃</span><span className="tile__num">{hud.leaves}</span><span className="tile__lbl">Leaves</span></div>
          <div className="tile"><span className="tile__icon" aria-hidden="true">🌳</span><span className="tile__num">{units}</span><span className="tile__lbl">Units</span></div>
          <div className="tile"><span className="tile__icon" aria-hidden="true">📖</span><span className="tile__num">{words}</span><span className="tile__lbl">Words</span></div>
        </div>

        <ul className="me__list">
          {links.map((l) => (
            <li key={l.id}>
              <button type="button" className="me__row" onClick={l.id === 'streak' ? onOpenStreak : l.id === 'quests' ? onOpenQuests : l.id === 'customize' ? onOpenCustomize : undefined}>
                <span className="me__row-icon" aria-hidden="true">{l.emoji}</span>
                <span className="me__row-label">{l.label}</span>
                <span className="me__row-chev" aria-hidden="true">›</span>
              </button>
            </li>
          ))}
        </ul>
      </main>

      <TabBar active={tab} onChange={onTabChange} />
    </div>
  );
}
