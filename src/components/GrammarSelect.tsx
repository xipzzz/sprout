/* GrammarSelect — pick the form that fits (is / are / am).
   Large stacked buttons, easy for small hands. */

import { useMemo } from 'react';

interface GrammarSelectProps {
  before: string;
  after: string;
  options: string[];
  answer: string;
  value: string;
  revealed: boolean;
  onChange: (form: string) => void;
}

function shuffle(arr: string[], seed: string): string[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  let s = h >>> 0;
  const rand = () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function GrammarSelect({ before, after, options, answer, value, revealed, onChange }: GrammarSelectProps) {
  const ordered = useMemo(() => shuffle(options, `${before}:${answer}`), [options, before, answer]);
  return (
    <div className="grammar">
      <p className="mc__cue">Pick the right form</p>
      <p className="cloze__card">
        <span>{before} </span>
        <span className={`cloze__slot${value ? ' cloze__slot--filled' : ''}`}>{value || ''}</span>
        <span> {after}</span>
      </p>
      <div className="grammar__list">
        {ordered.map((opt) => {
          let cls = 'grammar__opt';
          if (revealed && opt.toLowerCase() === answer.toLowerCase()) cls += ' grammar__opt--correct';
          else if (revealed && opt === value) cls += ' grammar__opt--wrong';
          else if (opt === value) cls += ' grammar__opt--selected';
          return (
            <button
              key={opt}
              type="button"
              className={cls}
              disabled={revealed}
              aria-pressed={opt === value}
              onClick={() => onChange(opt)}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
