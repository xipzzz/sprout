/* SettingsScreen — a few calm preferences, a gentle "start over", and an
   about line. Preferences persist locally; "Calmer motion" actually reduces
   animations app-wide via a body class. */

import { useState } from 'react';

interface SettingsScreenProps {
  onBack: () => void;
}

type Prefs = { sound: boolean; reminders: boolean; calmMotion: boolean };
const DEFAULTS: Prefs = { sound: true, reminders: true, calmMotion: false };

function loadPrefs(): Prefs {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem('sprout.prefs') || '{}') };
  } catch {
    return DEFAULTS;
  }
}

const ROWS: { key: keyof Prefs; label: string; hint: string }[] = [
  { key: 'sound', label: 'Sound effects', hint: 'Gentle chimes during lessons' },
  { key: 'reminders', label: 'Gentle reminders', hint: 'A soft nudge — never nagging' },
  { key: 'calmMotion', label: 'Calmer motion', hint: 'Reduce gentle animations' },
];

export default function SettingsScreen({ onBack }: SettingsScreenProps) {
  const [prefs, setPrefs] = useState<Prefs>(loadPrefs);
  const [confirmReset, setConfirmReset] = useState(false);

  function toggle(key: keyof Prefs) {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    try { localStorage.setItem('sprout.prefs', JSON.stringify(next)); } catch { /* ignore */ }
    if (key === 'calmMotion') document.body.classList.toggle('calm-motion', next.calmMotion);
  }

  function resetProgress() {
    try { localStorage.removeItem('sprout.completed.v1'); } catch { /* ignore */ }
    window.location.reload();
  }

  return (
    <div className="screen settings">
      <header className="streak__top">
        <button type="button" className="lesson__close" onClick={onBack} aria-label="Back">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
               strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <h1 className="streak__title">Settings</h1>
      </header>

      <main className="screen__body settings__body">
        <ul className="settings__list">
          {ROWS.map((r) => (
            <li key={r.key} className="settings__row">
              <span className="settings__row-text">
                <span className="settings__row-label">{r.label}</span>
                <span className="settings__row-hint">{r.hint}</span>
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={prefs[r.key]}
                aria-label={r.label}
                className={`switch${prefs[r.key] ? ' switch--on' : ''}`}
                onClick={() => toggle(r.key)}
              >
                <span className="switch__knob" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>

        <h2 className="settings__section">Your garden</h2>
        {!confirmReset ? (
          <button type="button" className="settings__reset" onClick={() => setConfirmReset(true)}>
            Start the garden over
          </button>
        ) : (
          <div className="settings__confirm">
            <p className="settings__confirm-text">This clears your progress and plants a fresh seed. Your blooms will regrow as you learn — nothing is lost forever.</p>
            <div className="settings__confirm-row">
              <button type="button" className="settings__cancel" onClick={() => setConfirmReset(false)}>Keep my garden</button>
              <button type="button" className="settings__reset settings__reset--go" onClick={resetProgress}>Start over</button>
            </div>
          </div>
        )}

        <p className="settings__about">Sprout — grow a language, gently. 🌱<br />Version 1.0</p>
      </main>
    </div>
  );
}
