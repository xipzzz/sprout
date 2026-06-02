/* ArrangeWords — tap word tiles (in order) to build a sentence.
   Tap a tile in the bank to add it; tap a placed tile to send it back.
   Reports the built word order up via onChange. */

import { useState } from 'react';

interface ArrangeWordsProps {
  prompt: string;
  tiles: string[];
  revealed: boolean;
  onChange: (built: string[]) => void;
}

export default function ArrangeWords({ prompt, tiles, revealed, onChange }: ArrangeWordsProps) {
  // Give each tile a stable id so duplicate words don't get confused.
  const tileObjs = tiles.map((word, i) => ({ id: String(i), word }));
  const [placed, setPlaced] = useState<string[]>([]);
  const used = new Set(placed);
  const bank = tileObjs.filter((t) => !used.has(t.id));
  const wordOf = (id: string) => tileObjs.find((t) => t.id === id)!.word;

  function update(ids: string[]) {
    setPlaced(ids);
    onChange(ids.map(wordOf));
  }

  return (
    <div className="arrange">
      <p className="mc__cue">{prompt}</p>

      <div className="arrange__build" aria-label="Your sentence">
        {placed.length === 0 && <span className="arrange__hint">Tap the words below…</span>}
        {placed.map((id) => (
          <button
            key={id}
            type="button"
            className="tile tile--placed"
            disabled={revealed}
            onClick={() => update(placed.filter((x) => x !== id))}
          >
            {wordOf(id)}
          </button>
        ))}
      </div>

      <div className="arrange__bank" aria-label="Word bank">
        {bank.map((t) => (
          <button
            key={t.id}
            type="button"
            className="tile"
            disabled={revealed}
            onClick={() => update([...placed, t.id])}
          >
            {t.word}
          </button>
        ))}
      </div>
    </div>
  );
}
