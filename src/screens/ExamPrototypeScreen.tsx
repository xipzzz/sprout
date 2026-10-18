/* Exam scan prototype. Parent review, then child practice.
   Open with ?exam=1. The sample photo runs without an API key.
   Practice stays locked until the parent picks or drops every question. */

import { useCallback, useEffect, useRef, useState } from 'react';
import { extractExam, saveExam, UnsupportedPageError } from '../exam/api';
import { SUBJECTS, type SubjectChoice } from '../exam/ocr';
import {
  BLANK,
  blankBefore,
  blankInstead,
  buildPractice,
  initialReview,
  parentCopy,
  reviewProgress,
  stemWords,
  type Practice,
  type QuestionReview,
  type ReviewState,
} from '../exam/review';
import type { ParentQuestion, ParentScan, ReconstructionFlag } from '../exam/types';
import ExamChildPractice from './ExamChildPractice';

interface ExamPrototypeScreenProps {
  onExit: () => void;
}

type Phase = 'pick' | 'loading' | 'parent' | 'error';

const STATUS_LABEL: Record<QuestionReview['status'], string> = {
  open: 'Needs an answer',
  picked: 'Ready',
  read_aloud: 'Read-aloud',
  dropped: 'Dropped',
};

function flagsFor(question: ParentQuestion, field: ReconstructionFlag['field']) {
  return question.flags.filter((flag) => flag.field === field);
}

