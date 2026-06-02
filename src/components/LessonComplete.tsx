/* LessonComplete — one calm celebration: Pip, ~3 stat tiles, ONE Continue CTA.
   (Daily-goal celebration is a separate moment, not stacked here.) */

import Pip from './Pip';

interface LessonCompleteProps {
  leaves: number;
  accuracy: number;
  words: number;
  onContinue: () => void;
}

export default function LessonComplete({ leaves, accuracy, words, onContinue }: LessonCompleteProps) {
  return (
    <div className="screen complete">
      <Pip className="complete__pip" />
      <h1 className="complete__title">Lesson complete!</h1>
      <p className="complete__sub">Your garden grew a little 🌱</p>

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
