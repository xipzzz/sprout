/* OnboardingSplash — a calm 3-step welcome flow:
   1) branded splash, 2) a playful 2-question goal picker, 3) a reassurance
   screen (no streaks/guilt/ads). Picks persist locally; then onStart → path. */

import { useState } from 'react';
import Pip from '../components/Pip';

interface OnboardingSplashProps {
  onStart: () => void;
}

type Step = 'splash' | 'goal' | 'ready';
const WHO = [
  { id: 'me', emoji: '🙂', label: 'Me' },
  { id: 'child', emoji: '👧', label: 'My child' },
];
const PACE = [
  { id: 'little', emoji: '🌱', label: 'A little' },
  { id: 'steady', emoji: '🌿', label: 'Steady' },
  { id: 'lots', emoji: '🌳', label: 'Lots' },
];

export default function OnboardingSplash({ onStart }: OnboardingSplashProps) {
  const [step, setStep] = useState<Step>('splash');
  const [who, setWho] = useState<string | null>(null);
  const [pace, setPace] = useState<string | null>(null);

  function finish() {
    try { localStorage.setItem('sprout.onboard', JSON.stringify({ who, pace })); } catch { /* ignore */ }
    onStart();
  }

  if (step === 'splash') {
    return (
      <div className="screen splash">
        <div className="splash__center">
          <Pip className="splash__pip" />
          <h1 className="splash__word">Sprout</h1>
          <p className="splash__tag">Grow a language, gently. 🌱</p>
        </div>
        <button type="button" className="splash__cta" onClick={() => setStep('goal')}>Get started</button>
      </div>
    );
  }

  if (step === 'goal') {
    return (
      <div className="screen welcome">
        <header className="welcome__head">
          <span className="welcome__step">A couple of quick questions</span>
          <h1 className="welcome__title">Let's set the pace</h1>
        </header>
        <main className="screen__body welcome__body">
          <p className="welcome__q">Who's growing today?</p>
          <div className="welcome__opts">
            {WHO.map((o) => (
              <button key={o.id} type="button" className={`welcome__opt${who === o.id ? ' welcome__opt--on' : ''}`} aria-pressed={who === o.id} onClick={() => setWho(o.id)}>
                <span className="welcome__opt-emoji" aria-hidden="true">{o.emoji}</span>{o.label}
              </button>
            ))}
          </div>
          <p className="welcome__q">How much each day?</p>
          <div className="welcome__opts">
            {PACE.map((o) => (
              <button key={o.id} type="button" className={`welcome__opt${pace === o.id ? ' welcome__opt--on' : ''}`} aria-pressed={pace === o.id} onClick={() => setPace(o.id)}>
                <span className="welcome__opt-emoji" aria-hidden="true">{o.emoji}</span>{o.label}
              </button>
            ))}
          </div>
        </main>
        <button type="button" className="splash__cta" disabled={!who || !pace} onClick={() => setStep('ready')}>Continue</button>
      </div>
    );
  }

  // ready
  return (
    <div className="screen welcome">
      <div className="welcome__center">
        <Pip className="welcome__pip" />
        <h1 className="welcome__title">You're all set 🌱</h1>
        <ul className="welcome__promises">
          <li>🌱 No streaks to guilt you</li>
          <li>🍃 No ads, ever</li>
          <li>☀️ Just calm, daily growing</li>
        </ul>
      </div>
      <button type="button" className="splash__cta" onClick={finish}>Start growing</button>
    </div>
  );
}
