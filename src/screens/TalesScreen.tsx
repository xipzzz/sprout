/* TalesScreen — Garden Tales: a small library of calm reading stories, a
   page-by-page reader, and a gentle "Tale complete" moment. One component,
   three views (library → reader → complete) driven by local state. */

import { useState } from 'react';
import Pip from '../components/Pip';
import { tales, type Tale } from '../data/tales';

interface TalesScreenProps {
  onBack: () => void;
}

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
         strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}

export default function TalesScreen({ onBack }: TalesScreenProps) {
  const [selected, setSelected] = useState<Tale | null>(null);
  const [page, setPage] = useState(0);

  function openTale(t: Tale) { setSelected(t); setPage(0); }
  function closeTale() { setSelected(null); setPage(0); }

  // ---- Library ----
  if (!selected) {
    return (
      <div className="screen tales">
        <header className="streak__top">
          <button type="button" className="lesson__close" onClick={onBack} aria-label="Back"><BackIcon /></button>
          <h1 className="streak__title">Garden Tales</h1>
        </header>
        <main className="screen__body tales__body">
          <p className="tales__intro">Short stories to read together. 🌿</p>
          <ul className="tales__list">
            {tales.map((t) => (
              <li key={t.id}>
                <button type="button" className="tale-card" onClick={() => openTale(t)}>
                  <span className="tale-card__cover" aria-hidden="true">{t.cover}</span>
                  <span className="tale-card__text">
                    <span className="tale-card__title">{t.title}</span>
                    <span className="tale-card__blurb">{t.blurb}</span>
                  </span>
                  <span className="tale-card__chev" aria-hidden="true">›</span>
                </button>
              </li>
            ))}
          </ul>
        </main>
      </div>
    );
  }

  const pages = selected.pages;

  // ---- Tale complete ----
  if (page >= pages.length) {
    return (
      <div className="screen tale-done">
        <div className="tale-done__center">
          <Pip className="tale-done__pip" />
          <span className="tale-done__badge" aria-hidden="true">🌸</span>
          <h1 className="tale-done__title">Tale complete!</h1>
          <p className="tale-done__sub">You read “{selected.title}”. A new bloom opened in your garden. 🌱</p>
        </div>
        <button type="button" className="btn-primary tale-done__cta" onClick={closeTale}>Back to tales</button>
      </div>
    );
  }

  // ---- Reader ----
  const p = pages[page];
  const last = page === pages.length - 1;
  return (
    <div className="screen tale-read">
      <header className="streak__top">
        <button type="button" className="lesson__close" onClick={closeTale} aria-label="Close story"><BackIcon /></button>
        <h1 className="streak__title">{selected.title}</h1>
      </header>

      <div className="tale-read__dots" aria-label={`Page ${page + 1} of ${pages.length}`}>
        {pages.map((_, i) => (
          <span key={i} className={`tale-read__dot${i === page ? ' tale-read__dot--on' : i < page ? ' tale-read__dot--past' : ''}`} />
        ))}
      </div>

      <main className="screen__body tale-read__body">
        <div className="tale-read__scene" aria-hidden="true">{p.scene}</div>
        <p className="tale-read__text">{p.text}</p>
      </main>

      <footer className="tale-read__foot">
        <button type="button" className="tale-read__back" onClick={() => setPage((n) => Math.max(0, n - 1))} disabled={page === 0}>
          Back
        </button>
        <button type="button" className="btn-primary tale-read__next" onClick={() => setPage((n) => n + 1)}>
          {last ? 'Finish' : 'Next'}
        </button>
      </footer>
    </div>
  );
}
