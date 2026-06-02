/* SectionBanner — the header for one course section.
   Green when reachable; muted with a lock when not yet unlocked. */

import type { Section } from '../data/course';

export default function SectionBanner({ section }: { section: Section }) {
  const locked = section.status === 'locked';
  return (
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
      {locked && (
        <svg className="section-banner__lock" viewBox="0 0 24 24" width="22" height="22"
             fill="none" stroke="currentColor" strokeWidth="2"
             strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="5" y="11" width="14" height="9" rx="2.2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
      )}
    </header>
  );
}
