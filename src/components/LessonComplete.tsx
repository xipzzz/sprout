/* LessonComplete — one calm celebration: Pip, a tiered headline + garden-tier
   chip, ~3 stat tiles, ONE Continue CTA. Tiers are gentle — even a low score
   is "sprouting", never a failure. (Daily-goal celebration is separate.) */

import Pip from './Pip';

interface LessonCompleteProps {
  leaves: number;
  accuracy: number;
  words: number;
  onContinue: () => void;
}

/* Garden-tier by accuracy — kind framing at every level (per the design). */
function gardenTier(accuracy: number): { headline: string; sub: string; emoji: string; label: string } {
  if (accuracy >= 100) return { headline: 'In full bloom!', sub: 'A perfect run — your garden is glowing.', emoji: '🌸', label: 'Lush' };
  if (accuracy >= 80) return { headline: 'Growing strong!', sub: 'Lovely work — your garden is thriving.', emoji: '🌿', label: 'Healthy' };
  return { headline: 'Nice sprouting!', sub: 'Every try helps your garden grow.', emoji: '🌱', label: 'Sprouting' };
}

export default function LessonComplete({ leaves, accuracy, words, onContinue }: LessonCompleteProps) {
  const tier = gardenTier(accuracy);
  return (
    <div className="screen complete">
      <Pip className="complete__pip" />
      <h1 className="complete__title">{tier.headline}</h1>
      <p className="complete__tier"><span aria-hidden="true">{tier.emoji}</span> {tier.label} garden</p>
      <p className="complete__sub">{tier.sub}</p>

      <div className="complete__tiles">
        <div className="tile">
          <span className="tile__icon" aria-hidden="true">🍃</span>
          <span className="tile__num">+{leaves}</span>
          <span className="tile__lbl">Leaves</span>
        </div>
        <div className="tile">
          <span className="tile__icon" aria-hidden="true">🎯</span>
          <span className="tile__num">{accuracy}%</span>
          <span className="tile__lbl">Accuracy</span>
        </div>
        <div className="tile">
          <span className="tile__icon" aria-hidden="true">📖</span>
          <span className="tile__num">{words}</span>
          <span className="tile__lbl">Words</span>
        </div>
      </div>

      <button type="button" className="btn-primary" onClick={onContinue}>CONTINUE</button>
    </div>
  );
}
