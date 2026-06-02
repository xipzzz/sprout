/* MultipleChoice — "tap the picture for {word}". Picture choices as cards.
   After the answer is checked (revealed=true): the correct card turns green,
   a wrong pick turns warm clay (never red). */

import type { Choice } from '../data/course';

interface MultipleChoiceProps {
  word: string;
  choices: Choice[];
  selectedId: string | null;
  answerId: string;
  revealed: boolean;
  onSelect: (id: string) => void;
}

export default function MultipleChoice({
  word, choices, selectedId, answerId, revealed, onSelect,
}: MultipleChoiceProps) {
  return (
    <div className="mc">
      <p className="mc__cue">Tap the picture for</p>
      <h2 className="mc__word">{word}</h2>
      <div className="mc__grid">
        {choices.map((c) => {
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
              aria-pressed={c.id === selectedId}
              onClick={() => onSelect(c.id)}
            >
              <span className="choice__emoji" aria-hidden="true">{c.emoji}</span>
              <span className="choice__label">{c.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
