/* SectionBanner — the header for one course section.
   Green when reachable; muted with a lock when not yet unlocked.
   A guidebook button opens a calm preview of unlocked section words
   and phrases (a "seed packet" peek at what each unit grows). */

import { useState } from 'react';
import Modal from './Modal';
import { sectionGuide } from '../data/course';
import type { Section } from '../data/course';

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v15H5.5A1.5 1.5 0 0 0 4 20.5z" />
      <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v15h5.5a1.5 1.5 0 0 1 1.5 1.5z" />
    </svg>
  );
}

export default function SectionBanner({ section }: { section: Section }) {
  const locked = section.status === 'locked';
  const [guideOpen, setGuideOpen] = useState(false);

  return (
    <>
      <header
        className={`section-banner${locked ? ' section-banner--locked' : ''}`}
        aria-label={`Section ${section.index}: ${section.title}${locked ? ' (locked)' : ''}`}
      >
        <div className="section-banner__text">
          <p className="section-banner__eyebrow">
            Section {section.index} · {section.units.length} units
          </p>
          <h2 className="section-banner__title">{section.title}</h2>
        </div>
        <button
          type="button"
          className="section-banner__guide"
          onClick={() => !locked && setGuideOpen(true)}
          disabled={locked}
          aria-label={locked
            ? `Guidebook for ${section.title} is locked`
            : `Guidebook for ${section.title}: key words and phrases`}
        >
          <BookIcon />
        </button>
        {locked && (
          <svg className="section-banner__lock" viewBox="0 0 24 24" width="22" height="22"
               fill="none" stroke="currentColor" strokeWidth="2"
               strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="5" y="11" width="14" height="9" rx="2.2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
        )}
      </header>

      {guideOpen && !locked && (
        <Modal onClose={() => setGuideOpen(false)}>
          <div className="guide">
            <header className="guide__head">
              <span className="guide__icon" aria-hidden="true">📖</span>
              <div>
                <p className="guide__eyebrow">Guidebook</p>
                <h3 className="guide__title">{section.title}</h3>
              </div>
            </header>
            <p className="guide__intro">A peek at the key words and phrases this section grows.</p>

            <div className="guide__units">
              {sectionGuide(section).map((u) => (
                <section key={u.unitId} className="guide-unit">
                  <h4 className="guide-unit__title">{u.title}</h4>
                  {u.words.length > 0 && (
                    <ul className="guide-unit__words">
                      {u.words.map((w) => (
                        <li key={w.word} className="guide-word">
                          <span className="guide-word__emoji" aria-hidden="true">{w.emoji}</span>
                          <span className="guide-word__label">{w.word}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {u.phrases.length > 0 && (
                    <ul className="guide-unit__phrases">
                      {u.phrases.map((p) => (
                        <li key={p} className="guide-phrase">“{p}”</li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>

            <button type="button" className="btn-primary guide__done" onClick={() => setGuideOpen(false)}>
              Close
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
