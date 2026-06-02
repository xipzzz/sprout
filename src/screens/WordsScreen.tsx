/* WordsScreen — a calm vocab hub: the words you've grown, with their pictures. */

import TabBar, { type TabKey } from '../components/TabBar';

interface WordsScreenProps {
  tab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

const words = [
  { id: 'door', word: 'door', emoji: '🚪' },
  { id: 'window', word: 'window', emoji: '🪟' },
  { id: 'chair', word: 'chair', emoji: '🪑' },
  { id: 'bed', word: 'bed', emoji: '🛏️' },
  { id: 'lamp', word: 'lamp', emoji: '💡' },
  { id: 'clock', word: 'clock', emoji: '🕐' },
  { id: 'book', word: 'book', emoji: '📖' },
  { id: 'key', word: 'key', emoji: '🔑' },
];

export default function WordsScreen({ tab, onTabChange }: WordsScreenProps) {
  return (
    <div className="screen words">
      <header className="words__head">
        <h1 className="words__title">Words</h1>
        <p className="words__sub">{words.length} words growing 🌱</p>
      </header>

      <main className="screen__body">
        <div className="word-grid">
          {words.map((w) => (
            <button key={w.id} type="button" className="word-card" aria-label={w.word}>
              <span className="word-card__emoji" aria-hidden="true">{w.emoji}</span>
              <span className="word-card__label">{w.word}</span>
            </button>
          ))}
        </div>
      </main>

      <TabBar active={tab} onChange={onTabChange} />
    </div>
  );
}
