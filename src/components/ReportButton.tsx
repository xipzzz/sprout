/* ReportButton — a small corner "flag" for review/QA. Tap it, add a note, and
   it captures the current screen (html2canvas) and opens the device share
   sheet (or downloads the PNG as a fallback). So you can snap a screen +
   comment and send it on, right from the app.

   Hidden by default. Enable by visiting the site with ?qa=1 (persists), turn
   off with ?qa=0 — so it never shows for real learners. */

import { useState } from 'react';

function qaEnabled(): boolean {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('qa') === '1') localStorage.setItem('sprout.qa', '1');
    if (params.get('qa') === '0') localStorage.removeItem('sprout.qa');
    return localStorage.getItem('sprout.qa') === '1';
  } catch {
    return false;
  }
}

export default function ReportButton() {
  const [on] = useState(qaEnabled);
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');

  if (!on) return null;

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(''), 1800);
  }

  async function capture() {
    setBusy(true);
    setOpen(false);
    // Let the sheet/button disappear before snapping so they aren't in the shot.
    await new Promise((r) => window.setTimeout(r, 80));
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(document.body, { backgroundColor: '#f5f0e7', scale: 2, useCORS: true });
      const blob: Blob | null = await new Promise((res) => canvas.toBlob((b) => res(b), 'image/png'));
      if (!blob) throw new Error('no blob');
      const file = new File([blob], 'sprout-report.png', { type: 'image/png' });
      const where = window.location.hash || window.location.pathname;
      const text = `Sprout report — ${where}\nNote: ${note || '(none)'}`;
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
      if (nav.canShare && nav.canShare({ files: [file] })) {
        await nav.share({ files: [file], text, title: 'Sprout report' });
        flash('Shared ✓');
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sprout-report.png';
        a.click();
        URL.revokeObjectURL(url);
        flash('Saved ✓');
      }
    } catch {
      flash('Could not capture');
    } finally {
      setBusy(false);
      setNote('');
    }
  }

  return (
    <>
      {!open && (
        <button type="button" className="report-fab" onClick={() => setOpen(true)} aria-label="Report an issue">
          <span aria-hidden="true">🚩</span>
        </button>
      )}

      {open && (
        <div className="report-sheet" role="dialog" aria-label="Report an issue">
          <p className="report-sheet__title">Report this screen</p>
          <textarea
            className="report-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What looks wrong here? (optional)"
            rows={3}
          />
          <div className="report-row">
            <button type="button" className="report-cancel" onClick={() => setOpen(false)} disabled={busy}>Cancel</button>
            <button type="button" className="btn-primary report-send" onClick={capture} disabled={busy}>
              {busy ? 'Capturing…' : 'Capture & send'}
            </button>
          </div>
        </div>
      )}

      {toast && <div className="report-toast" role="status">{toast}</div>}
    </>
  );
}
