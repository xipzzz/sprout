/* MatchPairs — match each word (left) to its picture (right).
   Tap a word then its picture: a correct pair locks in (green, fades);
   a wrong pair flashes warm clay and clears. Done when all pairs are found.
   In audio mode each word also plays aloud (🔊) when tapped — hear it as you match. */

import { useState } from 'react';

interface Pair {
  id: string;
  word: string;
  emoji: string;
}

interface MatchPairsProps {
  pairs: Pair[];
  revealed: boolean;
  audio?: boolean;
  onChange: (matchedIds: string[]) => void;
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
    /* speech unavailable */
  }
}

export default function MatchPairs({ pairs, revealed, audio, onChange }: MatchPairsProps) {
  const words = pairs;
  const [emojis] = useState(() => [...pairs].reverse()); // stable, different order from words
  const [selWord, setSelWord] = useState<string | null>(null);
  const [selEmoji, setSelEmoji] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string[]>([]);

  function evaluate(w: string | null, e: string | null) {
    if (!w || !e) return;
    if (w === e) {
      const m = [...matched, w];
      setMatched(m);
      onChange(m);
      setSelWord(null);
      setSelEmoji(null);
    } else {
      setWrong([w, e]);
      setTimeout(() => {
        setWrong([]);
        setSelWord(null);
        setSelEmoji(null);
      }, 450);
    }
  }

  function pickWord(id: string) {
    if (revealed || matched.includes(id) || wrong.length) return;
    if (audio) { const p = words.find((w) => w.id === id); if (p) speak(p.word); }
    setSelWord(id);
    evaluate(id, selEmoji);
  }
  function pickEmoji(id: string) {
    if (revealed || matched.includes(id) || wrong.length) return;
    setSelEmoji(id);
    evaluate(selWord, id);
  }

  function cls(id: string, sel: string | null) {
    let c = 'match-card';
    if (matched.includes(id)) c += ' match-card--matched';
    else if (wrong.includes(id)) c += ' match-card--wrong';
    else if (sel === id) c += ' match-card--selected';
    return c;
  }

  return (
    <div className="match">
      <p className="mc__cue">{audio ? 'Match the words — tap to hear them' : 'Match the words to their pictures'}</p>
      <div className="match__grid">
        <div className="match__col">
          {words.map((w) => (
            <button
              key={w.id}
              type="button"
              className={cls(w.id, selWord)}
              disabled={revealed || matched.includes(w.id)}
              onClick={() => pickWord(w.id)}
            >
              {w.word}
              {audio && <span className="match-card__spk" aria-hidden="true">🔊</span>}
            </button>
          ))}
        </div>
        <div className="match__col">
          {emojis.map((e) => (
            <button
              key={e.id}
              type="button"
              className={cls(e.id, selEmoji)}
              disabled={revealed || matched.includes(e.id)}
              aria-label={e.word}
              onClick={() => pickEmoji(e.id)}
            >
              <span className="match-card__emoji" aria-hidden="true">{e.emoji}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
