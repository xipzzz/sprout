/* FeedbackDrawer — slides up after a check.
   correct = green + celebratory; wrong = warm clay + kind copy (never red).
   Always teaches via Meaning / In use / Why, and offers a flag-an-issue control. */

import type { Exercise } from '../data/course';

interface FeedbackDrawerProps {
  result: 'correct' | 'wrong';
  ex: Exercise;
  onContinue: () => void;
}

export default function FeedbackDrawer({ result, ex, onContinue }: FeedbackDrawerProps) {
  const correct = result === 'correct';
  const answerLabel = ex.choices.find((c) => c.id === ex.answerId)?.label ?? '';

  return (
    <div className={`drawer drawer--${result}`} role="status" aria-live="polite">
      <div className="drawer__head">
        <span className="drawer__icon" aria-hidden="true">{correct ? '✓' : '✗'}</span>
        <span className="drawer__title">{correct ? 'Nice!' : 'Not quite'}</span>
        <button type="button" className="drawer__flag" aria-label="Flag an issue with this question">
          ⚐ Flag
        </button>
      </div>

      {!correct && (
        <p className="drawer__answer">Answer: <strong>{answerLabel}</strong></p>
      )}

      <dl className="teach">
        <div><dt>Meaning</dt><dd>{ex.teach.meaning}</dd></div>
        <div><dt>In use</dt><dd>{ex.teach.inUse}</dd></div>
        <div><dt>Why</dt><dd>{ex.teach.why}</dd></div>
      </dl>

      <button type="button" className="btn-primary" onClick={onContinue}>CONTINUE</button>
    </div>
  );
}
