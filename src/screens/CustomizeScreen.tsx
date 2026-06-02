/* CustomizeScreen — give Pip a little accessory. Choice persists locally. */

import { useState } from 'react';
import Pip from '../components/Pip';

interface CustomizeScreenProps {
  onBack: () => void;
}

const accessories = [
  { id: 'none', emoji: '', label: 'None' },
  { id: 'bow', emoji: '🎀', label: 'Bow' },
  { id: 'hat', emoji: '🎩', label: 'Hat' },
  { id: 'flower', emoji: '🌸', label: 'Flower' },
  { id: 'star', emoji: '⭐', label: 'Star' },
];

export default function CustomizeScreen({ onBack }: CustomizeScreenProps) {
  const [sel, setSel] = useState(() => {
    try { return localStorage.getItem('sprout.pipAccessory') || 'none'; } catch { return 'none'; }
  });
  function choose(id: string) {
    setSel(id);
    try { localStorage.setItem('sprout.pipAccessory', id); } catch { /* ignore */ }
  }
  const acc = accessories.find((a) => a.id === sel);

  return (
    <div className="screen customize">
      <header className="streak__top">
        <button type="button" className="lesson__close" onClick={onBack} aria-label="Back">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
               strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <h1 className="streak__title">Customize Pip</h1>
      </header>

      <main className="screen__body">
        <div className="customize__preview">
          <Pip className="customize__pip" />
          {acc?.emoji && <span className="customize__acc" aria-hidden="true">{acc.emoji}</span>}
        </div>

        <div className="customize__options">
          {accessories.map((a) => (
            <button
              key={a.id}
              type="button"
              className={`customize__opt${sel === a.id ? ' customize__opt--sel' : ''}`}
              aria-pressed={sel === a.id}
              onClick={() => choose(a.id)}
            >
              <span className="customize__opt-emoji" aria-hidden="true">{a.emoji || '🚫'}</span>
              <span className="customize__opt-label">{a.label}</span>
            </button>
          ))}
        </div>

        <p className="customize__note">Pip wears it proudly. 🌱</p>
      </main>
    </div>
  );
}
