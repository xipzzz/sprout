/* Explain step, parent view only. Runs after parent review, one question at a time:
   the answer, steps with the real numbers, a line to say aloud, one check question,
   and similar practice for maths. Built from local templates; nothing here goes to the child. */

import { useMemo, useState } from 'react';
import { appExplainCache, explainNow, type AnswerSource } from '../exam/extras/explain';
import { getPick } from '../exam/extras/picks';
import {
  attemptsFor,
  canMakeSimilar,
  makeSimilar,
  MAX_SIMILAR,
  MIN_SIMILAR,
  startPractice,
  type PracticeRun,
} from '../exam/extras/practice';
import { extrasSettings } from '../exam/extras/settings';
import type { ParentScan } from '../exam/types';
import '../styles/exam-extras.css';

interface ExamExplainStepProps {
  scan: ParentScan;
  onPick: (questionId: string, answer: string) => void;
  onPractice: (run: PracticeRun) => void;
  onBack: () => void;
  onExit: () => void;
}

const SOURCE_LABEL: Record<AnswerSource, string> = {
  parent: 'You picked this',
  'worked-out': 'Worked out by Pip',
  page: 'From the page',
  rule: "From Pip's rule",
  guess: 'A guess from the scan',
  none: 'Not known yet',
};

const COUNTS = Array.from({ length: MAX_SIMILAR - MIN_SIMILAR + 1 }, (_, i) => MIN_SIMILAR + i);

