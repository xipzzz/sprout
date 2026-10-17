/* Exam scan prototype. Parent review, then child practice.
   Open with ?exam=1. The sample photo runs without an API key. */

import { useCallback, useEffect, useRef, useState } from 'react';
import { extractExam, saveExam } from '../exam/api';
import { assertChildViewSafe, toChildView } from '../exam/childView';
import type { ChildView, ParentQuestion, ParentScan, ReconstructionFlag } from '../exam/types';
import ExamChildPractice from './ExamChildPractice';
import { useExamReview } from '../exam/useExamReview';
import ExamReviewControls from './ExamReviewControls';
import { useMistakesFlow } from './useMistakesFlow';

interface ExamPrototypeScreenProps {
  onExit: () => void;
}

type Phase = 'pick' | 'loading' | 'parent' | 'error';

function flagsFor(question: ParentQuestion, field: ReconstructionFlag['field']) {
  return question.flags.filter((flag) => flag.field === field);
}

function FlagTape({ flags }: { flags: ReconstructionFlag[] }) {
  if (!flags.length) return null;
  return (
    <div className="exam-proto__flags">
      {flags.map((flag) => (
        <p key={`${flag.field}-${flag.note}`} className="exam-proto__flag">
          <span className="exam-proto__flag-label">
            {flag.kind === 'generated' ? 'AI wrote this' : 'AI filled this in'}
          </span>
          <span className="exam-proto__flag-note">{flag.note}</span>
        </p>
      ))}
    </div>
  );
}

