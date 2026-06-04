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

function ChoicePicture({ choice }: { choice: Choice }) {
  switch (choice.id) {
    case 'door':
      return (
        <svg className="choice__art" viewBox="0 0 120 120" aria-hidden="true">
          <rect x="30" y="12" width="60" height="96" rx="7" fill="#8a4f2c" />
          <rect x="39" y="21" width="42" height="78" rx="3" fill="#b86a3a" />
          <path d="M45 30h30M45 58h30M45 86h30" stroke="#6f3d22" strokeWidth="6" strokeLinecap="round" />
          <circle cx="75" cy="62" r="5" fill="#f2c44f" />
          <rect x="23" y="107" width="74" height="8" rx="4" fill="#d8a065" opacity="0.7" />
        </svg>
      );
    case 'window':
      return (
        <svg className="choice__art" viewBox="0 0 120 120" aria-hidden="true">
          <rect x="16" y="20" width="88" height="72" rx="8" fill="#8a4f2c" />
          <rect x="26" y="30" width="68" height="52" rx="3" fill="#bfe7ff" />
          <path d="M60 30v52M26 56h68" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" />
          <circle cx="78" cy="42" r="9" fill="#ffd45a" />
          <path d="M28 74c12-10 22-9 34 0s20 9 32-2v10H28z" fill="#7fc4e8" opacity="0.75" />
          <rect x="22" y="90" width="76" height="8" rx="4" fill="#6f3d22" />
        </svg>
      );
    case 'bed':
      return (
        <svg className="choice__art" viewBox="0 0 120 120" aria-hidden="true">
          <rect x="15" y="43" width="20" height="55" rx="5" fill="#8a4f2c" />
          <rect x="92" y="55" width="13" height="43" rx="5" fill="#8a4f2c" />
          <rect x="31" y="57" width="69" height="31" rx="7" fill="#74b7e8" />
          <rect x="37" y="48" width="30" height="19" rx="8" fill="#f7fbff" />
          <path d="M29 86h76" stroke="#5f351f" strokeWidth="7" strokeLinecap="round" />
        </svg>
      );
    case 'chair':
      return (
        <svg className="choice__art" viewBox="0 0 120 120" aria-hidden="true">
          <path d="M42 21l38 10v38l-38-10z" fill="#b86a3a" stroke="#7d4528" strokeWidth="6" strokeLinejoin="round" />
          <path d="M37 62h51l-10 22H47z" fill="#c97845" stroke="#7d4528" strokeWidth="6" strokeLinejoin="round" />
          <path d="M48 81v28M77 81v28M85 59v44" stroke="#7d4528" strokeWidth="7" strokeLinecap="round" />
        </svg>
      );
    case 'lamp':
      return (
        <svg className="choice__art" viewBox="0 0 120 120" aria-hidden="true">
          <path d="M43 17h34l15 41H28z" fill="#ffd66f" stroke="#b86a3a" strokeWidth="6" strokeLinejoin="round" />
          <path d="M60 58v41M43 103h34" stroke="#7d4528" strokeWidth="8" strokeLinecap="round" />
          <circle cx="60" cy="72" r="8" fill="#f7a64a" />
        </svg>
      );
    default:
      return <span className="choice__emoji" aria-hidden="true">{choice.emoji}</span>;
  }
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
              <ChoicePicture choice={c} />
              {/* Word hidden while answering. Shown on reveal to reinforce it. */}
              {revealed && <span className="choice__label">{c.label}</span>}
              {/* Color-blind-safe state badge on reveal (per the design: ✓/✗). */}
              {revealed && c.id === answerId && (
                <span className="choice__badge choice__badge--ok" aria-hidden="true">✓</span>
              )}
              {revealed && c.id === selectedId && c.id !== answerId && (
                <span className="choice__badge choice__badge--no" aria-hidden="true">✗</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
