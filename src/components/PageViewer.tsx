/* Whole straightened page at fit-to-width. Pinch and drag are free.
   Nothing on the page is marked. */

import { useRef, useState } from 'react';

interface PageViewerProps {
  pages: string[];
  onClose: () => void;
  mark?: boolean;
}

export default function PageViewer({ pages, onClose, mark = false }: PageViewerProps) {
  const [scale, setScale] = useState(1);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef({ scale: 1, x: 0, y: 0, dist: 0, cx: 0, cy: 0 });

  function points() {
    return [...pointers.current.values()];
  }

  function span(pts: { x: number; y: number }[]) {
    if (pts.length < 2) return 0;
    return Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
  }

  function center(pts: { x: number; y: number }[]) {
    const n = pts.length || 1;
    return {
      x: pts.reduce((sum, p) => sum + p.x, 0) / n,
      y: pts.reduce((sum, p) => sum + p.y, 0) / n,
    };
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const pts = points();
    const mid = center(pts);
    gesture.current = { scale, x: origin.x, y: origin.y, dist: span(pts), cx: mid.x, cy: mid.y };
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const pts = points();
    const mid = center(pts);
    if (pts.length >= 2 && gesture.current.dist > 0) {
      const next = Math.min(6, Math.max(1, gesture.current.scale * (span(pts) / gesture.current.dist)));
      const dx = mid.x - gesture.current.cx;
      const dy = mid.y - gesture.current.cy;
      setScale(next);
      setOrigin({ x: gesture.current.x + dx, y: gesture.current.y + dy });
      return;
    }
    if (pts.length === 1) {
      setOrigin({
        x: gesture.current.x + (mid.x - gesture.current.cx),
        y: gesture.current.y + (mid.y - gesture.current.cy),
      });
    }
  }

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    pointers.current.delete(event.pointerId);
    const pts = points();
    const mid = center(pts);
    gesture.current = { scale, x: origin.x, y: origin.y, dist: span(pts), cx: mid.x, cy: mid.y };
  }

  return (
    <div className={`page-viewer${mark ? ' scan-shot-mark' : ''}`} role="dialog" aria-label="Straightened page">
      <div className="page-viewer__bar">
        <button type="button" className="page-viewer__close" onClick={onClose} aria-label="Close page">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
      <div
        className="page-viewer__stage"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          className="page-viewer__sheet"
          style={{ transform: `translate(${origin.x}px, ${origin.y}px) scale(${scale})` }}
        >
          {pages.map((src) => (
            <img key={src} src={src} alt="Straightened homework page" draggable={false} />
          ))}
        </div>
      </div>
    </div>
  );
}