export default function ExamPrototypeScreen({ onExit }: ExamPrototypeScreenProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const started = useRef(false);
  const [phase, setPhase] = useState<Phase>('pick');
  const [error, setError] = useState('');
  const [scan, setScan] = useState<ParentScan | null>(null);
  const [child, setChild] = useState<ChildView | null>(null);
  const [saved, setSaved] = useState<string[]>([]);
  const [skipped, setSkipped] = useState<string[]>([]);
  const [saveError, setSaveError] = useState('');
  const marks = useExamReview(scan, saved);
  const mistakes = useMistakesFlow();

  const runFile = useCallback(async (file: File, demo: boolean) => {
    setPhase('loading');
    setError('');
    setSaveError('');
    setSkipped([]);
    setChild(null);
    try {
      const next = await extractExam(file, demo);
      setScan(next);
      setPhase('parent');
      try {
        const savedNote = await saveExam(next);
        setSaved(savedNote.paths);
        setSkipped(savedNote.skipped);
      } catch (err) {
        setSaved([]);
        setSaveError(err instanceof Error ? err.message : 'Could not save the note.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not scan that photo.');
      setPhase('error');
    }
  }, []);

  useEffect(() => {
    if (started.current) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('demo') !== '1') return;
    started.current = true;
    void runSample();
    async function runSample() {
      const response = await fetch('/sample-exam-english.png');
      const blob = await response.blob();
      const file = new File([blob], 'sample-exam-english.png', { type: 'image/png' });
      await runFile(file, true);
    }
  }, [runFile]);

  async function onSample() {
    const response = await fetch('/sample-exam-english.png');
    const blob = await response.blob();
    const file = new File([blob], 'sample-exam-english.png', { type: 'image/png' });
    await runFile(file, true);
  }

  function onPicked(file: File | undefined) {
    if (!file) return;
    void runFile(file, false);
  }

  function openChild() {
    if (!scan) return;
    try {
      const view = toChildView(scan);
      assertChildViewSafe(scan, view);
      setChild(view);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Child view was not safe to open.');
    }
  }

  if (mistakes.screen) return mistakes.screen;

  if (child && scan) {
    return (
      <ExamChildPractice
        view={child}
        onBack={() => setChild(null)}
        onExit={onExit}
        onGrade={(id, choice) => {
          const question = scan.questions.find((item) => item.id === id);
          if (!question || !question.correct_answer) return 'almost';
          return choice === question.correct_answer ? 'nice' : 'almost';
        }}
      />
    );
  }

  return (
    <div className="screen exam-proto" data-screen={phase === 'parent' ? 'parent-review' : 'exam-pick'}>
      <header className="exam-proto__top">
        <button type="button" className="lesson__close" onClick={onExit} aria-label="Close exam scan">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <h1 className="exam-proto__title">{phase === 'parent' ? 'Check the page' : 'Scan a page'}</h1>
      </header>

      <main className="screen__body exam-proto__body">
        {phase !== 'parent' && (
          <section className="exam-proto__intro">
            <p className="exam-proto__lead">
              One photo of a finished worksheet. Pip straightens the page, lifts colored handwriting
              off the preview, and lays out each question for you to check.
            </p>
            <p className="exam-proto__hint">
              Your photo is read with free Tesseract.js. No account and no API key.
              Zhipu GLM-4.6V is optional, and only runs if <code>ZHIPU_API_KEY</code> is set.
            </p>
            <button type="button" className="btn-primary exam-proto__cta" onClick={() => void onSample()}>
              Try the sample photo
            </button>
            <button type="button" className="exam-proto__secondary" onClick={() => fileRef.current?.click()}>
              Choose a photo
            </button>
            <button type="button" className="exam-proto__secondary" onClick={() => mistakes.openNotebook()}>
              Mistake notebook
            </button>
            <input
              ref={fileRef}
              className="scan__file"
              type="file"
              accept="image/*"
              onChange={(event) => onPicked(event.target.files?.[0])}
            />
          </section>
        )}

        {phase === 'loading' && (
          <div className="scan__loading" role="status">
            <span className="scan__spinner" aria-hidden="true" />
            <p>Straightening the page…</p>
          </div>
        )}

        {phase === 'error' && (
          <div className="scan__error" role="alert">
            <p className="scan__error-title">Could not scan that photo</p>
            <p className="scan__error-body">{error}</p>
            <button type="button" className="exam-proto__secondary" onClick={() => setPhase('pick')}>
              Back
            </button>
          </div>
        )}

        {phase === 'parent' && scan && (
          <div className="exam-proto__review">
            {scan.extraction === 'stub' && <p className="exam-proto__banner">{scan.note}</p>}
            {scan.extraction !== 'stub' && scan.note && <p className="exam-proto__banner">{scan.note}</p>}
            <p className="exam-proto__save" role="status">
              {saved.length > 0 && (
                <>
                  Saved {saved.length === 1 ? 'note' : 'notes'}: {saved.join(' · ')}
                </>
              )}
              {skipped.length > 0 && <> Vault folder not writable here: {skipped.join(' · ')}.</>}
              {saveError && <>Could not save the note. {saveError}</>}
            </p>
            {scan.questions.some((question) => question.flags.length > 0) && (
              <ul className="exam-proto__flag-summary">
                {[
                  ...new Map(
                    scan.questions.flatMap((question) =>
                      question.flags.map((flag) => [
                        `${question.id}|${flag.field}|${flag.kind}`,
                        { id: question.id, field: flag.field, kind: flag.kind },
                      ]),
                    ),
                  ),
                ].map(([key, chip]) => (
                  <li key={key}>
                    {chip.kind === 'generated' ? 'AI wrote this' : 'AI filled this in'}
                    {' · '}Q{chip.id} {chip.field.replaceAll('_', ' ')}
                  </li>
                ))}
              </ul>
            )}
            <div className="exam-proto__previews">
              {scan.previews?.deskew_jpeg && (
                <figure>
                  <img src={scan.previews.deskew_jpeg} alt="Page straightened from the photo" />
                  <figcaption>
                    Straightened{scan.deskew.applied ? '' : ' (page corners not found)'}
                  </figcaption>
                </figure>
              )}
              {scan.previews?.clean_jpeg && (
                <figure>
                  <img src={scan.previews.clean_jpeg} alt="Same page with blue and red ink removed" />
                  <figcaption>Colored ink lifted · {scan.ink_pixels_lifted} pixels</figcaption>
                </figure>
              )}
            </div>

            {scan.questions.map((question) => (
              <article key={question.id} className="exam-proto__card">
                <p className="exam-proto__kicker">Question {question.id}</p>
                <h2 className="exam-proto__stem">{question.stem}</h2>
                <FlagTape flags={flagsFor(question, 'stem')} />
                {question.choices.length > 0 && (
                  <>
                    <ul className="exam-proto__choices">
                      {question.choices.map((choice) => (
                        <li key={choice}>{choice}</li>
                      ))}
                    </ul>
                    <FlagTape flags={flagsFor(question, 'choices')} />
                  </>
                )}
                <dl className="exam-proto__facts">
                  <div>
                    <dt>Handwritten answer</dt>
                    <dd>
                      {question.student_answer || 'Blank'}
                      <FlagTape flags={flagsFor(question, 'student_answer')} />
                    </dd>
                  </div>
                  <div>
                    <dt>Teacher’s mark</dt>
                    <dd>
                      {question.teacher_mark || 'None'}
                      <FlagTape flags={flagsFor(question, 'teacher_mark')} />
                    </dd>
                  </div>
                  <div>
                    <dt>Practice answer, hidden from the child</dt>
                    <dd>
                      {question.correct_answer || 'Unknown'}
                      <FlagTape flags={flagsFor(question, 'correct_answer')} />
                    </dd>
                  </div>
                </dl>
                <p className="exam-proto__explain">
                  <span className="exam-proto__explain-label">For you</span>
                  {question.explanation}
                </p>
                <FlagTape flags={flagsFor(question, 'explanation')} />
                <ExamReviewControls
                  question={question}
                  subject={marks.subject}
                  review={marks.review[question.id]}
                  inNotebook={marks.inNotebook.has(question.id)}
                  onChange={(patch) => marks.update(question.id, patch)}
                />
              </article>
            ))}

            {error && (
              <p className="scan__edit-error" role="alert">
                {error}
              </p>
            )}
            {marks.status && <p className="exam-proto__save" role="status">{marks.status}</p>}
            {mistakes.error && <p className="scan__edit-error" role="alert">{mistakes.error}</p>}
            <button type="button" className="btn-primary exam-proto__cta" onClick={openChild}>
              Practice with Pip
            </button>
            {marks.wrongHere > 0 && (
              <button
                type="button"
                className="exam-proto__secondary"
                onClick={() => mistakes.practise({ kind: 'scan', scanKey: marks.scanKey })}
              >
                Practise mistakes only ({marks.wrongHere})
              </button>
            )}
            <button type="button" className="exam-proto__secondary" onClick={() => mistakes.openNotebook()}>
              Mistake notebook ({marks.notebookCount})
            </button>
            <button type="button" className="exam-proto__secondary" onClick={() => setPhase('pick')}>
              Scan another photo
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
