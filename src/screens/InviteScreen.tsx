/* InviteScreen — share Sprout with a friend. Calm, no pressure, no rewards
   dangled for inviting — just a warm "grow together". */

import { useState } from 'react';
import Pip from '../components/Pip';

interface InviteScreenProps {
  onBack: () => void;
}

const CODE = 'SPROUT-GROW';
const MESSAGE = `Come grow English with me on Sprout 🌱 Use my code ${CODE}`;

export default function InviteScreen({ onBack }: InviteScreenProps) {
  const [copied, setCopied] = useState(false);

  async function share() {
    // Prefer the native share sheet on phones; fall back to copying.
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: 'Sprout', text: MESSAGE });
        return;
      }
    } catch {
      return; // the person closed the share sheet — that's fine
    }
    try {
      await navigator.clipboard.writeText(MESSAGE);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — the code is on screen to type by hand */
    }
  }

  return (
    <div className="screen invite">
      <header className="streak__top">
        <button type="button" className="lesson__close" onClick={onBack} aria-label="Back">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
               strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <h1 className="streak__title">Invite a friend</h1>
      </header>

      <main className="screen__body invite__body">
        <div className="invite__hero">
          <Pip className="invite__pip" />
          <span className="invite__spark" aria-hidden="true">💌</span>
        </div>

        <h2 className="invite__title">Grow together</h2>
        <p className="invite__sub">
          Gardens grow happier side by side. Share Sprout with a friend and tend your gardens together — no pressure, just calm practice.
        </p>

        <div className="invite__code" aria-label={`Your invite code is ${CODE}`}>
          <span className="invite__code-label">Your code</span>
          <span className="invite__code-value">{CODE}</span>
        </div>

        <button type="button" className="btn-primary invite__cta" onClick={share}>
          {copied ? 'Copied! 🌱' : 'Share Sprout'}
        </button>
        <p className="invite__note">A friend who joins makes your grove a little greener.</p>
      </main>
    </div>
  );
}
