/* UnitBanner — the green "section / unit" header with a guidebook
   affordance (the little book button), as suggested in the review. */

interface UnitBannerProps {
  section: number;
  unit: number;
  title: string;
  onOpenGuide?: () => void;
}

export default function UnitBanner({ section, unit, title, onOpenGuide }: UnitBannerProps) {
  return (
    <section className="unit">
      <div className="unit__text">
        <p className="unit__eyebrow">Section {section} · Unit {unit}</p>
        <h1 className="unit__title">{title}</h1>
      </div>
      <button
        type="button"
        className="unit__guide"
        onClick={onOpenGuide}
        aria-label="Open guidebook for this unit"
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none"
             stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H17a1 1 0 0 1 1 1v13H6.5A2.5 2.5 0 0 0 4 20.5z" />
          <path d="M18 18a2 2 0 0 0 2 2" />
          <path d="M8 8h6M8 11h6" />
        </svg>
      </button>
    </section>
  );
}
