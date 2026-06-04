/* ListenType — audio exercise. A word is read aloud via the browser's built-in
   text-to-speech (no network, no key). Two modes:
   - default: TYPE what you hear (text input)
   - tile mode (when `options` given): TAP what you hear — easier, kid-friendly.
   The big speaker button is the reliable replay. Calm: a wrong try still teaches. */

import { useEffect, useMemo, useRef } from 'react';

interface ListenTypeProps {
  word: string;
  value: string;
  revealed: boolean;
  onChange: (v: string) => void;
  options?: string[]; // when present → tap-a-tile mode
}

function speak(word: string) {
  try {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(word);
    u.lang = 'en-US';
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  } catch {
    /* speech unavailable — the answer still reveals on check */
  }
}

/* Deterministic shuffle so the heard word isn't always in the same spot. */
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

export default function ListenType({ word, value, revealed, onChange, options }: ListenTypeProps) {
  const spoken = useRef(false);
  useEffect(() => { if (!spoken.current) { spoken.current = true; speak(word); } }, [word]);

  const tiles = useMemo(() => (options && options.length ? shuffle(options, word) : []), [options, word]);
  const tileMode = tiles.length > 0;

  return (
    <div className="listen">
      <p className="mc__cue">{tileMode ? 'Tap what you hear' : 'Type what you hear'}</p>
      <button type="button" className="listen__play" onClick={() => speak(word)} aria-label="Play the word again">
        <span className="listen__play-icon" aria-hidden="true">🔊</span>
      </button>

      {tileMode ? (
        <div className="listen__tiles">
          {tiles.map((opt) => (
            <button
              key={opt}
              type="button"
              className={`listen__tile${value === opt ? ' listen__tile--sel' : ''}`}
              disabled={revealed}
              aria-pressed={value === opt}
              onClick={() => onChange(opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      ) : (
        <input
          className="fill__input listen__input"
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
          aria-label="type what you hear"
          placeholder="Type the word…"
        />
      )}
    </div>
  );
}
