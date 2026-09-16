/* AccountGateScreen — a calm invitation to save your garden (optional).
   Shown after the first playable lesson. No real auth backend yet; this is
   a local UI that invites creating an account, with a skip option. */

import Pip from '../components/Pip';

interface AccountGateScreenProps {
  onSaved: () => void;
  onSkip: () => void;
}

export default function AccountGateScreen({ onSaved, onSkip }: AccountGateScreenProps) {
  return (
    <div className="screen account-gate">
      <nav className="account-gate__nav account-gate__nav--right">
        <button type="button" className="account-gate__skip" onClick={onSkip}>
          Skip for now
        </button>
      </nav>

      <div className="account-gate__body">
        <Pip className="account-gate__pip" />
        <p className="account-gate__eyebrow">Save your progress</p>
        <h1 className="account-gate__title">Your garden is growing!</h1>
        <p className="account-gate__copy">
          Create an account so your garden is safe — you can pick up right where you left off, anytime. 🌱
        </p>

        <div className="account-gate__chips">
          <span>Never lose progress</span>
          <span>Works on any device</span>
          <span>Always free</span>
        </div>

        <div className="account-gate__providers">
          <button
            type="button"
            className="account-gate__provider account-gate__provider--email"
            onClick={onSaved}
          >
            Save my garden
          </button>
        </div>

        <p className="account-gate__promise">
          No ads, no pressure — your garden stays calm &amp; safe. 🌿
        </p>
      </div>
    </div>
  );
}
