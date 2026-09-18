/* ScanHomeworkScreen — kids pick a homework photo (camera/gallery) or tap
   the bundled sample demo. OCR drafts a word-pick; parent edits, then Start. */

import { useRef, useState } from 'react';
import PipPose from '../components/PipPose';
import {
  hasHomeworkParseProvider,
  parseHomeworkImage,
  parseSampleHomework,
  type WordPickQuestion,
} from '../lib/homeworkParse';
import { playSproutFeedback } from '../utils/feedback';

interface ScanHomeworkScreenProps {
  onCancel: () => void;
  onParsed: (question: WordPickQuestion) => void;
}

type Phase = 'pick' | 'loading' | 'edit' | 'error';

interface DraftState {
  prompt: string;
  choices: string[];
  correctIndex: number;
  source: WordPickQuestion['source'];
}

function questionToDraft(q: WordPickQuestion): DraftState {
  const choices = [...q.choices].slice(0, 4);
  const idx = Math.max(0, choices.findIndex((c) => c === q.correct));
  return {
    prompt: q.prompt,
    choices,
    correctIndex: idx === -1 ? 0 : idx,
    source: q.source,
  };
}

export default function ScanHomeworkScreen({ onCancel, onParsed }: ScanHomeworkScreenProps) {
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>('pick');
  const [errorMsg, setErrorMsg] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftState | null>(null);
  const providerReady = hasHomeworkParseProvider();

  function enterEdit(q: WordPickQuestion) {
    setErrorMsg('');
    setDraft(questionToDraft(q));
    setPhase('edit');
    playSproutFeedback('gardenGrowth');
  }

  async function runSample() {
    setPhase('loading');
    setErrorMsg('');
    playSproutFeedback('gardenGrowth');
    const result = await parseSampleHomework();
    if (result.ok) {
      enterEdit(result.question);
    } else {
      setErrorMsg(result.message);
      setPhase('error');
    }
  }

  async function onFileChosen(file: File | undefined) {
    if (!file) return;
    try {
      setPreviewUrl(URL.createObjectURL(file));
    } catch { /* ignore */ }
    setPhase('loading');
    setErrorMsg('');
    const result = await parseHomeworkImage(file);
    if (result.ok) {
      enterEdit(result.question);
      return;
    }
    setErrorMsg(result.message);
    setPhase('error');
  }

  function updateChoice(index: number, value: string) {
    setDraft((d) => {
      if (!d) return d;
      const choices = [...d.choices];
      choices[index] = value;
      return { ...d, choices };
    });
  }

  function addChoice() {
    setDraft((d) => {
      if (!d || d.choices.length >= 4) return d;
      return { ...d, choices: [...d.choices, ''] };
    });
  }

  function removeChoice(index: number) {
    setDraft((d) => {
      if (!d || d.choices.length <= 2) return d;
      const choices = d.choices.filter((_, i) => i !== index);
      let correctIndex = d.correctIndex;
      if (index === d.correctIndex) correctIndex = 0;
      else if (index < d.correctIndex) correctIndex = d.correctIndex - 1;
      return { ...d, choices, correctIndex };
    });
  }

  function startPractice() {
    if (!draft) return;
    const prompt = draft.prompt.trim();
    const choices = draft.choices.map((c) => c.trim()).filter(Boolean);
    if (!prompt || choices.length < 2) {
      setErrorMsg('Please fill the prompt and at least 2 choices.');
      return;
    }
    // Map correctIndex onto trimmed non-empty choices
    const rawCorrect = (draft.choices[draft.correctIndex] || '').trim();
    const correct = choices.includes(rawCorrect) ? rawCorrect : choices[0];
    setErrorMsg('');
    playSproutFeedback('gardenGrowth');
    onParsed({
      prompt,
      choices: choices.slice(0, 4),
      correct,
      source: draft.source,
    });
  }

  function backToPick() {
    setPhase('pick');
    setErrorMsg('');
    setDraft(null);
    setPreviewUrl(null);
    if (galleryInputRef.current) galleryInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div className="screen scan">
      <header className="scan__top">
        <button
          type="button"
          className="lesson__close"
          onClick={() => {
            playSproutFeedback('modalClose');
            onCancel();
          }}
          aria-label="Back to Today"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <h1 className="scan__title">
          {phase === 'edit' ? 'Check the exercise' : 'Scan homework'}
        </h1>
      </header>

      <main className="screen__body scan__body">
        {phase !== 'edit' && (
          <div className="scan__hero">
            <PipPose className="scan__pip" pose="neutral" />
            <p className="scan__lead">
              Take or pick a homework photo. Pip drafts one word-pick — a parent can fix it, then Start.
            </p>
          </div>
        )}

        {previewUrl && phase !== 'edit' && (
          <img className="scan__preview" src={previewUrl} alt="Selected homework" />
        )}

        {phase === 'loading' && (
          <div className="scan__loading" role="status" aria-live="polite">
            <span className="scan__spinner" aria-hidden="true" />
            <p>Reading with free open-source text scan…</p>
          </div>
        )}

        {phase === 'error' && (
          <div className="scan__error" role="alert">
            <p className="scan__error-title">Could not scan that photo</p>
            <p className="scan__error-body">{errorMsg}</p>
          </div>
        )}

        {phase === 'edit' && draft && (
          <div className="scan__edit" aria-label="Edit word-pick before practice">
            <p className="scan__edit-note" role="note">
              Works best on clear printed worksheets. Handwriting may need a parent edit below.
            </p>

            {previewUrl && (
              <img className="scan__preview scan__preview--edit" src={previewUrl} alt="Selected homework" />
            )}

            <label className="scan__field">
              <span className="scan__field-label">Prompt</span>
              <textarea
                className="scan__input scan__input--prompt"
                rows={2}
                value={draft.prompt}
                onChange={(e) => setDraft({ ...draft, prompt: e.target.value })}
              />
            </label>

            <fieldset className="scan__choices">
              <legend className="scan__field-label">Choices (select the correct answer)</legend>
              {draft.choices.map((choice, i) => (
                <div className="scan__choice-row" key={i}>
                  <input
                    type="radio"
                    name="scan-correct"
                    className="scan__correct-radio"
                    checked={draft.correctIndex === i}
                    onChange={() => setDraft({ ...draft, correctIndex: i })}
                    aria-label={`Mark choice ${i + 1} as correct`}
                  />
                  <input
                    type="text"
                    className="scan__input"
                    value={choice}
                    placeholder={`Choice ${i + 1}`}
                    onChange={(e) => updateChoice(i, e.target.value)}
                    aria-label={`Choice ${i + 1}`}
                  />
                  {draft.choices.length > 2 && (
                    <button
                      type="button"
                      className="scan__choice-remove"
                      onClick={() => removeChoice(i)}
                      aria-label={`Remove choice ${i + 1}`}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              {draft.choices.length < 4 && (
                <button type="button" className="scan__add-choice" onClick={addChoice}>
                  + Add choice
                </button>
              )}
            </fieldset>

            {errorMsg && (
              <p className="scan__edit-error" role="alert">{errorMsg}</p>
            )}

            <button type="button" className="btn-primary scan__cta" onClick={startPractice}>
              Start practice
            </button>
            <button type="button" className="scan__retry" onClick={backToPick}>
              Back
            </button>
          </div>
        )}

        {(phase === 'pick' || phase === 'error') && (
          <>
            <p className="scan__key-note" role="note">
              Free open-source text scan (Tesseract) runs in your browser — best on clear printed
              sheets. Handwriting may need parent edits. Sample homework always works.
              {!providerReady && ' Live scan is unavailable right now; use the sample below.'}
            </p>

            {/* Hidden file inputs for each action */}
            <input
              ref={galleryInputRef}
              className="scan__file"
              type="file"
              accept="image/*"
              aria-label="Choose image from gallery"
              onChange={(e) => onFileChosen(e.target.files?.[0])}
            />
            <input
              ref={cameraInputRef}
              className="scan__file"
              type="file"
              accept="image/*"
              capture="environment"
              aria-label="Take photo with camera"
              onChange={(e) => onFileChosen(e.target.files?.[0])}
            />
            <input
              ref={fileInputRef}
              className="scan__file"
              type="file"
              accept="image/*"
              aria-label="Choose file"
              onChange={(e) => onFileChosen(e.target.files?.[0])}
            />

            {/* Three visible action buttons */}
            <div className="scan__actions">
              <button
                type="button"
                className="scan__action-btn scan__action-btn--gallery"
                onClick={() => galleryInputRef.current?.click()}
              >
                <span className="scan__action-icon" aria-hidden="true">🖼️</span>
                <span className="scan__action-label">Attach image</span>
              </button>

              <button
                type="button"
                className="scan__action-btn scan__action-btn--camera"
                onClick={() => cameraInputRef.current?.click()}
              >
                <span className="scan__action-icon" aria-hidden="true">📷</span>
                <span className="scan__action-label">Take photo</span>
              </button>

              <button
                type="button"
                className="scan__action-btn scan__action-btn--file"
                onClick={() => fileInputRef.current?.click()}
              >
                <span className="scan__action-icon" aria-hidden="true">📁</span>
                <span className="scan__action-label">Choose file</span>
              </button>
            </div>

            <button
              type="button"
              className="scan__sample"
              onClick={runSample}
            >
              Use sample homework
              <span className="scan__sample-badge">Demo · always works</span>
            </button>

            {phase === 'error' && (
              <button
                type="button"
                className="scan__retry"
                onClick={backToPick}
              >
                Try again
              </button>
            )}
          </>
        )}
      </main>
    </div>
  );
}
