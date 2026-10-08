/* Saved homework quizzes live with the rest of the child's progress,
   in localStorage on this device. Photos are never stored. */

import type { PlayableQuestion } from './quizMap';

const KEY = 'sprout.homeworkQuizzes.v1';
const MAX_SAVED = 20;

export interface HomeworkQuiz {
  id: string;
  title: string;
  createdAt: number;
  parts: PlayableQuestion[][];
}

function load(): HomeworkQuiz[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HomeworkQuiz[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function loadHomeworkQuizzes(): HomeworkQuiz[] {
  return load().sort((a, b) => b.createdAt - a.createdAt);
}

export function getHomeworkQuiz(id: string): HomeworkQuiz | null {
  return load().find((quiz) => quiz.id === id) ?? null;
}

export function saveHomeworkQuiz(quiz: HomeworkQuiz): void {
  try {
    const next = [quiz, ...load().filter((item) => item.id !== quiz.id)].slice(0, MAX_SAVED);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* private mode — the quiz can still be played this session */
  }
}

export function formatQuizDay(now: number): string {
  const date = new Date(now);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getUTCMonth()]} ${date.getUTCDate()}`;
}
