/* OnboardingSplash — the branded launch screen (Sprout wordmark + Pip).
   Shown once on first open, then straight to the path. Calm, no pressure. */

import Pip from '../components/Pip';

interface OnboardingSplashProps {
  onStart: () => void;
}

export default function OnboardingSplash({ onStart }: OnboardingSplashProps) {
  return (
    <div className="screen splash">
      <div className="splash__center">
        <Pip className="splash__pip" />
        <h1 className="splash__word">Sprout</h1>
        <p className="splash__tag">Grow a language, gently. 🌱</p>
      </div>
      <button type="button" className="splash__cta" onClick={onStart}>
        Start growing
      </button>
    </div>
  );
}
