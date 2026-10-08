/* Full straightened page, starting at fit-to-width.
   A question band is a client-side guess (printed words, or order on the page).
   Pinch and drag stay free. If nothing can be located, the page has no mark. */

import { useEffect, useRef, useState } from 'react';
import { bandFromOrder, findQuestionOnPage, type PageBand } from '../lib/scan/locate';

interface PageViewerProps {
  pages: string[];
  onClose: () => void;
  mark?: boolean;
  question?: { index: number; count: number; prompt: string } | null;
}

export default function PageViewer({ pages, onClose, mark = false, question = null }: PageViewerProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const [band, setBand] = useState<PageBand | null>(() => (
    question ? bandFromOrder(question.index, question.count) : null
  ));
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

  useEffect(() => {
    if (!question) return;
    let cancel = false;
    findQuestionOnPage(pages[0] || '', question.prompt, question.index, question.count).then((next) => {
      if (!cancel && next) setBand(next);
    });
    return () => { cancel = true; };
  }, [pages, question]);

  useEffect(() => {
    const stage = stageRef.current;
    const img = sheetRef.current?.querySelector('img');
    if (!stage || !img || !band) return;
    const frame = () => {
      const iw = img.clientWidth;
      const ih = img.clientHeight;
      if (!iw || !ih) return;
      const bandH = Math.max(1, band.h * ih);
      const next = Math.min(3, Math.max(1, (stage.clientHeight * 0.38) / bandH));
      const tx = stage.clientWidth / 2 - (band.x + band.w / 2) * iw * next;
      const ty = stage.clientHeight * 0.42 - (band.y + band.h / 2) * ih * next;
      setScale(next);
      setOrigin({ x: tx, y: ty });
    };
    if (img.complete) frame();
    else img.addEventListener('load', frame, { once: true });
  }, [band, pages]);

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
      <button type="button" className="page-viewer__close" onClick={onClose} aria-label="Close page">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
      <div
        ref={stageRef}
        className="page-viewer__stage"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          ref={sheetRef}
          className="page-viewer__sheet"
          style={{ transform: `translate(${origin.x}px, ${origin.y}px) scale(${scale})` }}
        >
          {pages.map((src) => (
            <img key={src} src={src} alt="Straightened homework page" draggable={false} />
          ))}
          {band && (
            <div
              className="page-viewer__highlight"
              style={{
                left: `${band.x * 100}%`,
                top: `${band.y * 100}%`,
                width: `${band.w * 100}%`,
                height: `${band.h * 100}%`,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
