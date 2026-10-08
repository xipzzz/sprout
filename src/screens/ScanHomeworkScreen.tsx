/* Scan homework — photograph real pages, clean them on the device,
   read them through the Worker, then a parent checks every question.
   If the reader is not set up, or a page cannot be read, we stop.
   No sample questions. */

import { useEffect, useRef, useState } from 'react';
import PipPose from '../components/PipPose';
import { fetchScanHealth, postScanPage } from '../lib/scan/api';
import { scanGoogleClientId, scanWorkerUrl } from '../lib/scan/config';
import { mergeScannedPages } from '../lib/scan/merge';
import { renderGoogleButton } from '../lib/scan/parentAuth';
import { cleanHomeworkPhoto } from '../lib/scan/preprocess';
import { buildQuiz } from '../lib/scan/quizMap';
import { createReview, type ReviewQuestion } from '../lib/scan/review';
import { formatQuizDay, type HomeworkQuiz } from '../lib/scan/storage';
import type { ScannedQuestion } from '../lib/scan/types';
import { playSproutFeedback } from '../utils/feedback';
import ScanReviewScreen from './ScanReviewScreen';

interface ScanHomeworkScreenProps {
  onCancel: () => void;
  onReady: (quiz: HomeworkQuiz) => void;
}

type Phase = 'boot' | 'unconfigured' | 'auth-needed' | 'signin' | 'capture' | 'working' | 'error' | 'paused' | 'review';

interface LocalPage {
  id: string;
  file: File;
  previewUrl: string;
}

const MAX_PAGES = 6;

