/* ArrangeWords — build a sentence from word tiles.
   - Tap a bank tile to add it to the end.
   - DRAG a placed tile left/right to reorder it (pointer-based, works on
     touch + mouse).
   - Tap a placed tile (without dragging) to send it back to the bank.
   Reports the built word order up via onChange. */

import { useRef, useState } from 'react';

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

  const [dragId, setDragId] = useState<string | null>(null);
  const drag = useRef<{ id: string; moved: boolean; x: number; y: number } | null>(null);
  const buildRef = useRef<HTMLDivElement>(null);

  function commit(ids: string[]) {
    setPlaced(ids);
    onChange(ids.map(wordOf));
  }

  function onPointerDown(e: React.PointerEvent, id: string) {
    if (revealed) return;
    drag.current = { id, moved: false, x: e.clientX, y: e.clientY };
    setDragId(id);
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* synthetic events */ }
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current) return;
    // Ignore tiny jitter so a tap (to remove) isn't misread as a drag.
    if (!drag.current.moved) {
      const dist = Math.hypot(e.clientX - drag.current.x, e.clientY - drag.current.y);
      if (dist < 6) return;
    }
    drag.current.moved = true;
    // Which placed tile is the pointer currently over?
    const els = Array.from(buildRef.current?.querySelectorAll<HTMLElement>('[data-pid]') ?? []);
    let overId: string | null = null;
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
        overId = el.dataset.pid ?? null;
        break;
      }
    }
    if (overId && overId !== drag.current.id) {
      const next = [...placed];
      const from = next.indexOf(drag.current.id);
      const to = next.indexOf(overId);
      if (from !== -1 && to !== -1) {
        next.splice(from, 1);
        next.splice(to, 0, drag.current.id);
        commit(next);
      }
    }
  }

  function onPointerUp() {
    const d = drag.current;
    drag.current = null;
    setDragId(null);
    if (!d) return;
    if (!d.moved) commit(placed.filter((x) => x !== d.id)); // a tap (no drag) removes it
  }

  return (
    <div className="arrange">
      <p className="mc__cue">{prompt}</p>

      <div className="arrange__build" aria-label="Your sentence" ref={buildRef}>
        {placed.length === 0 && <span className="arrange__hint">Tap the words below…</span>}
        {placed.map((id) => (
          <button
            key={id}
            type="button"
            data-pid={id}
            className={`word-tile word-tile--placed${dragId === id ? ' word-tile--dragging' : ''}`}
            disabled={revealed}
            onPointerDown={(e) => onPointerDown(e, id)}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
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
            className="word-tile"
            disabled={revealed}
            onClick={() => commit([...placed, t.id])}
          >
            {t.word}
          </button>
        ))}
      </div>

      {placed.length > 0 && !revealed && (
        <p className="arrange__tip">Drag a word to reorder · tap it to remove</p>
      )}
    </div>
  );
}
