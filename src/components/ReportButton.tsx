/* ReportButton — a small corner "flag" for review/QA. Tap it, and it shows the
   current screen name + a note field. "Copy report" puts a tidy text report on
   the clipboard (screen + note + URL) — the reliable path that works anywhere.
   "Capture image" additionally snaps the screen (html2canvas) to the device
   share sheet / a download.

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

/* Best-effort: name the screen behind the sheet from the DOM (the SPA has no
   URL per screen). First match wins, so list the most specific overlays first. */
function currentScreenName(): string {
  const map: [string, string][] = [
    ['.quit', 'Lesson · quit confirm'],
    ['.tale-read', 'Garden Tale · reading'],
    ['.tale-done', 'Tale complete'],
    ['.tales', 'Garden Tales'],
    ['.complete', 'Lesson complete'],
    ['.lesson', 'Lesson'],
    ['.bloom', 'Golden Bloom'],
    ['.daily', 'Daily goal met'],
    ['.settings', 'Settings'],
    ['.insights', 'Insights'],
    ['.invite', 'Invite a friend'],
    ['.customize', 'Customize Pip'],
    ['.streak', 'Streak calendar'],
    ['.quests', 'Quests'],
    ['.shop', 'Shop'],
    ['.words', 'Words'],
    ['.grove', 'Grove'],
    ['.garden', 'Garden'],
    ['.me', 'Me'],
  ];
  for (const [sel, name] of map) {
    if (document.querySelector(sel)) return name;
  }
  const tab = document.querySelector('.tab--active .tab__label');
  if (tab?.textContent) return tab.textContent.trim();
  return 'Sprout';
}

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to the legacy path */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export default function ReportButton() {
  const [on] = useState(qaEnabled);
  const [open, setOpen] = useState(false);
  const [screen, setScreen] = useState('Sprout');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');

  if (!on) return null;

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(''), 1800);
  }

  function openSheet() {
    setScreen(currentScreenName());
    setOpen(true);
  }

  function reportText(): string {
    return `Sprout QA report\nScreen: ${screen}\nNote: ${note.trim() || '(none)'}\nURL: ${window.location.href}`;
  }

  async function copyReport() {
    const ok = await copyText(reportText());
    flash(ok ? 'Copied ✓' : 'Copy failed');
    setNote('');
    setOpen(false);
  }

  async function captureImage() {
    setBusy(true);
    setOpen(false);
    await copyText(reportText()); // also leave the text report on the clipboard
    await new Promise((r) => window.setTimeout(r, 80)); // let the sheet vanish before the shot
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(document.body, { backgroundColor: '#f5f0e7', scale: 2, useCORS: true });
      const blob: Blob | null = await new Promise((res) => canvas.toBlob((b) => res(b), 'image/png'));
      if (!blob) throw new Error('no blob');
      const file = new File([blob], 'sprout-report.png', { type: 'image/png' });
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
      if (nav.canShare && nav.canShare({ files: [file] })) {
        await nav.share({ files: [file], text: reportText(), title: 'Sprout report' });
        flash('Shared ✓');
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sprout-report.png';
        a.click();
        URL.revokeObjectURL(url);
        flash('Saved ✓ (note copied)');
      }
    } catch {
      flash('Image failed (note copied)');
    } finally {
      setBusy(false);
      setNote('');
    }
  }

  return (
    <>
      {!open && (
        <button type="button" className="report-fab" onClick={openSheet} aria-label="Flag this screen for review">
          <span aria-hidden="true">🚩</span>
        </button>
      )}

      {open && (
        <div className="report-sheet" role="dialog" aria-label="Flag this screen">
          <p className="report-sheet__title">Flag this screen</p>
          <p className="report-screen"><span aria-hidden="true">📍</span> {screen}</p>
          <textarea
            className="report-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What looks wrong here? (optional)"
            rows={3}
          />
          <div className="report-row">
            <button type="button" className="report-cancel" onClick={() => setOpen(false)} disabled={busy}>Cancel</button>
            <button type="button" className="report-cap" onClick={captureImage} disabled={busy}>
              {busy ? '…' : 'Capture image'}
            </button>
            <button type="button" className="btn-primary report-send" onClick={copyReport} disabled={busy}>
              Copy report
            </button>
          </div>
        </div>
      )}

      {toast && <div className="report-toast" role="status">{toast}</div>}
    </>
  );
}
