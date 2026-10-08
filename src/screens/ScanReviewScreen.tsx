/* Parent check. Every scanned question is listed. Nothing is taught until
   the parent confirms an answer. Unconfirmed questions are skipped. */

import { canConfirm, reviewReducer, type ReviewAction, type ReviewQuestion } from '../lib/scan/review';
import PipPose from '../components/PipPose';

interface ScanReviewScreenProps {
  questions: ReviewQuestion[];
  onChange: (next: ReviewQuestion[]) => void;
  onPractice: () => void;
  onBack: () => void;
  markList?: boolean;
}

const TYPE_LABEL: Record<ReviewQuestion['type'], string> = {
  fill_blank: 'Fill the blank',
  multiple_choice: 'Multiple choice',
  matching: 'Matching',
  rewrite: 'Rewrite',
};

export default function ScanReviewScreen({
  questions,
  onChange,
  onPractice,
  onBack,
  markList = false,
}: ScanReviewScreenProps) {
  const visible = questions.filter((q) => !q.deleted);
  const ready = visible.filter((q) => q.confirmed).length;

  function send(action: ReviewAction) {
    onChange(reviewReducer(questions, action));
  }

  return (
    <div className="screen scan scan--review" data-scan-shot-ready="">
      <header className="scan__top">
        <button type="button" className="lesson__close" onClick={onBack} aria-label="Back">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <h1 className="scan__title">Check the questions</h1>
      </header>
      <main className="screen__body scan__body">
        <div className="scan__hero">
          <PipPose className="scan__pip" pose="neutral" />
          <p className="scan__lead">
            A grown-up checks each one. Pip only teaches answers you confirm. The rest are skipped.
          </p>
        </div>
        <div>
          {visible.map((q, index) => (
            <article className={`review-card${markList && index === 0 ? ' scan-shot-mark' : ''}`} key={q.id}>
              <header className="review-card__head">
                <span>{index + 1} · {TYPE_LABEL[q.type]}</span>
                {q.confirmed && <span className="review-card__ready">Ready</span>}
              </header>
              {q.needsExactCopy && (
                <p className="review-card__flag" role="note">
                  This looks like a find-and-correct question. Check that the spelling was copied exactly, including the mistake.
                </p>
              )}
              {q.instruction.trim() !== '' && (
                <label className="scan__field">
                  <span className="scan__field-label">Instruction</span>
                  <input
                    className="scan__input"
                    value={q.instruction}
                    onChange={(e) => send({ type: 'instruction', id: q.id, value: e.target.value })}
                  />
                </label>
              )}
              {q.type !== 'matching' && (
                <label className="scan__field">
                  <span className="scan__field-label">Question</span>
                  <textarea
                    className="scan__input scan__input--prompt"
                    rows={2}
                    value={q.prompt}
                    onChange={(e) => send({ type: 'prompt', id: q.id, value: e.target.value })}
                  />
                </label>
              )}
              {q.options.length > 0 && (
                <fieldset className="scan__choices">
                  <legend className="scan__field-label">Printed choices</legend>
                  {q.options.map((option, optionIndex) => (
                    <input
                      key={optionIndex}
                      className="scan__input"
                      value={option}
                      aria-label={`Choice ${optionIndex + 1}`}
                      onChange={(e) => send({ type: 'option', id: q.id, index: optionIndex, value: e.target.value })}
                    />
                  ))}
                </fieldset>
              )}
              {q.type === 'matching' ? (
                <fieldset className="scan__choices">
                  <legend className="scan__field-label">Pairs</legend>
                  {q.pairs.map((pair) => (
                    <label className="review-card__pair" key={pair.left}>
                      <span>{pair.left}</span>
                      <select
                        value={pair.right}
                        onChange={(e) => send({ type: 'pair', id: q.id, left: pair.left, right: e.target.value })}
                      >
                        <option value="">Choose</option>
                        {q.right.map((right) => (
                          <option key={right} value={right}>{right}</option>
                        ))}
                      </select>
                    </label>
                  ))}
                </fieldset>
              ) : (
                <label className="scan__field">
                  <span className="scan__field-label">
                    Answer
                    {q.suggestion && q.answer === q.suggestion && !q.confirmed && (
                      <span className="review-card__suggested"> Suggested</span>
                    )}
                  </span>
                  {q.options.length > 0 ? (
                    <select
                      className="scan__input"
                      value={q.options.includes(q.answer) ? q.answer : ''}
                      onChange={(e) => send({ type: 'answer', id: q.id, value: e.target.value })}
                    >
                      <option value="">Choose the answer</option>
                      {q.options.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className="scan__input"
                      value={q.answer}
                      onChange={(e) => send({ type: 'answer', id: q.id, value: e.target.value })}
                    />
                  )}
                </label>
              )}
              {q.type === 'fill_blank' && q.options.length === 0 && (
                <div className="review-card__extras">
                  <span className="scan__field-label">Two other words from this sheet</span>
                  {([0, 1] as const).map((slot) => (
                    <input
                      key={slot}
                      className="scan__input"
                      value={q.distractors[slot]}
                      aria-label={`Other word ${slot + 1}`}
                      onChange={(e) => send({ type: 'distractor', id: q.id, index: slot, value: e.target.value })}
                    />
                  ))}
                </div>
              )}
              {q.type === 'rewrite' && (
                <div className="review-card__extras">
                  <span className="scan__field-label">Extra word tiles</span>
                  {([0, 1] as const).map((slot) => (
                    <input
                      key={slot}
                      className="scan__input"
                      value={q.extraTiles[slot]}
                      aria-label={`Extra tile ${slot + 1}`}
                      onChange={(e) => send({ type: 'extra', id: q.id, index: slot, value: e.target.value })}
                    />
                  ))}
                </div>
              )}
              <div className="review-card__actions">
                <button
                  type="button"
                  className="review-card__confirm"
                  disabled={!canConfirm(q) || q.confirmed}
                  onClick={() => send({ type: 'confirm', id: q.id })}
                >
                  {q.confirmed ? 'Answer confirmed' : 'Confirm answer'}
                </button>
                <button type="button" className="review-card__remove" onClick={() => send({ type: 'delete', id: q.id })}>
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      </main>
      <footer className="review-bar">
        <p className="review-bar__note">
          {ready === 0 ? 'Confirm at least one answer. Pip will not guess the rest.' : `${ready} ready to practice.`}
        </p>
        <button type="button" className="lesson__check" disabled={ready === 0} onClick={onPractice}>
          Practice
        </button>
      </footer>
    </div>
  );
}
