/* MultipleChoice — "tap the picture for {word}". Picture choices as cards.
   After the answer is checked (revealed=true): the correct card turns green,
   a wrong pick turns warm clay (never red). */

import { useMemo } from 'react';
import type { Choice } from '../data/course';

interface MultipleChoiceProps {
  word: string;
  choices: Choice[];
  selectedId: string | null;
  answerId: string;
  revealed: boolean;
  onSelect: (id: string) => void;
}

/* Deterministic shuffle: the correct answer must NOT always be first, but the
   order has to stay stable for a given exercise (no reshuffle on re-render,
   so cards don't jump when you tap or when the answer reveals). Seeded by the
   exercise so each one has its own fixed-but-varied order. */
function shuffleChoices(choices: Choice[], seedStr: string): Choice[] {
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i++) { h ^= seedStr.charCodeAt(i); h = Math.imul(h, 16777619); }
  let s = h >>> 0;
  const rand = () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const a = choices.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MultipleChoice({
  word, choices, selectedId, answerId, revealed, onSelect,
}: MultipleChoiceProps) {
  const ordered = useMemo(() => shuffleChoices(choices, `${word}:${answerId}`), [choices, word, answerId]);
  return (
    <div className="mc">
      <p className="mc__cue">Tap the picture for</p>
      <h2 className="mc__word">{word}</h2>
      <div className="mc__grid">
        {ordered.map((c) => {
          let cls = 'choice';
          if (revealed && c.id === answerId) cls += ' choice--correct';
          else if (revealed && c.id === selectedId) cls += ' choice--wrong';
          else if (c.id === selectedId) cls += ' choice--selected';
          return (
            <button
              key={c.id}
              type="button"
              className={cls}
              disabled={revealed}
              aria-label={c.label}
              aria-pressed={c.id === selectedId}
              onClick={() => onSelect(c.id)}
            >
              <span className="choice__emoji" aria-hidden="true">{c.emoji}</span>
              {/* Word hidden while answering (no giveaway); shown on reveal to reinforce it. */}
              {revealed && <span className="choice__label">{c.label}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
