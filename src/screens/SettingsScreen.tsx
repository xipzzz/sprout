/* SettingsScreen — a few calm preferences, a gentle "start over", and an
   about line. Preferences persist locally; "Calmer motion" actually reduces
   animations app-wide via a body class. */

import { useState } from 'react';

interface SettingsScreenProps {
  onBack: () => void;
}

type ReminderTime = 'morning' | 'afternoon' | 'evening';
type ReminderCadence = 'gentle' | 'daily';
type Prefs = { sound: boolean; reminders: boolean; calmMotion: boolean; reminderTime: ReminderTime; reminderCadence: ReminderCadence };
type BoolPref = 'sound' | 'reminders' | 'calmMotion';
const DEFAULTS: Prefs = { sound: true, reminders: true, calmMotion: false, reminderTime: 'evening', reminderCadence: 'gentle' };

function loadPrefs(): Prefs {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem('sprout.prefs') || '{}') };
  } catch {
    return DEFAULTS;
  }
}

const ROWS: { key: BoolPref; label: string; hint: string }[] = [
  { key: 'sound', label: 'Sound effects', hint: 'Gentle chimes during lessons' },
  { key: 'reminders', label: 'Gentle reminders', hint: 'A soft nudge — never nagging' },
  { key: 'calmMotion', label: 'Calmer motion', hint: 'Reduce gentle animations' },
];
const TIMES: { id: ReminderTime; emoji: string; label: string }[] = [
  { id: 'morning', emoji: '☀️', label: 'Morning' },
  { id: 'afternoon', emoji: '🌤️', label: 'Afternoon' },
  { id: 'evening', emoji: '🌙', label: 'Evening' },
];
const CADENCES: { id: ReminderCadence; label: string }[] = [
  { id: 'gentle', label: 'Gentle' },
  { id: 'daily', label: 'Daily' },
];

export default function SettingsScreen({ onBack }: SettingsScreenProps) {
  const [prefs, setPrefs] = useState<Prefs>(loadPrefs);
  const [confirmReset, setConfirmReset] = useState(false);

  function persist(next: Prefs) {
    setPrefs(next);
    try { localStorage.setItem('sprout.prefs', JSON.stringify(next)); } catch { /* ignore */ }
  }
  function toggle(key: BoolPref) {
    const next = { ...prefs, [key]: !prefs[key] };
    persist(next);
    if (key === 'calmMotion') document.body.classList.toggle('calm-motion', next.calmMotion);
  }
  function update(patch: Partial<Prefs>) {
    persist({ ...prefs, ...patch });
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

        {prefs.reminders && (
          <div className="settings__reminder">
            <p className="settings__reminder-label">When should Pip nudge you?</p>
            <div className="settings__chips">
              {TIMES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`chip-opt${prefs.reminderTime === t.id ? ' chip-opt--on' : ''}`}
                  aria-pressed={prefs.reminderTime === t.id}
                  onClick={() => update({ reminderTime: t.id })}
                >
                  <span aria-hidden="true">{t.emoji}</span> {t.label}
                </button>
              ))}
            </div>
            <p className="settings__reminder-label">How often?</p>
            <div className="seg" role="group" aria-label="Reminder cadence">
              {CADENCES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`seg__opt${prefs.reminderCadence === c.id ? ' seg__opt--on' : ''}`}
                  aria-pressed={prefs.reminderCadence === c.id}
                  onClick={() => update({ reminderCadence: c.id })}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <p className="settings__reminder-foot">Reminders are gentle and never guilt you for a day off. 🌱</p>
          </div>
        )}

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
