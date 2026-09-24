/* Scan homework — photo or file → deskew preview → OCR drafts → parent gate.
   Play uses only questions the parent accepted from this sheet. */

import { useRef, useState } from 'react';
import PipPose from '../components/PipPose';
import {
  assessAcceptance,
  canStartPractice,
  toPlayable,
  type DraftQuestion,
  type PlayableQuestion,
} from '../lib/homeworkQuestions';
import { hasOnDeviceOcr, readStraightenedSheet, straightenHomeworkFile } from '../lib/homeworkScan';
import { playSproutFeedback } from '../utils/feedback';

interface ScanHomeworkScreenProps {
  onCancel: () => void;
  onPlay: (questions: PlayableQuestion[]) => void;
}

type Phase = 'pick' | 'straighten' | 'read' | 'verify' | 'error';

interface CardState {
  id: string;
  stem: string;
  choices: string[];
  correct: string | null;
  confidence: number;
  status: 'pending' | 'accepted' | 'dropped';
  editing: boolean;
  parentEdited: boolean;
}

function toCard(draft: DraftQuestion): CardState {
  return {
    id: draft.id,
    stem: draft.stem,
    choices: draft.choices,
    correct: draft.correct,
    confidence: draft.confidence,
    status: 'pending',
    editing: false,
    parentEdited: false,
  };
}

