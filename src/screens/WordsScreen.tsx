/* WordsScreen — a calm vocab hub: every word you've grown, with its picture,
   plus a gentle search to find one quickly. Vocabulary comes from the real
   lesson content, so it grows as more lessons are added. */

import { useState } from 'react';
import TabBar, { type TabKey } from '../components/TabBar';
import { vocabulary } from '../data/course';

interface WordsScreenProps {
  tab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export default function WordsScreen({ tab, onTabChange }: WordsScreenProps) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const shown = q ? vocabulary.filter((w) => w.word.includes(q)) : vocabulary;

  return (
    <div className="screen words">
      <header className="words__head">
        <h1 className="words__title">Words</h1>
        <p className="words__sub">{vocabulary.length} words growing 🌱</p>
        <div className="words__search">
          <span className="words__search-icon" aria-hidden="true">🔍</span>
          <input
            className="words__search-input"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search words…"
            aria-label="Search words"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          {query && (
            <button type="button" className="words__clear" onClick={() => setQuery('')} aria-label="Clear search">×</button>
          )}
        </div>
      </header>

      <main className="screen__body">
        {shown.length > 0 ? (
          <div className="word-grid">
            {shown.map((w) => (
              <button key={w.word} type="button" className="word-card" aria-label={w.word}>
                <span className="word-card__emoji" aria-hidden="true">{w.emoji}</span>
                <span className="word-card__label">{w.word}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="words__empty">
            <span className="words__empty-icon" aria-hidden="true">🌱</span>
            <p>No words match “{query}” yet — try another spelling.</p>
          </div>
        )}
      </main>

      <TabBar active={tab} onChange={onTabChange} />
    </div>
  );
}
