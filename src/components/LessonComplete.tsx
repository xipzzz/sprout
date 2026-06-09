/* LessonComplete v2 — garden-themed reward screen.
   Tiered praise (Bloom/Steady/Water), itemized seed ledger, three v2 stat tiles
   (Seeds/Bloom rate/Streak), today's garden goal bar, flawless callout (100%),
   delayed streak beat, words-grown recap with audio. Mirrors
   design/v2-bundle/project/lesson-complete.jsx. */

import { useEffect, useState } from 'react';
import Pip from './Pip';
import { currentStreak, practiceWeek } from '../state/practice';

interface LessonCompleteProps {
  leaves: number;
  accuracy: number;
  words: string[];
  firstLesson?: boolean;
  onContinue: () => void;
  onReview?: () => void;
}

type Tier = 'bloom' | 'steady' | 'water';

function tierFor(accuracy: number): Tier {
  if (accuracy >= 100) return 'bloom';
  if (accuracy >= 80) return 'steady';
  return 'water';
}

function praiseFor(tier: Tier, firstLesson: boolean): { headline: string; sub: string } {
  if (firstLesson) {
    return {
      headline: 'Your first sprout! 🌱',
      sub: 'You planted your first seed — your garden has begun!',
    };
  }
  return tier === 'bloom'
    ? { headline: 'In full bloom! 🌸', sub: 'A perfect run — every answer right. Pip is beaming.' }
    : tier === 'steady'
    ? { headline: 'Steady grower 🌱', sub: "Solid work — your garden's coming along nicely." }
    : { headline: 'Needs a little water 💧', sub: 'Tricky one! A quick review will help it bloom.' };
}

function ledgerFor(tier: Tier, leaves: number): { label: string; val: number }[] {
  // Split the lesson's reward into named pills so the total feels earned.
  if (tier === 'bloom') {
    const bonus = Math.max(1, Math.round(leaves * 0.35));
    return [{ label: 'Correct', val: leaves - bonus }, { label: 'Flawless bonus', val: bonus }];
  }
  if (tier === 'steady') {
    const bonus = Math.max(1, Math.round(leaves * 0.2));
    return [{ label: 'Correct', val: leaves - bonus }, { label: 'Good pace', val: bonus }];
  }
  return [{ label: 'Correct', val: leaves }];
}

function speak(word: string) {
  try {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(word);
    u.lang = 'en-US';
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  } catch {
    /* speech unavailable */
  }
}

