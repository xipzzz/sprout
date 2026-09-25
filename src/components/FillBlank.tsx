/* FillBlank — complete the sentence.
   - default: TYPE the missing word
   - tile mode (when `tiles` given): TAP a word into the blank
   Autofill/password-manager bar is suppressed on the typed input. */

import { useMemo } from 'react';

interface FillBlankProps {
  before: string;
  after: string;
  value: string;
  revealed: boolean;
  onChange: (v: string) => void;
  tiles?: string[];
  answer?: string;
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

export default function FillBlank({ before, after, value, revealed, onChange, tiles, answer }: FillBlankProps) {
  const tileMode = !!tiles?.length;
  const ordered = useMemo(
    () => (tiles?.length ? shuffle(tiles, `${before}:${answer ?? ''}`) : []),
    [tiles, before, answer],
  );

  if (tileMode) {
    return (
      <div className="fill">
        <p className="mc__cue">Tap a word into the blank</p>
        <p className="fill__sentence">
          <span>{before} </span>
          <button
            type="button"
            className={`fill__slot${value ? ' fill__slot--filled' : ''}`}
            disabled={revealed || !value}
            onClick={() => onChange('')}
            aria-label={value ? `Chosen word ${value}. Tap to clear.` : 'Empty blank'}
          >
            {value || '____'}
          </button>
          <span> {after}</span>
        </p>
        <div className="fill__bank" aria-label="Word tiles">
          {ordered.map((tile) => (
            <button
              key={tile}
              type="button"
              className={`word-tile${value === tile ? ' word-tile--ghost' : ''}`}
              disabled={revealed || value === tile}
              onClick={() => onChange(tile)}
            >
              {tile}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="fill">
      <p className="mc__cue">Type the missing word</p>
      <p className="fill__sentence">
        <span>{before} </span>
        <input
          className="fill__input"
          type="text"
          value={value}
          disabled={revealed}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          inputMode="text"
          enterKeyHint="done"
          aria-label="missing word"
          placeholder="…"
        />
        <span> {after}</span>
      </p>
    </div>
  );
}
