/* ComebackScreen — a warm "welcome back" shown once when a learner returns
   after a gap. Calm and glad to see you; never guilt about time away. */

import Pip from '../components/Pip';

interface ComebackScreenProps {
  onContinue: () => void;
}

export default function ComebackScreen({ onContinue }: ComebackScreenProps) {
  return (
    <div className="screen comeback">
      <div className="comeback__center">
        <Pip className="comeback__pip" />
        <span className="comeback__spark" aria-hidden="true">🌷</span>
        <h1 className="comeback__title">Welcome back!</h1>
        <p className="comeback__sub">Your garden missed you. Let's grow a little more today. 🌱</p>
      </div>
      <button type="button" className="btn-primary comeback__cta" onClick={onContinue}>Continue growing</button>
    </div>
  );
}
