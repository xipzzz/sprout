/* ListenType — "Type what you hear": a word is read aloud using the browser's
   built-in text-to-speech (no network, no key), and the learner types it.
   The big speaker button is the reliable replay (some browsers require a tap
   before any audio plays). Calm: a wrong try still teaches and moves on. */

import { useEffect, useRef } from 'react';

interface ListenTypeProps {
  word: string;
  value: string;
  revealed: boolean;
  onChange: (v: string) => void;
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

export default function ListenType({ word, value, revealed, onChange }: ListenTypeProps) {
  const spoken = useRef(false);
  // Best-effort auto-play once when the exercise appears.
  useEffect(() => {
    if (!spoken.current) { spoken.current = true; speak(word); }
  }, [word]);

  return (
    <div className="listen">
      <p className="mc__cue">Type what you hear</p>
      <button type="button" className="listen__play" onClick={() => speak(word)} aria-label="Play the word again">
        <span className="listen__play-icon" aria-hidden="true">🔊</span>
      </button>
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
    </div>
  );
}