export default function ExamExplainStep({ scan, onPick, onPractice, onBack, onExit }: ExamExplainStepProps) {
  const settings = useMemo(() => extrasSettings(), []);
  const [index, setIndex] = useState(0);
  const [count, setCount] = useState(settings.practiceCount);
  const [practiceError, setPracticeError] = useState('');
  const [openedAt, setOpenedAt] = useState(() => Date.now());
  const total = scan.questions.length;
  const question = scan.questions[Math.min(index, total - 1)];
  const pick = question ? getPick(scan.subject, question) : undefined;

  const card = useMemo(
    () => (question ? explainNow({ subject: scan.subject, question, pick, year: settings.year }, appExplainCache()) : null),
    [question, pick, scan.subject, settings.year],
  );
  const similar = useMemo(
    () => (question && canMakeSimilar(question) ? makeSimilar(question, scan.subject, count) : null),
    [question, scan.subject, count],
  );

  if (!question || !card) {
    return (
      <div className="screen exam-proto" data-screen="parent-explain">
        <p className="exam-proto__lead">No questions to explain.</p>
        <button type="button" className="exam-proto__secondary" onClick={onBack}>
          Back to the page
        </button>
      </div>
    );
  }

  const attempts = attemptsFor(question.id);
  const right = attempts.filter((attempt) => attempt.is_correct).length;

  function go(step: number) {
    setPracticeError('');
    setOpenedAt(Date.now());
    setIndex((value) => Math.max(0, Math.min(total - 1, value + step)));
  }

  function practise() {
    if (!similar) return;
    try {
      onPractice(startPractice(similar));
    } catch (err) {
      setPracticeError(err instanceof Error ? err.message : 'Could not start practice.');
    }
  }

  return (
    <div className="screen exam-proto" data-screen="parent-explain">
      <header className="exam-proto__top">
        <button type="button" className="lesson__close" onClick={onExit} aria-label="Close exam scan">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <h1 className="exam-proto__title">Explain</h1>
        <button type="button" className="exam-proto__text-btn" onClick={onBack}>
          Check page
        </button>
      </header>

      <main className="screen__body exam-proto__body exam-explain">
        <p className="exam-proto__kicker">
          Question {question.id} · {index + 1} of {total} · {settings.year} wording · for you only
        </p>
        <h2 className="exam-proto__stem">{question.stem}</h2>

        <section className="exam-explain__card" aria-label="Explain like a teacher">
          <p className="exam-proto__flag">
            <span className="exam-proto__flag-label">AI wrote this</span>
            <span className="exam-proto__flag-note">
              Made by Pip's local templates on this device. No paid AI. Check it before you teach it.
            </span>
          </p>

          <div className="exam-explain__answer">
            <span className="exam-explain__label">The answer</span>
            <strong className="exam-explain__answer-text">{card.answer || 'Not sure yet'}</strong>
            <span className="exam-explain__source">{SOURCE_LABEL[card.answerSource]}</span>
          </div>

          {question.choices.length > 0 && (
            <div className="exam-explain__pick">
              <span className="exam-explain__label">Pick the right answer</span>
              <div className="exam-explain__chips">
                {question.choices.map((choice) => (
                  <button
                    key={choice}
                    type="button"
                    className={`exam-explain__chip${pick === choice ? ' exam-explain__chip--on' : ''}`}
                    aria-pressed={pick === choice}
                    onClick={() => onPick(question.id, choice)}
                  >
                    {choice}
                  </button>
                ))}
              </div>
            </div>
          )}

          {card.steps.length > 0 && (
            <div className="exam-explain__block">
              <span className="exam-explain__label">Step by step</span>
              <ol className="exam-explain__steps">
                {card.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
          )}

          {card.rule && (
            <div className="exam-explain__block">
              <span className="exam-explain__label">The rule</span>
              <p className="exam-explain__text">{card.rule}</p>
            </div>
          )}

          <div className="exam-explain__block exam-explain__say">
            <span className="exam-explain__label">Say this to your child</span>
            <p className="exam-explain__text">“{card.sayAloud}”</p>
          </div>

          <div className="exam-explain__block exam-explain__check">
            <span className="exam-explain__label">Check question</span>
            <p className="exam-explain__text">{card.followUp}</p>
            <p className="exam-explain__fine">
              {settings.hints
                ? 'Your child sees only this question, as a hint after one wrong try.'
                : 'Hints are off, so your child does not see this.'}
            </p>
          </div>

          {card.notes.length > 0 && (
            <ul className="exam-explain__notes">
              {card.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          )}

          <p className="exam-explain__meta" role="status">
            {card.madeAt < openedAt
              ? `Opened from the saved copy in ${card.ms} ms. First made in ${card.madeMs} ms.`
              : `Made in ${card.madeMs} ms.`}
          </p>
        </section>

        {similar && (
          <section className="exam-explain__card exam-explain__similar" aria-label="Similar practice">
            <span className="exam-explain__label">Similar practice</span>
            <p className="exam-explain__text">New numbers, same kind of question. Each answer was checked twice.</p>
            <div className="exam-explain__chips" role="group" aria-label="How many questions">
              {COUNTS.map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`exam-explain__chip${count === value ? ' exam-explain__chip--on' : ''}`}
                  aria-pressed={count === value}
                  onClick={() => setCount(value)}
                >
                  {value}
                </button>
              ))}
            </div>
            <ol className="exam-explain__variants">
              {similar.variants.map((variant) => (
                <li key={variant.id}>
                  <span>{variant.stem}</span>
                  <span className="exam-explain__variant-answer">Answer {variant.answer}</span>
                </li>
              ))}
            </ol>
            <p className="exam-explain__fine">Answers stay here. Your child sees only the questions.</p>
            {attempts.length > 0 && (
              <p className="exam-explain__fine">
                Last practice: {right} right out of {attempts.length} {attempts.length === 1 ? 'try' : 'tries'}.
              </p>
            )}
            {practiceError && (
              <p className="scan__edit-error" role="alert">
                {practiceError}
              </p>
            )}
            <button type="button" className="btn-primary exam-proto__cta" onClick={practise}>
              Practise these with Pip
            </button>
          </section>
        )}

        <div className="exam-explain__nav">
          <button type="button" className="exam-proto__secondary" onClick={() => go(-1)} disabled={index === 0}>
            Previous
          </button>
          <button type="button" className="exam-proto__secondary" onClick={() => go(1)} disabled={index >= total - 1}>
            Next question
          </button>
        </div>
      </main>
    </div>
  );
}
