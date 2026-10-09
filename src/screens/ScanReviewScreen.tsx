/* Parent check. The straightened page sits above the questions.
   A tap marks a printed choice. Unconfirmed questions are skipped. */

import { useState } from 'react';
import EmphasisText from '../components/EmphasisText';
import PageViewer from '../components/PageViewer';
import { canConfirm, reviewReducer, type ReviewAction, type ReviewQuestion } from '../lib/scan/review';
import type { QuestionType } from '../lib/scan/types';
import { showsPrintedChoices, wordOrderTiles } from '../lib/scan/wordOrder';

interface ScanReviewScreenProps {
  questions: ReviewQuestion[];
  onChange: (next: ReviewQuestion[]) => void;
  onPractice: () => void;
  onBack: () => void;
  photos?: string[];
  mark?: boolean;
}

const TYPE_LABEL: Record<QuestionType, string> = {
  fill_blank: 'Fill in the blank',
  multiple_choice: 'Multiple choice',
  matching: 'Matching',
  rewrite: 'Rewrite',
};

const TYPES: QuestionType[] = ['multiple_choice', 'fill_blank', 'matching', 'rewrite'];

export default function ScanReviewScreen({
  questions,
  onChange,
  onPractice,
  onBack,
  photos = [],
  mark = false,
}: ScanReviewScreenProps) {
  const [openIds, setOpenIds] = useState<string[]>([]);
  const [typeMenu, setTypeMenu] = useState<string | null>(null);
  const [removedId, setRemovedId] = useState<string | null>(null);
  const [pageOpen, setPageOpen] = useState(false);
  const visible = questions.filter((q) => !q.deleted);
  const ready = visible.filter((q) => q.confirmed).length;

  function send(action: ReviewAction) {
    onChange(reviewReducer(questions, action));
  }

  function openPage() {
    if (photos.length === 0) return;
    setPageOpen(true);
  }

  function pickChoice(id: string, option: string) {
    const withAnswer = reviewReducer(questions, { type: 'answer', id, value: option });
    onChange(reviewReducer(withAnswer, { type: 'confirm', id }));
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
        <p className="scan__lead scan__lead--tight">
          A grown-up checks each one. Pip only teaches answers you confirm.
        </p>
        {photos.map((src, index) => (
          <button
            key={src}
            type="button"
            className={`review-photo${mark ? ' scan-shot-mark' : ''}`}
            onClick={openPage}
            aria-label={`Straightened page ${index + 1}, see the full page`}
          >
            <img src={src} alt={`Straightened homework page ${index + 1}`} />
          </button>
        ))}
        {visible.map((q, index) => {
          const printed = wordOrderTiles(q.prompt);
          const collapsed = q.confirmed && !openIds.includes(q.id);
          if (collapsed) {
            return (
              <div key={q.id} className={`review-collapsed${mark ? ' scan-shot-mark' : ''}`}>
                <button type="button" className="review-collapsed__open" onClick={openPage}>
                  <span>{index + 1} · {oneLine(q)}</span>
                  <span className="review-collapsed__answer">{summary(q)}</span>
                </button>
                <div className="review-collapsed__actions">
                  <button type="button" className="see-page" onClick={openPage}>See on page</button>
                  <button type="button" className="review-collapsed__edit" onClick={() => setOpenIds((ids) => [...ids, q.id])}>
                    Edit
                  </button>
                </div>
              </div>
            );
          }
          return (
            <article className="review-card" key={q.id}>
              <header className="review-card__head">
                <button type="button" className="review-card__open" onClick={openPage}>{index + 1}</button>
                <button type="button" className="type-chip" onClick={() => setTypeMenu(typeMenu === q.id ? null : q.id)}>
                  {TYPE_LABEL[q.type]}
                </button>
                <button type="button" className="see-page" onClick={openPage}>See on page</button>
              </header>
              {typeMenu === q.id && (
                <div className="type-menu" role="listbox" aria-label="Question type">
                  {TYPES.map((kind) => (
                    <button
                      key={kind}
                      type="button"
                      onClick={() => {
                        send({ type: 'set-type', id: q.id, value: kind });
                        setTypeMenu(null);
                      }}
                    >
                      {TYPE_LABEL[kind]}
                    </button>
                  ))}
                </div>
              )}
              {q.needsExactCopy && (
                <p className="review-card__flag" role="note">
                  This looks like a find-and-correct question. Check that the spelling was copied exactly, including the mistake.
                </p>
              )}
              {q.instruction.trim() !== '' && (
                <label className="scan__field">
                  <span className="scan__field-label">Instruction</span>
                  <input className="scan__input" value={q.instruction} onChange={(e) => send({ type: 'instruction', id: q.id, value: e.target.value })} />
                </label>
              )}
              {q.type !== 'matching' && !printed && (
                <label className="scan__field">
                  <span className="scan__field-label">Question</span>
                  {q.emphasis.some((word) => q.prompt.toLowerCase().includes(word.toLowerCase())) && (
                    <p className="review-rendered"><EmphasisText text={q.prompt} emphasis={q.emphasis} /></p>
                  )}
                  <textarea
                    className="scan__input scan__input--prompt"
                    rows={2}
                    value={q.prompt}
                    onChange={(e) => send({ type: 'prompt', id: q.id, value: e.target.value })}
                  />
                </label>
              )}
              {printed && (
                <div className={`word-order${mark ? ' scan-shot-mark' : ''}`}>
                  <span className="scan__field-label">Printed words</span>
                  <div className="word-order__tiles" aria-label="Printed words">
                    {printed.map((tile, tileIndex) => (
                      <span className="word-order__tile" key={`${tileIndex}-${tile}`}>{tile}</span>
                    ))}
                  </div>
                  <label className="scan__field">
                    <span className="scan__field-label">
                      Correct sentence
                      {q.suggestion && q.answer === q.suggestion && <span className="review-card__suggested"> Suggested</span>}
                    </span>
                    <input
                      className="scan__input"
                      value={q.answer}
                      aria-label="Correct sentence"
                      onChange={(e) => send({ type: 'answer', id: q.id, value: e.target.value })}
                    />
                  </label>
                </div>
              )}
              {showsPrintedChoices(q) && (
                <fieldset className={`scan__choices${mark ? ' scan-shot-mark' : ''}`}>
                  <legend className="scan__field-label">Printed choices</legend>
                  {q.options.map((option, optionIndex) => {
                    const picked = Boolean(option) && q.answer === option;
                    return (
                      <div
                        key={optionIndex}
                        className={`choice-row${picked ? ' choice-row--picked' : ''}`}
                        onClick={() => option && pickChoice(q.id, option)}
                      >
                        <span className={`choice-radio${picked ? ' choice-radio--on' : ''}`} aria-hidden="true">{picked ? '✓' : ''}</span>
                        <input
                          className="choice-row__input"
                          value={option}
                          aria-label={`Choice ${optionIndex + 1}`}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => send({ type: 'option', id: q.id, index: optionIndex, value: e.target.value })}
                        />
                      </div>
                    );
                  })}
                  <button type="button" className="review-add" onClick={() => send({ type: 'add-option', id: q.id })}>
                    Add a choice
                  </button>
                </fieldset>
              )}
              {q.type === 'matching' && (
                <fieldset className="scan__choices">
                  <legend className="scan__field-label">Pairs</legend>
                  {q.pairs.map((pair) => (
                    <label className="review-card__pair" key={pair.left}>
                      <span>{pair.left}</span>
                      <select value={pair.right} onChange={(e) => send({ type: 'pair', id: q.id, left: pair.left, right: e.target.value })}>
                        <option value="">Choose</option>
                        {q.right.map((right) => <option key={right} value={right}>{right}</option>)}
                      </select>
                    </label>
                  ))}
                </fieldset>
              )}
              {q.options.length === 0 && q.type !== 'matching' && !printed && (
                <label className="scan__field">
                  <span className="scan__field-label">
                    Answer
                    {q.suggestion && q.answer === q.suggestion && <span className="review-card__suggested"> Suggested</span>}
                  </span>
                  <input className="scan__input" value={q.answer} onChange={(e) => send({ type: 'answer', id: q.id, value: e.target.value })} />
                </label>
              )}
              {q.type === 'fill_blank' && q.options.length === 0 && (
                <div className="review-card__extras">
                  <span className="scan__field-label">Two other words from this sheet</span>
                  {([0, 1] as const).map((slot) => (
                    <input key={slot} className="scan__input" value={q.distractors[slot]} aria-label={`Other word ${slot + 1}`} onChange={(e) => send({ type: 'distractor', id: q.id, index: slot, value: e.target.value })} />
                  ))}
                </div>
              )}
              {q.type === 'rewrite' && !printed && (
                <div className="review-card__extras">
                  <span className="scan__field-label">Extra word tiles</span>
                  {([0, 1] as const).map((slot) => (
                    <input key={slot} className="scan__input" value={q.extraTiles[slot]} aria-label={`Extra tile ${slot + 1}`} onChange={(e) => send({ type: 'extra', id: q.id, index: slot, value: e.target.value })} />
                  ))}
                </div>
              )}
              <div className="review-card__actions">
                {q.options.length === 0 && (
                  <button type="button" className="review-card__confirm" disabled={!canConfirm(q) || q.confirmed} onClick={() => send({ type: 'confirm', id: q.id })}>
                    {q.confirmed ? 'Answer confirmed' : 'Confirm answer'}
                  </button>
                )}
                <button
                  type="button"
                  className="review-card__remove"
                  onClick={() => {
                    send({ type: 'delete', id: q.id });
                    setRemovedId(q.id);
                  }}
                >
                  Remove
                </button>
              </div>
            </article>
          );
        })}
        <button type="button" className="review-add review-add--block" onClick={() => send({ type: 'add-question' })}>
          Add a missed question
        </button>
      </main>
      <footer className="review-bar">
        <p className={`review-bar__note${mark ? ' scan-shot-mark' : ''}`}>{ready} of {visible.length} confirmed</p>
        <button type="button" className="lesson__check" disabled={ready === 0} onClick={onPractice}>Practice</button>
      </footer>
      {removedId && (
        <div className="undo-toast" role="status">
          <span>Question removed</span>
          <button
            type="button"
            onClick={() => {
              send({ type: 'restore', id: removedId });
              setRemovedId(null);
            }}
          >
            Undo
          </button>
        </div>
      )}
      {pageOpen && photos.length > 0 && (
        <PageViewer pages={photos} onClose={() => setPageOpen(false)} mark={mark} />
      )}
    </div>
  );
}

function oneLine(q: ReviewQuestion): string {
  const text = q.prompt || q.left.join(', ') || 'Question';
  return text.length > 42 ? `${text.slice(0, 42)}…` : text;
}

function summary(q: ReviewQuestion): string {
  if (q.type === 'matching') return 'pairs';
  return q.answer || 'confirmed';
}