export default function ScanHomeworkScreen({ onCancel, onPlay }: ScanHomeworkScreenProps) {
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<string | null>(null);
  const [phase, setPhase] = useState<Phase>('pick');
  const [errorMsg, setErrorMsg] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cards, setCards] = useState<CardState[]>([]);
  const ocrReady = hasOnDeviceOcr();

  function replacePreview(url: string | null) {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = url;
    setPreviewUrl(url);
  }

  function clearInputs() {
    if (galleryInputRef.current) galleryInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function onFileChosen(file: File | undefined) {
    if (!file) return;
    setErrorMsg('');
    setCards([]);
    setPhase('straighten');
    const straight = await straightenHomeworkFile(file);
    if (!straight.ok) {
      replacePreview(null);
      setErrorMsg(straight.message);
      setPhase('error');
      return;
    }
    replacePreview(URL.createObjectURL(straight.previewBlob));
    setPhase('read');
    const read = await readStraightenedSheet(straight.previewBlob);
    if (!read.ok) {
      setErrorMsg(read.message);
      setPhase('error');
      return;
    }
    setCards(read.questions.map(toCard));
    setPhase('verify');
    playSproutFeedback('gardenGrowth');
  }

  function updateCard(id: string, patch: Partial<CardState>) {
    setCards((current) => current.map((card) => (card.id === id ? { ...card, ...patch } : card)));
  }

  function updateChoice(id: string, index: number, value: string) {
    setCards((current) => current.map((card) => {
      if (card.id !== id) return card;
      const choices = card.choices.slice();
      choices[index] = value;
      return { ...card, choices };
    }));
  }

  function finishEdit(card: CardState) {
    updateCard(card.id, { editing: false, parentEdited: true, status: 'pending' });
  }

  function acceptCard(card: CardState) {
    const gate = assessAcceptance(card);
    if (!gate.canAccept) return;
    updateCard(card.id, { status: 'accepted', editing: false });
    playSproutFeedback('correct');
  }

  function playLesson() {
    const accepted = cards.filter((card) => card.status === 'accepted' && assessAcceptance(card).canAccept);
    const questions = accepted.flatMap((card) => {
      const playable = toPlayable(card);
      return playable ? [playable] : [];
    });
    if (!canStartPractice(questions.length)) return;
    playSproutFeedback('gardenGrowth');
    onPlay(questions);
  }

  function backToPick() {
    setPhase('pick');
    setErrorMsg('');
    setCards([]);
    replacePreview(null);
    clearInputs();
  }

  const acceptedCount = cards.filter((card) => card.status === 'accepted' && assessAcceptance(card).canAccept).length;
  const playReady = canStartPractice(acceptedCount);

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
        <h1 className="scan__title">{phase === 'verify' ? 'Check the questions' : 'Scan homework'}</h1>
      </header>

      <main className="screen__body scan__body">
        {phase !== 'verify' && (
          <div className="scan__hero">
            <PipPose className="scan__pip" pose="neutral" />
            <p className="scan__lead">
              Take or pick a printed English worksheet. Pip straightens the page, reads the questions, and a parent checks them before play.
            </p>
          </div>
        )}

        {previewUrl && (
          <figure className="scan__figure">
            <img className="scan__preview" src={previewUrl} alt="Straightened homework sheet" />
            <figcaption className="scan__caption">Straightened page — text is read from this image.</figcaption>
          </figure>
        )}

        {(phase === 'straighten' || phase === 'read') && (
          <div className="scan__loading" role="status" aria-live="polite">
            <span className="scan__spinner" aria-hidden="true" />
            <p>{phase === 'straighten' ? 'Straightening the page…' : 'Reading the straightened sheet…'}</p>
          </div>
        )}

        {phase === 'error' && (
          <div className="scan__error" role="alert">
            <p className="scan__error-title">Could not use that photo</p>
            <p className="scan__error-body">{errorMsg}</p>
          </div>
        )}

        {phase === 'verify' && (
          <div className="scan__verify">
            <p className="scan__edit-note" role="note">
              Accept at least 4 questions from this sheet. Low-confidence or garbled drafts can be edited or dropped — they cannot be accepted as-is.
            </p>
            <ul className="scan__cards">
              {cards.map((card, index) => {
                const gate = assessAcceptance(card);
                return (
                  <li key={card.id} className={`scan__card scan__card--${card.status}`}>
                    <div className="scan__card-head">
                      <span className="scan__card-index">Question {index + 1}</span>
                      <span className={`scan__conf${gate.lowConfidence ? ' scan__conf--low' : ''}`}>
                        {gate.lowConfidence ? 'Low' : 'Clear'} · {card.confidence}%
                      </span>
                    </div>
                    {card.status === 'dropped' ? (
                      <p className="scan__dropped">Dropped</p>
                    ) : card.editing ? (
                      <div className="scan__edit">
                        <label className="scan__field">
                          <span className="scan__field-label">Question</span>
                          <textarea
                            className="scan__input scan__input--prompt"
                            rows={3}
                            value={card.stem}
                            onChange={(event) => updateCard(card.id, { stem: event.target.value })}
                          />
                        </label>
                        <fieldset className="scan__choices">
                          <legend className="scan__field-label">Choices — mark the correct one</legend>
                          {card.choices.map((choice, choiceIndex) => (
                            <div className="scan__choice-row" key={`${card.id}-${choiceIndex}`}>
                              <input
                                type="radio"
                                name={`correct-${card.id}`}
                                className="scan__correct-radio"
                                checked={card.correct === choice && choice.trim().length > 0}
                                onChange={() => updateCard(card.id, { correct: choice })}
                                aria-label={`Mark choice ${choiceIndex + 1} correct`}
                              />
                              <input
                                type="text"
                                className="scan__input"
                                value={choice}
                                onChange={(event) => updateChoice(card.id, choiceIndex, event.target.value)}
                                aria-label={`Choice ${choiceIndex + 1}`}
                              />
                            </div>
                          ))}
                        </fieldset>
                        <button type="button" className="btn-primary scan__cta" onClick={() => finishEdit(card)}>
                          Done editing
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="scan__stem">{card.stem}</p>
                        <ul className="scan__choice-list">
                          {card.choices.map((choice) => (
                            <li key={choice} className={choice === card.correct ? 'is-correct' : undefined}>{choice}</li>
                          ))}
                        </ul>
                        {!card.correct && <p className="scan__gate">No correct answer detected yet.</p>}
                      </>
                    )}
                    {card.status !== 'dropped' && !card.editing && (
                      <p className={`scan__gate${gate.canAccept ? '' : ' scan__gate--block'}`}>{gate.reason}</p>
                    )}
                    <div className="scan__card-actions">
                      {card.status === 'dropped' ? (
                        <button type="button" className="scan__text-btn" onClick={() => updateCard(card.id, { status: 'pending' })}>
                          Undo drop
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="scan__accept"
                            disabled={!gate.canAccept || card.editing}
                            onClick={() => acceptCard(card)}
                          >
                            {card.status === 'accepted' ? 'Accepted' : 'Accept'}
                          </button>
                          <button type="button" className="scan__text-btn" onClick={() => updateCard(card.id, { editing: true })}>
                            Edit
                          </button>
                          <button type="button" className="scan__text-btn" onClick={() => updateCard(card.id, { status: 'dropped', editing: false })}>
                            Drop
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
            <button type="button" className="btn-primary scan__cta" disabled={!playReady} onClick={playLesson}>
              {playReady ? 'Play lesson' : `Play unlocks at 4 accepted · ${acceptedCount} ready`}
            </button>
            <button type="button" className="scan__retry" onClick={backToPick}>Retake</button>
          </div>
        )}

        {(phase === 'pick' || phase === 'error') && (
          <>
            <p className="scan__key-note" role="note">
              Free on-device text reading (Tesseract) runs after the page is straightened. Best on clear printed English multiple choice.
              {!ocrReady && ' Live scan is unavailable in this browser.'}
            </p>
            <input
              ref={galleryInputRef}
              className="scan__file"
              type="file"
              accept="image/*"
              aria-label="Choose image from gallery"
              onChange={(event) => onFileChosen(event.target.files?.[0])}
            />
            <input
              ref={cameraInputRef}
              className="scan__file"
              type="file"
              accept="image/*"
              capture="environment"
              aria-label="Take photo with camera"
              onChange={(event) => onFileChosen(event.target.files?.[0])}
            />
            <input
              ref={fileInputRef}
              className="scan__file"
              type="file"
              accept="image/*"
              aria-label="Choose file"
              onChange={(event) => onFileChosen(event.target.files?.[0])}
            />
            <div className="scan__actions">
              <button type="button" className="scan__action-btn scan__action-btn--gallery" onClick={() => galleryInputRef.current?.click()}>
                <span className="scan__action-icon" aria-hidden="true">🖼️</span>
                <span className="scan__action-label">Attach image</span>
              </button>
              <button type="button" className="scan__action-btn scan__action-btn--camera" onClick={() => cameraInputRef.current?.click()}>
                <span className="scan__action-icon" aria-hidden="true">📷</span>
                <span className="scan__action-label">Take photo</span>
              </button>
              <button type="button" className="scan__action-btn scan__action-btn--file" onClick={() => fileInputRef.current?.click()}>
                <span className="scan__action-icon" aria-hidden="true">📁</span>
                <span className="scan__action-label">Choose file</span>
              </button>
            </div>
            {phase === 'error' && (
              <button type="button" className="scan__retry" onClick={backToPick}>Try again</button>
            )}
          </>
        )}
      </main>
    </div>
  );
}
