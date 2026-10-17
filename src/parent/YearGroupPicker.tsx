import { YEAR_GROUPS, YEAR_SETTINGS, type YearGroup } from './yearGroup.ts';

interface YearGroupPickerProps {
  onPick: (year: YearGroup) => void;
}

export default function YearGroupPicker({ onPick }: YearGroupPickerProps) {
  return (
    <section className="parent-gate__panel parent-year" data-screen="year-group-setup">
      <h2 className="parent-gate__title">Which year is your child in?</h2>
      <p className="parent-gate__text">
        This sets how simple the words are and how big the numbers get. You can change it later on the parent page.
      </p>
      <div className="parent-year__grid">
        {YEAR_GROUPS.map((year) => (
          <button key={year} type="button" className="parent-year__card" onClick={() => onPick(year)}>
            <span className="parent-year__name">{year}</span>
            <span className="parent-year__summary">{YEAR_SETTINGS[year].summary}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