function listIds(ids: string[]) {
  const labels = ids.map((id) => `Q${id}`);
  if (labels.length < 2) return labels.join('');
  return `${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}`;
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

function ParentDetails({ question }: { question: ParentQuestion }) {
  const details = {
    'Choice labels': question.choice_letters?.join(', '),
    'Question type': question.question_type,
    'Teacher comment': question.teacher_comment,
    'Teacher result': question.is_correct == null ? '' : question.is_correct ? 'Correct' : 'Incorrect',
    'Working': question.working?.map((step) => [step.expression, ...step.steps, step.result].filter(Boolean).join(' → ')).join('\n'),
    'Selected labels': question.marks?.selected.join(', '),
    'Crossed out': question.marks?.crossed ? 'Yes' : '',
    'Other marks': question.marks?.note,
    'Teacher symbols': question.marks?.symbols.join(' '),
    'Score': question.marks?.score,
  };
  const entries = Object.entries(details).filter(([, value]) => value);
  if (!entries.length && !question.sub_questions?.length) return null;
  return (
    <details className="exam-proto__parent-details">
      <summary>More from the scan</summary>
      <dl className="exam-proto__facts">
        {entries.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
      </dl>
      {question.sub_questions?.map((part) => (
        <section key={part.id}>
          <h3>Part {part.id}: {part.stem}</h3>
          <p>Handwritten answer: {part.student_answer || 'Blank'}</p>
          <p>Teacher’s mark: {part.teacher_mark || 'None'}</p>
          <ParentDetails question={part} />
        </section>
      ))}
    </details>
  );
}

function StemEditor({
  question,
  original,
  onChange,
}: {
  question: ParentQuestion;
  original: string;
  onChange: (stem: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(question.stem);
  const [selected, setSelected] = useState<number | null>(null);
  const words = stemWords(question.stem);
  const missingBlank = question.choices.length > 0 && !question.stem.includes(BLANK);

  function commit(stem: string) {
    setSelected(null);
    setEditing(false);
    if (stem.trim()) onChange(stem.trim());
  }

  if (editing) {
    return (
      <div className="exam-proto__stem-edit">
        <textarea
          className="exam-proto__stem-input"
          value={draft}
          aria-label={`Question ${question.id} text`}
          onChange={(event) => setDraft(event.target.value)}
          rows={3}
        />
        <div className="exam-proto__row">
          <button type="button" className="exam-proto__small" onClick={() => commit(draft)}>
            Save text
          </button>
          <button type="button" className="exam-proto__small exam-proto__small--quiet" onClick={() => setEditing(false)}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {missingBlank ? (
        <>
          <p className="exam-proto__tap-hint">
            The blank was not read. Tap the word right after the blank, or the word sitting in it.
          </p>
          <p className="exam-proto__stem exam-proto__stem--tap">
            {words.map((word, index) => (
              <button
                key={`${index}-${word}`}
                type="button"
                className={`exam-proto__word${selected === index ? ' exam-proto__word--on' : ''}`}
                aria-pressed={selected === index}
                onClick={() => setSelected(selected === index ? null : index)}
              >
                {word}
              </button>
            ))}
          </p>
          {selected !== null && (
            <div className="exam-proto__row">
              <button
                type="button"
                className="exam-proto__small"
                onClick={() => commit(blankBefore(question.stem, selected))}
              >
                Blank before “{words[selected]}”
              </button>
              <button
                type="button"
                className="exam-proto__small"
                onClick={() => commit(blankInstead(question.stem, selected))}
              >
                Blank instead of “{words[selected]}”
              </button>
            </div>
          )}
        </>
      ) : (
        <h2 className="exam-proto__stem">{question.stem}</h2>
      )}
      <div className="exam-proto__row">
        <button
          type="button"
          className="exam-proto__small exam-proto__small--quiet"
          onClick={() => {
            setDraft(question.stem);
            setEditing(true);
          }}
        >
          Edit text
        </button>
        {question.stem_edited && (
          <button type="button" className="exam-proto__small exam-proto__small--quiet" onClick={() => commit(original)}>
            Undo my edits
          </button>
        )}
      </div>
    </>
  );
}

function AnswerPicker({
  question,
  entry,
  onReview,
}: {
  question: ParentQuestion;
  entry: QuestionReview;
  onReview: (entry: QuestionReview) => void;
}) {
  if (entry.status === 'dropped') return null;
  if (!question.choices.length) {
    return (
      <div className="exam-proto__answer">
        <p className="exam-proto__answer-label">No choices to pick</p>
        <button
          type="button"
          className={`exam-proto__answer-pick${entry.status === 'read_aloud' ? ' exam-proto__answer-pick--on' : ''}`}
          aria-pressed={entry.status === 'read_aloud'}
          onClick={() => onReview(entry.status === 'read_aloud' ? { status: 'open' } : { status: 'read_aloud' })}
        >
          Keep as read-aloud
        </button>
      </div>
    );
  }
  return (
    <div className="exam-proto__answer">
      <p className="exam-proto__answer-label" id={`answer-${question.id}`}>
        Pick the right answer, hidden from the child
      </p>
      <div className="exam-proto__answer-choices" role="radiogroup" aria-labelledby={`answer-${question.id}`}>
        {question.choices.map((choice) => {
          const on = entry.status === 'picked' && entry.answer === choice;
          return (
            <button
              key={choice}
              type="button"
              role="radio"
              aria-checked={on}
              className={`exam-proto__answer-pick${on ? ' exam-proto__answer-pick--on' : ''}`}
              onClick={() => onReview({ status: 'picked', answer: choice })}
            >
              {choice}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function ExamPrototypeScreen({ onExit }: ExamPrototypeScreenProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const started = useRef(false);
  const scanToken = useRef(0);
  const savedPaths = useRef<string[]>([]);
  const saveChain = useRef<Promise<void>>(Promise.resolve());
  const [phase, setPhase] = useState<Phase>('pick');
  const [error, setError] = useState('');
  const [scan, setScan] = useState<ParentScan | null>(null);
  const [review, setReview] = useState<ReviewState>({});
  const [practice, setPractice] = useState<Practice | null>(null);
  const [saved, setSaved] = useState<string[]>([]);
  const [skipped, setSkipped] = useState<string[]>([]);
  const [saveError, setSaveError] = useState('');
  const [originalStems, setOriginalStems] = useState<Record<string, string>>({});
  const [subject, setSubject] = useState<SubjectChoice>('auto');
  const [step, setStep] = useState('Straightening the page…');
  const [unsupported, setUnsupported] = useState(false);

  const runFile = useCallback(async (file: File, demo: boolean, subjectChoice: SubjectChoice = 'auto') => {
    scanToken.current += 1;
    savedPaths.current = [];
    setPhase('loading');
    setError('');
    setUnsupported(false);
    setStep('Straightening the page and lifting ink…');
    setSaveError('');
    setSaved([]);
    setSkipped([]);
    setPractice(null);
    try {
      const next = await extractExam(file, demo, subjectChoice, setStep);
      setOriginalStems(Object.fromEntries(next.questions.map((question) => [question.id, question.stem])));
      setScan(next);
      setReview(initialReview(next));
      setPhase('parent');
    } catch (err) {
      setUnsupported(err instanceof UnsupportedPageError);
      setError(err instanceof Error ? err.message : 'Could not scan that photo.');
      setPhase('error');
    }
  }, []);

  useEffect(() => {
    if (!scan || phase !== 'parent') return;
    const token = scanToken.current;
    const copy = parentCopy(scan, review);
    const timer = window.setTimeout(() => {
      saveChain.current = saveChain.current.then(async () => {
        if (token !== scanToken.current) return;
        try {
          const result = await saveExam(copy, savedPaths.current);
          if (token !== scanToken.current) return;
          savedPaths.current = result.paths;
          setSaved(result.paths);
          setSkipped(result.skipped);
          setSaveError('');
        } catch (err) {
          if (token !== scanToken.current) return;
          setSaveError(err instanceof Error ? err.message : 'Could not save the note.');
        }
      });
    }, 400);
    return () => window.clearTimeout(timer);
  }, [scan, review, phase]);

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
    void runFile(file, false, subject);
  }

  function setEntry(id: string, entry: QuestionReview) {
    setReview((prev) => ({ ...prev, [id]: entry }));
  }

  function setStem(id: string, stem: string) {
    setScan((prev) =>
      prev && {
        ...prev,
        questions: prev.questions.map((question) =>
          question.id === id ? { ...question, stem, stem_edited: stem !== originalStems[id] } : question,
        ),
      },
    );
  }

  function openChild() {
    if (!scan) return;
    try {
      const next = buildPractice(scan, review);
      if (!next) {
        setError('Practice is locked until every question has an answer or is dropped.');
        return;
      }
      setPractice(next);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Child view was not safe to open.');
    }
  }

  if (practice) {
    return (
      <ExamChildPractice view={practice.view} onGrade={practice.grade} onBack={() => setPractice(null)} onExit={onExit} />
    );
  }

  const progress = scan ? reviewProgress(scan, review) : null;
  const copy = scan ? parentCopy(scan, review) : null;
  const copyById = new Map(
    (copy?.questions ?? [])
      .filter((question) => question.explanation)
      .map((question) => [question.id, question]),
  );
  const total = scan?.questions.length ?? 0;

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
            <label className="exam-proto__subject">
              Subject
              <select value={subject} onChange={(event) => setSubject(event.target.value as SubjectChoice)}>
                {SUBJECTS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
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
            <p>{step}</p>
          </div>
        )}

        {phase === 'error' && (
          <div className="scan__error" role="alert">
            <p className="scan__error-title">{unsupported ? 'This page is not supported yet' : 'Could not scan that photo'}</p>
            <p className="scan__error-body">{error}</p>
            <button type="button" className="exam-proto__secondary" onClick={() => setPhase('pick')}>
              Back
            </button>
          </div>
        )}

        {phase === 'parent' && scan && progress && (
          <div className="exam-proto__review">
            {scan.note && <p className="exam-proto__banner">{scan.note}</p>}
            {(scan.page_flags ?? []).length > 0 && (
              <ul className="exam-proto__page-flags" aria-label="Page checks">
                {(scan.page_flags ?? []).map((flag) => (
                  <li key={flag.kind} data-kind={flag.kind}>
                    {flag.note}
                  </li>
                ))}
              </ul>
            )}
            <p className="exam-proto__progress" role="status">
              Answers checked: {progress.ready + progress.dropped} of {total}.
              {progress.dropped > 0 && ` ${progress.dropped} dropped.`} Practice opens when every question has
              an answer or is dropped.
            </p>
            <p className="exam-proto__save" role="status">
              {saved.length > 0 && (
                <>
                  Saved {saved.length === 1 ? 'note' : 'notes'}: {saved.join(' · ')}
                </>
              )}
              {skipped.length > 0 && <> Vault folder not writable here: {skipped.join(' · ')}.</>}
              {saveError && <>Could not save the note. {saveError}</>}
              {!saved.length && !skipped.length && !saveError && 'Saving the note…'}
            </p>
            {copy?.questions.some((question) => question.flags.length > 0) && (
              <ul className="exam-proto__flag-summary">
                {[
                  ...new Map(
                    copy.questions.flatMap((question) =>
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

            {scan.questions.map((question) => {
              const entry = review[question.id] ?? { status: 'open' };
              const explained = copyById.get(question.id);
              const dropped = entry.status === 'dropped';
              return (
                <article
                  key={question.id}
                  className={`exam-proto__card${dropped ? ' exam-proto__card--dropped' : ''}`}
                  data-review={entry.status}
                >
                  <div className="exam-proto__card-head">
                    <p className="exam-proto__kicker">Question {question.id}</p>
                    <span className={`exam-proto__status exam-proto__status--${entry.status}`}>
                      {STATUS_LABEL[entry.status]}
                    </span>
                  </div>
                  {dropped ? (
                    <h2 className="exam-proto__stem">{question.stem}</h2>
                  ) : (
                    <StemEditor
                      question={question}
                      original={originalStems[question.id] ?? question.stem}
                      onChange={(stem) => setStem(question.id, stem)}
                    />
                  )}
                  {!dropped && <FlagTape flags={flagsFor(question, 'stem')} />}
                  {!dropped && (
                    <>
                      <AnswerPicker question={question} entry={entry} onReview={(next) => setEntry(question.id, next)} />
                      <FlagTape flags={[...flagsFor(question, 'choices'), ...flagsFor(question, 'correct_answer')]} />
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
                      </dl>
                      <ParentDetails question={question} />
                      <p className="exam-proto__explain">
                        <span className="exam-proto__explain-label">For you</span>
                        {explained?.explanation || 'Pick the right answer and a short explanation appears here.'}
                      </p>
                      {explained && <FlagTape flags={flagsFor(explained, 'explanation')} />}
                    </>
                  )}
                  <button
                    type="button"
                    className="exam-proto__small exam-proto__small--quiet exam-proto__drop"
                    onClick={() => setEntry(question.id, dropped ? { status: 'open' } : { status: 'dropped' })}
                  >
                    {dropped ? 'Put this question back' : 'Drop this question'}
                  </button>
                </article>
              );
            })}

            {error && (
              <p className="scan__edit-error" role="alert">
                {error}
              </p>
            )}
            <div className={`exam-proto__gate${progress.unlocked ? '' : ' exam-proto__gate--locked'}`}>
              <p className="exam-proto__gate-note" role="status">
                {progress.unlocked && `Ready. ${progress.ready} of ${total} questions go to practice.`}
                {!progress.unlocked &&
                  progress.open.length > 0 &&
                  `Practice is locked. Pick an answer or drop ${listIds(progress.open)}.`}
                {!progress.unlocked &&
                  progress.open.length === 0 &&
                  'Practice is locked. Every question was dropped, so there is nothing to practice.'}
              </p>
              <button
                type="button"
                className="btn-primary exam-proto__cta"
                onClick={openChild}
                disabled={!progress.unlocked}
              >
                {progress.unlocked ? 'Practice with Pip' : 'Practice locked'}
              </button>
            </div>
            <button type="button" className="exam-proto__secondary" onClick={() => setPhase('pick')}>
              Scan another photo
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
