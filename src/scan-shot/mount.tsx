/* Dev-only screenshot mount. Not imported by the production entry. */
/* eslint-disable react-refresh/only-export-components */

import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import ScanQuizScreen, { ScanQuizFinish } from '../screens/ScanQuizScreen';
import { answerCurrent, startQuiz, type PlayableQuestion } from '../lib/scan/quizMap';
import ScanReviewScreen from '../screens/ScanReviewScreen';
import { ScanErrorPreview, ScanLoadingPreview } from '../screens/ScanHomeworkScreen';
import type { ReviewQuestion } from '../lib/scan/review';
import { actionsFixture, checkFixture, quizFixture } from './fixtures';
import { createReview } from '../lib/scan/review';
import type { ScannedQuestion } from '../lib/scan/types';

function q(partial: Partial<ScannedQuestion> & Pick<ScannedQuestion, 'id' | 'type' | 'prompt'>): ScannedQuestion {
  return { instruction: '', options: [], left: [], right: [], emphasis: [], ...partial };
}

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
  ctx.fillText('Synthetic page', 40, 70);
  ctx.font = '22px sans-serif';
  ctx.fillText('1. The synthetic fox ___ the box.', 36, 150);
  ctx.fillText('2. Which shape is a box?', 36, 400);
  ctx.fillText('circle     box     line', 36, 446);
  return canvas.toDataURL('image/jpeg', 0.85);
}

function ActionsShot() {
  const [questions, setQuestions] = useState<ReviewQuestion[]>(() => actionsFixture());
  return (
    <ScanReviewScreen
      questions={questions}
      onChange={setQuestions}
      onPractice={() => {}}
      onBack={() => {}}
    />
  );
}

function CheckShot({ mark = true }: { mark?: boolean }) {
  const [questions, setQuestions] = useState<ReviewQuestion[]>(() => checkFixture());
  return (
    <ScanReviewScreen
      questions={questions}
      onChange={setQuestions}
      onPractice={() => {}}
      onBack={() => {}}
      photos={[syntheticPage()]}
      mark={mark}
    />
  );
}

function WordOrderShot() {
  const [questions, setQuestions] = useState<ReviewQuestion[]>(() => createReview([
    q({
      id: 'q1',
      type: 'rewrite',
      instruction: 'Put the words in the correct order.',
      prompt: "aren't / They / Spain. / from",
    }),
  ], { q1: "They aren't from Spain." }));
  return (
    <ScanReviewScreen
      questions={questions}
      onChange={setQuestions}
      onPractice={() => {}}
      onBack={() => {}}
    />
  );
}

function finishCount() {
  const questions: PlayableQuestion[] = Array.from({ length: 12 }, (_, index) => ({
    kind: 'multiple_choice',
    id: `q${index + 1}`,
    prompt: `Question ${index + 1}`,
    instruction: '',
    options: ['yes', 'no'],
    answer: 'yes',
  }));
  const grades = [
    ...Array.from({ length: 10 }, () => 'correct' as const),
    'wrong' as const,
    'wrong' as const,
    'correct' as const,
    'correct' as const,
  ];
  return grades.reduce((run, grade) => answerCurrent(run, grade), startQuiz([questions])).count;
}

export function mountScanShot(which: string) {
  const root = document.getElementById('root');
  if (!root) return;
  const screen = which === 'word-order'
    ? <WordOrderShot />
    : which === 'parent-check'
    ? <CheckShot mark={false} />
    : which === 'finish'
    ? <ScanQuizFinish count={finishCount()} onContinue={() => {}} mark />
    : which === 'check'
    ? <CheckShot />
    : which === 'check-tools'
      ? <ActionsShot />
      : which === 'error'
      ? <ScanErrorPreview mark />
      : which === 'loading'
        ? <ScanLoadingPreview mark />
        : <ScanQuizScreen parts={quizFixture(which)} onExit={() => {}} onComplete={() => {}} markAnswers />;
  createRoot(root).render(<StrictMode><div className="app">{screen}</div></StrictMode>);
}