export default function ScanHomeworkScreen({ onCancel, onReady }: ScanHomeworkScreenProps) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const googleRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>(() => (scanWorkerUrl() ? 'boot' : 'unconfigured'));
  const [errorMsg, setErrorMsg] = useState('');
  const [status, setStatus] = useState('');
  const [pages, setPages] = useState<LocalPage[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [review, setReview] = useState<ReviewQuestion[]>([]);

  useEffect(() => {
    if (phase !== 'boot') return;
    let cancelled = false;
    fetchScanHealth()
      .then((health) => {
        if (cancelled) return;
        if (!health.providerConfigured) {
          setPhase('unconfigured');
          return;
        }
        if (health.paused) {
          setPhase('paused');
          return;
        }
        if (!health.authConfigured || !scanGoogleClientId()) {
          setPhase('auth-needed');
          return;
        }
        setPhase('signin');
      })
      .catch(() => {
        if (cancelled) return;
        setErrorMsg('Pip cannot reach the homework reader. Check the connection and try again.');
        setPhase('error');
      });
    return () => {
      cancelled = true;
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== 'signin' || !googleRef.current) return;
    const clientId = scanGoogleClientId();
    let cancelled = false;
    renderGoogleButton(googleRef.current, clientId, (next) => {
      if (cancelled) return;
      setToken(next);
      setPhase('capture');
    }).catch(() => {
      if (cancelled) return;
      setErrorMsg('Parent sign-in did not load. Try again in a moment.');
      setPhase('error');
    });
    return () => {
      cancelled = true;
    };
  }, [phase]);

  const pagesRef = useRef<LocalPage[]>([]);
  useEffect(() => {
    pagesRef.current = pages;
  }, [pages]);
  useEffect(() => () => {
    pagesRef.current.forEach((page) => URL.revokeObjectURL(page.previewUrl));
  }, []);

  function addFiles(list: FileList | null) {
    if (!list) return;
    const next: LocalPage[] = [];
    for (const file of list) {
      if (!file.type.startsWith('image/')) continue;
      next.push({ id: `${file.name}-${file.size}-${Math.random()}`, file, previewUrl: URL.createObjectURL(file) });
    }
    setPages((current) => [...current, ...next].slice(0, MAX_PAGES));
  }

  function removePage(id: string) {
    setPages((current) => {
      const page = current.find((item) => item.id === id);
      if (page) URL.revokeObjectURL(page.previewUrl);
      return current.filter((item) => item.id !== id);
    });
  }

  async function readPages() {
    if (!token || pages.length === 0) return;
    setPhase('working');
    setErrorMsg('');
    const collected: { questions: ScannedQuestion[]; suggestions: Record<string, string> }[] = [];
    try {
      for (let i = 0; i < pages.length; i++) {
        setStatus(`Straightening page ${i + 1} of ${pages.length}…`);
        let jpeg: Blob;
        try {
          jpeg = await cleanHomeworkPhoto(pages[i].file);
        } catch {
          setErrorMsg('Pip could not clean up that photo. Try a brighter picture of the whole page.');
          setPhase('error');
          return;
        }
        setStatus(`Reading page ${i + 1} of ${pages.length}…`);
        const result = await postScanPage(jpeg, token);
        if (!result.ok) {
          if (result.code === 'spending_cap') {
            setPhase('paused');
            return;
          }
          setErrorMsg(result.message);
          setPhase('error');
          return;
        }
        collected.push({ questions: result.questions, suggestions: result.suggestions });
      }
    } catch {
      setErrorMsg('Pip could not read that page. Try another photo.');
      setPhase('error');
      return;
    }
    const merged = mergeScannedPages(collected);
    if (merged.questions.length === 0) {
      setErrorMsg('No printed questions were found. Try another photo.');
      setPhase('error');
      return;
    }
    setReview(createReview(merged.questions, merged.suggestions));
    setPhase('review');
    playSproutFeedback('gardenGrowth');
  }

  function practice() {
    const parts = buildQuiz(review);
    if (parts.length === 0) return;
    const now = Date.now();
    onReady({
      id: `hw-${now}`,
      title: parts.length > 1 ? `Homework · ${formatQuizDay(now)} · ${parts.length} parts` : `Homework · ${formatQuizDay(now)}`,
      createdAt: now,
      parts,
    });
  }

  if (phase === 'review') {
    return (
      <ScanReviewScreen
        questions={review}
        onChange={setReview}
        onPractice={practice}
        onBack={() => setPhase('capture')}
      />
    );
  }

  return (
    <div className="screen scan" data-scan-shot-ready="">
      <header className="scan__top">
        <button type="button" className="lesson__close" onClick={onCancel} aria-label="Back to Today">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <h1 className="scan__title">Scan homework</h1>
      </header>
      <main className="screen__body scan__body">
        <div className="scan__hero">
          <PipPose className="scan__pip" pose={phase === 'error' || phase === 'paused' ? 'almost' : 'neutral'} />
          <p className="scan__lead">{leadFor(phase)}</p>
        </div>

        {phase === 'boot' && (
          <p className="scan__loading" role="status">Checking the homework reader…</p>
        )}

        {(phase === 'unconfigured' || phase === 'auth-needed' || phase === 'paused' || phase === 'error') && (
          <div className={`scan-note${phase === 'error' ? ' scan-note--error' : ''}`} role={phase === 'error' ? 'alert' : 'status'}>
            <p className="scan-note__title">{titleFor(phase)}</p>
            <p className="scan-note__body">{phase === 'error' ? errorMsg : bodyFor(phase)}</p>
          </div>
        )}

        {phase === 'signin' && (
          <div className="scan-note">
            <p className="scan-note__title">A parent signs in first</p>
            <p className="scan-note__body">Only a signed-in parent can send a page to be read.</p>
            <div ref={googleRef} className="scan-google" />
          </div>
        )}

        {phase === 'capture' && (
          <>
            <input
              ref={cameraRef}
              className="scan__file"
              type="file"
              accept="image/*"
              capture="environment"
              aria-label="Take photo with camera"
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = '';
              }}
            />
            <input
              ref={galleryRef}
              className="scan__file"
              type="file"
              accept="image/*"
              multiple
              aria-label="Choose photos from gallery"
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = '';
              }}
            />
            <div className="scan__actions">
              <button type="button" className="scan__action-btn" onClick={() => cameraRef.current?.click()}>
                <span className="scan__action-icon" aria-hidden="true">📷</span>
                <span className="scan__action-label">Take photo</span>
              </button>
              <button type="button" className="scan__action-btn" onClick={() => galleryRef.current?.click()}>
                <span className="scan__action-icon" aria-hidden="true">🖼️</span>
                <span className="scan__action-label">Photo library</span>
              </button>
            </div>
            {pages.length > 0 && (
              <ul className="scan-pages" aria-label="Pages to read">
                {pages.map((page, index) => (
                  <li key={page.id}>
                    <img src={page.previewUrl} alt={`Page ${index + 1}`} />
                    <button type="button" onClick={() => removePage(page.id)} aria-label={`Remove page ${index + 1}`}>
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button type="button" className="lesson__check" disabled={pages.length === 0} onClick={readPages}>
              Read {pages.length === 1 ? 'this page' : `these ${pages.length} pages`}
            </button>
          </>
        )}

        {phase === 'working' && (
          <p className="scan__loading" role="status">{status}</p>
        )}

        {phase === 'error' && (
          <button type="button" className="lesson__check" onClick={() => setPhase(token ? 'capture' : 'boot')}>
            Try another photo
          </button>
        )}
      </main>
    </div>
  );
}

function leadFor(phase: Phase): string {
  if (phase === 'unconfigured') return 'The homework reader is not connected yet.';
  if (phase === 'auth-needed') return 'Scanning stays off until a parent can sign in.';
  if (phase === 'paused') return 'Scanning is paused for now.';
  if (phase === 'error') return 'That page was not read.';
  if (phase === 'working') return 'Pip is reading the printed words.';
  return 'Photograph a homework page. A grown-up checks it before practice.';
}

function titleFor(phase: Phase): string {
  if (phase === 'unconfigured') return 'Scanning isn’t set up yet';
  if (phase === 'auth-needed') return 'Scanning needs a parent sign-in';
  if (phase === 'paused') return 'Scanning is paused';
  return 'Pip couldn’t read that page';
}

function bodyFor(phase: Phase): string {
  if (phase === 'unconfigured') {
    return 'A grown-up still needs to connect the homework reader. Pip will not make up questions while we wait.';
  }
  if (phase === 'auth-needed') {
    return 'Sprout does not have accounts yet, so Pip cannot tell who is scanning. Homework photos stay off until a grown-up connects sign-in.';
  }
  if (phase === 'paused') {
    return 'Pip has used this month’s reading budget. A grown-up can turn it back on. Your other lessons are still here.';
  }
  return '';
}

export function ScanErrorPreview({ message, mark = false }: { message: string; mark?: boolean }) {
  return (
    <div className="screen scan" data-scan-shot-ready="">
      <header className="scan__top">
        <button type="button" className="lesson__close" aria-label="Back to Today">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <h1 className="scan__title">Scan homework</h1>
      </header>
      <main className="screen__body scan__body">
        <div className="scan__hero">
          <PipPose className="scan__pip" pose="almost" />
          <p className="scan__lead">That page was not read.</p>
        </div>
        <div className={`scan-note scan-note--error${mark ? ' scan-shot-mark' : ''}`} role="alert">
          <p className="scan-note__title">Pip couldn’t read that page</p>
          <p className="scan-note__body">{message}</p>
        </div>
        <button type="button" className="lesson__check">Try another photo</button>
      </main>
    </div>
  );
}
