/* Print button for the child practice screen. It only ever has the child view. */

import { useState } from 'react';
import type { ChildView } from '../exam/types.ts';
import { useYearSettings } from '../parent/hooks.ts';
import { PrintPreview } from './PrintSheets.tsx';

export default function PrintChildButton({ view }: { view: ChildView }) {
  const [open, setOpen] = useState(false);
  const settings = useYearSettings();
  return (
    <>
      <button type="button" className="exam-proto__secondary print-child-btn" onClick={() => setOpen(true)}>
        Print this worksheet
      </button>
      {open && <PrintPreview job={{ kind: 'child', view }} settings={settings} onClose={() => setOpen(false)} />}
    </>
  );
}
