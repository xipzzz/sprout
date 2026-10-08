/* Dev-only screenshot mount. Not imported by the production entry. */
/* eslint-disable react-refresh/only-export-components */

import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import ScanQuizScreen from '../screens/ScanQuizScreen';
import ScanReviewScreen from '../screens/ScanReviewScreen';
import { ScanErrorPreview, ScanLoadingPreview } from '../screens/ScanHomeworkScreen';
import type { ReviewQuestion } from '../lib/scan/review';
import { checkFixture, quizFixture } from './fixtures';

function syntheticPage(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 480;
  canvas.height = 640;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 480, 640);
  ctx.strokeStyle = '#2A2320';
  ctx.lineWidth = 8;
  ctx.strokeRect(18, 18, 444, 604);
  ctx.fillStyle = '#2A2320';
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText('Synthetic page', 40, 78);
  ctx.font = '22px sans-serif';
  ctx.fillText('1. Which shape is a box?', 40, 150);
  ctx.fillText('circle     box     line', 40, 196);
  return canvas.toDataURL('image/jpeg', 0.85);
}

function CheckShot() {
  const [questions, setQuestions] = useState<ReviewQuestion[]>(() => checkFixture());
  return (
    <ScanReviewScreen
      questions={questions}
      onChange={setQuestions}
      onPractice={() => {}}
      onBack={() => {}}
      photos={[syntheticPage()]}
      mark
    />
  );
}

export function mountScanShot(which: string) {
  const root = document.getElementById('root');
  if (!root) return;
  const screen = which === 'check'
    ? <CheckShot />
    : which === 'error'
      ? <ScanErrorPreview mark />
      : which === 'loading'
        ? <ScanLoadingPreview mark />
        : <ScanQuizScreen parts={quizFixture(which)} onExit={() => {}} onComplete={() => {}} markAnswers />;
  createRoot(root).render(<StrictMode><div className="app">{screen}</div></StrictMode>);
}
