/* Parent page tools: year group, print (worksheet or with answer key), lock. */

import { useState } from 'react';
import type { ParentScan } from '../exam/types.ts';
import { PrintPreview } from '../print/PrintSheets.tsx';
import { useYearSettings } from './hooks.ts';
import { lockParent } from './pin.ts';
import { setYearGroup, YEAR_GROUPS } from './yearGroup.ts';
import './parent.css';

export default function ParentTools({ scan }: { scan: ParentScan }) {
  const settings = useYearSettings();
  const [printing, setPrinting] = useState<'worksheet' | 'with-key' | null>(null);

  return (
    <section className="parent-tools" aria-label="Parent tools">
      <div className="parent-tools__row">
        <p className="parent-tools__label" id="parent-year-label">
          Year group
        </p>
        <div className="parent-tools__years" role="radiogroup" aria-labelledby="parent-year-label">
          {YEAR_GROUPS.map((year) => (
            <button
              key={year}
              type="button"
              role="radio"
              aria-checked={settings.year === year}
              className={`parent-tools__year${settings.year === year ? ' is-on' : ''}`}
              onClick={() => setYearGroup(year)}
            >
              {year}
            </button>
          ))}
        </div>
      </div>
      <p className="parent-tools__hint">{settings.summary}</p>
      <div className="parent-tools__actions">
        <button type="button" className="exam-proto__secondary" onClick={() => setPrinting('worksheet')}>
          Print worksheet
        </button>
        <button type="button" className="exam-proto__secondary" onClick={() => setPrinting('with-key')}>
          Print with answer key
        </button>
      </div>
      <button type="button" className="exam-proto__text-btn parent-tools__lock" onClick={lockParent}>
        Lock parent page
      </button>
      {printing && (
        <PrintPreview
          job={{ kind: 'parent', scan, withKey: printing === 'with-key' }}
          settings={settings}
          onClose={() => setPrinting(null)}
        />
      )}
    </section>
  );
}