export default function LessonComplete({ leaves, accuracy, words, firstLesson = false, onContinue, onReview }: LessonCompleteProps) {
  const tier = tierFor(accuracy);
  const { headline, sub } = praiseFor(tier, firstLesson);
  const ledger = ledgerFor(tier, leaves);
  const ledgerTotal = ledger.reduce((s, x) => s + x.val, 0);
  const accTier = accuracy >= 95 ? 'Lush' : accuracy >= 80 ? 'Healthy' : 'Sprouting';
  const flawless = !firstLesson && accuracy >= 100;

  // Today's garden — 5 lessons/day default goal. "Watered" = lessons completed today.
  const week = practiceWeek();
  const today = week[week.length - 1].value;
  const GOAL_PER_DAY = 5;
  const lessonsLandedToday = Math.max(1, Math.ceil(today / Math.max(1, leaves))); // best-effort
  const goalAfter = Math.min(GOAL_PER_DAY, lessonsLandedToday);
  const goalBefore = Math.max(0, goalAfter - 1);
  const goalMet = goalAfter >= GOAL_PER_DAY;

  const streak = currentStreak();
  const displayStreak = Math.max(1, streak);
  const streakUnit = displayStreak === 1 ? 'day' : 'days';

  // Roll up XP + accuracy on mount; reveal streak beat as a second beat.
  const [xp, setXp] = useState(0);
  const [acc, setAcc] = useState(0);
  const [showStreakBeat, setShowStreakBeat] = useState(false);
  const [goalFill, setGoalFill] = useState(false);

  useEffect(() => {
    let x = 0, a = 0;
    const iv = window.setInterval(() => {
      x = Math.min(leaves, x + 1);
      a = Math.min(accuracy, a + 4);
      setXp(x); setAcc(a);
      if (x >= leaves && a >= accuracy) window.clearInterval(iv);
    }, 40);
    const tb = window.setTimeout(() => setShowStreakBeat(true), 1300);
    const gf = window.setTimeout(() => setGoalFill(true), 900);
    return () => { window.clearInterval(iv); window.clearTimeout(tb); window.clearTimeout(gf); };
  }, [leaves, accuracy]);

  return (
    <div className="screen complete complete-v2">
      <header className="complete__top" />

      <main className="complete__hero">
        <div className="complete__pip-wrap">
          <Pip className="complete__pip" />
        </div>
        <h1 className="complete__title">{headline}</h1>
        <p className="complete__sub">{sub}</p>

        {!firstLesson && (
          <div className="ledger" aria-label="Seeds earned">
            {ledger.map((it, i) => (
              <span key={it.label} className="ledger__row">
                {i > 0 && <span className="ledger__op">+</span>}
                <span className="ledger__pill">{it.label} <b>+{it.val}</b></span>
              </span>
            ))}
            <span className="ledger__op">=</span>
            <span className="ledger__total"><b>{ledgerTotal}</b> seeds 🌱</span>
          </div>
        )}

        <div className="v2-tiles">
          <div className="v2-tile v2-tile--seeds">
            <span className="v2-tile__icon" aria-hidden="true">⭐</span>
            <span className="v2-tile__lbl">Seeds</span>
            <span className="v2-tile__val">+{xp}</span>
          </div>
          <div className="v2-tile v2-tile--bloom">
            <span className="v2-tile__icon" aria-hidden="true">✓</span>
            <span className="v2-tile__lbl">Bloom rate</span>
            <span className="v2-tile__val">{acc}%</span>
            {acc >= accuracy && <span className="v2-tile__sub">{accTier}</span>}
          </div>
          <div className="v2-tile v2-tile--streak">
            <span className="v2-tile__icon" aria-hidden="true">🔥</span>
            <span className="v2-tile__lbl">Streak</span>
            <span className="v2-tile__val">{displayStreak}</span>
            <span className="v2-tile__sub">{streakUnit}</span>
          </div>
        </div>

        <div className="today-card">
          <div className="today-card__head">
            <span className="today-card__lbl">🌿 Today's garden</span>
            <span className={`today-card__meta${goalMet ? ' today-card__meta--met' : ''}`}>
              {goalMet ? 'Goal met! 🌸' : `${goalAfter}/${GOAL_PER_DAY} watered`}
            </span>
          </div>
          <div className="today-card__bar">
            <span className="today-card__bar-before" style={{ width: `${(goalBefore / GOAL_PER_DAY) * 100}%` }} />
            <span className="today-card__bar-after" style={{ width: `${((goalFill ? goalAfter : goalBefore) / GOAL_PER_DAY) * 100}%` }} />
          </div>
        </div>

        {flawless && (
          <div className="flawless">
            <span className="flawless__icon" aria-hidden="true">🌟</span>
            <div className="flawless__text">
              <p className="flawless__title">Flawless — a Golden Bloom grew! 🌟</p>
              <p className="flawless__sub">Not a single miss. That perfect run earned a rare bloom.</p>
            </div>
          </div>
        )}

        <div className={`streak-beat${showStreakBeat ? ' streak-beat--in' : ''}`}>
          <span className="streak-beat__icon" aria-hidden="true">🔥</span>
          <p className="streak-beat__text">
            {firstLesson
              ? <>You're on a <b>1-day streak</b> — come back tomorrow to keep it growing!</>
              : <>Streak now <b>{displayStreak} {streakUnit}</b> — keep it alive!</>}
          </p>
        </div>

        {words.length > 0 && (
          <div className="grew-words">
            <p className="grew-words__head">🌿 You grew {words.length} new word{words.length === 1 ? '' : 's'}</p>
            <div className="grew-words__chips">
              {words.map((w) => (
                <button key={w} type="button" className="grew-words__chip" onClick={() => speak(w)} aria-label={`Say ${w}`}>
                  {w} <span className="grew-words__spk" aria-hidden="true">🔊</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="complete__foot">
        <button type="button" className="btn-primary complete__continue" onClick={onContinue}>Continue</button>
        {onReview && (
          <button type="button" className="complete__review" onClick={onReview}>Review this lesson</button>
        )}
      </footer>
    </div>
  );
}
