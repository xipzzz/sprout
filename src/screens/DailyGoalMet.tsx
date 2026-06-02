/* DailyGoalMet — a calm, separate celebration after the day's first lesson.
   (Deliberately NOT stacked onto Lesson Complete.) */

import Pip from '../components/Pip';

interface DailyGoalMetProps {
  onContinue: () => void;
}

export default function DailyGoalMet({ onContinue }: DailyGoalMetProps) {
  return (
    <div className="screen daily">
      <div className="daily__center">
        <Pip className="daily__pip" />
        <span className="daily__badge" aria-hidden="true">🌸</span>
        <h1 className="daily__title">Daily goal met!</h1>
        <p className="daily__sub">Your garden soaked up today's sun 🌱</p>
      </div>
      <button type="button" className="btn-primary daily__cta" onClick={onContinue}>Continue</button>
    </div>
  );
}
