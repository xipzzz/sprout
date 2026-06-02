/* GoldenBloomScreen — the warm milestone moment when a whole section is done.
   Calm and golden: a reward of recognition, never a demand to keep going. */

import Pip from '../components/Pip';

interface GoldenBloomScreenProps {
  sectionTitle: string;
  onContinue: () => void;
}

export default function GoldenBloomScreen({ sectionTitle, onContinue }: GoldenBloomScreenProps) {
  return (
    <div className="screen bloom">
      <div className="bloom__center">
        <div className="bloom__halo" aria-hidden="true" />
        <span className="bloom__flower" aria-hidden="true">🌼</span>
        <Pip className="bloom__pip" />
        <p className="bloom__eyebrow">Golden Bloom</p>
        <h1 className="bloom__title">You finished {sectionTitle}!</h1>
        <p className="bloom__sub">A golden flower opened in your garden. Rest if you like — it will be waiting. 🌟</p>
      </div>
      <button type="button" className="btn-primary bloom__cta" onClick={onContinue}>Continue</button>
    </div>
  );
}
