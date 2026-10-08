/* Dev-only screenshot mount. Not imported by the production entry. */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import ScanQuizScreen from '../screens/ScanQuizScreen';
import ScanReviewScreen from '../screens/ScanReviewScreen';
import { ScanErrorPreview } from '../screens/ScanHomeworkScreen';
import { checkFixture, quizFixture } from './fixtures';

export function mountScanShot(which: string) {
  const root = document.getElementById('root');
  if (!root) return;
  const screen = which === 'check'
    ? <ScanReviewScreen questions={checkFixture()} onChange={() => {}} onPractice={() => {}} onBack={() => {}} markList />
    : which === 'error'
      ? <ScanErrorPreview mark message="No printed questions were found on that page. Try another photo." />
      : <ScanQuizScreen parts={quizFixture(which)} onExit={() => {}} onComplete={() => {}} markAnswers />;
  createRoot(root).render(<StrictMode><div className="app">{screen}</div></StrictMode>);
}
