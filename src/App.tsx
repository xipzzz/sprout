import { useState, useEffect } from 'react';
import type { TabKey } from './components/TabBar';
import HomeScreen from './screens/HomeScreen';
import LessonScreen from './screens/LessonScreen';
import LessonScreenSoT from './screens/LessonScreenSoT';
import GardenScreen from './screens/GardenScreen';
import MeScreen from './screens/MeScreen';
import WordsScreen from './screens/WordsScreen';
import GroveScreen from './screens/GroveScreen';
import StreakScreen from './screens/StreakScreen';
import ShopScreen from './screens/ShopScreen';
import QuestsScreen from './screens/QuestsScreen';
import DailyGoalMet from './screens/DailyGoalMet';
import CustomizeScreen from './screens/CustomizeScreen';
import InviteScreen from './screens/InviteScreen';
import GoldenBloomScreen from './screens/GoldenBloomScreen';
import InsightsScreen from './screens/InsightsScreen';
import TalesScreen from './screens/TalesScreen';
import SettingsScreen from './screens/SettingsScreen';
import OnboardingSplash from './screens/OnboardingSplash';
import ComebackScreen from './screens/ComebackScreen';
import ScanHomeworkScreen from './screens/ScanHomeworkScreen';
import UnitPathScreen from './screens/UnitPathScreen';
import type { WordPickQuestion } from './lib/homeworkParse';
import Modal from './components/Modal';
import Pip from './components/Pip';
import { loadCompleted, saveCompleted } from './state/progress';
import { loadGameProgress, loadGameStats, saveGameProgress, saveGameStats, withGameDone, withGameStats } from './state/games';
import type { GameProgress, GameStats } from './state/games';
import { recordPractice } from './state/practice';
import { markTodayDone } from './state/today';
import { firstUnlockedUnit, getLesson, hud, sectionCompletedByUnit, unitGamesComplete } from './data/course';
import { playSproutFeedback } from './utils/feedback';

export default function App() {
  const [tab, setTab] = useState<TabKey>('learn');
  const [completed, setCompleted] = useState<string[]>(loadCompleted);
  const [pathUnit, setPathUnit] = useState<string | null>(null);
  const [playGameId, setPlayGameId] = useState<string | null>(null);
  const [gameProgress, setGameProgress] = useState<GameProgress>(loadGameProgress);
  const [gameStats, setGameStats] = useState<GameStats>(loadGameStats);
  const [pendingPathFocus, setPendingPathFocus] = useState<string | null>(null);
  const [showStreak, setShowStreak] = useState(false);
  const [showQuests, setShowQuests] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [showTales, setShowTales] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showScan, setShowScan] = useState(false);
  const [scanQuestion, setScanQuestion] = useState<WordPickQuestion | null>(null);
  const [showDailyGoal, setShowDailyGoal] = useState(false);
  const [dailyGoalShown, setDailyGoalShown] = useState(false);
  const [goldenBloom, setGoldenBloom] = useState<string | null>(null);
  const [showShop, setShowShop] = useState(false);
  const [showWater, setShowWater] = useState(false);
  const [offline, setOffline] = useState(() => typeof navigator !== 'undefined' && !navigator.onLine);
  useEffect(() => {
    const goOffline = () => setOffline(true);
    const goOnline = () => setOffline(false);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);
  // Apply the saved "calmer motion" preference on load.
  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem('sprout.prefs') || '{}');
      document.body.classList.toggle('calm-motion', !!p.calmMotion);
    } catch { /* ignore */ }
  }, []);
  const [onboarded, setOnboarded] = useState(() => {
    try { return localStorage.getItem('sprout.onboarded') === '1'; } catch { return false; }
  });
  const [showComeback, setShowComeback] = useState(false);
  // Warm "welcome back" when returning after a gap (>18h). Best-effort, once.
  useEffect(() => {
    try {
      const KEY = 'sprout.lastVisit';
      const last = Number(localStorage.getItem(KEY) || '0');
      const now = Date.now();
      if (onboarded && last && now - last > 18 * 3600 * 1000) {
        window.setTimeout(() => setShowComeback(true), 0);
      }
      localStorage.setItem(KEY, String(now));
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Visiting the Garden tab auto-ticks the Today checklist's 'garden' task.
  useEffect(() => { if (tab === 'garden') markTodayDone('garden'); }, [tab]);

  function openUnit(unitId: string) {
    setPathUnit(unitId);
    setPlayGameId(null);
  }

  // Finishing every game in a unit marks that unit complete → the next unit unlocks.
  function finishUnit(unit: string) {
    setPlayGameId(null);
    setPathUnit(null);
    if (!completed.includes(unit)) {
      const next = [...completed, unit];
      setCompleted(next);
      saveCompleted(next);
      recordPractice(getLesson(unit).reward); // log today's leaves for the weekly chart
      markTodayDone('lesson'); // auto-tick the Today checklist + the daily Quest
      playSproutFeedback('gardenGrowth');
      setPendingPathFocus(firstUnlockedUnit(next) ?? null);
      // Finishing a whole section is a special golden moment — it takes
      // precedence over (and replaces) the daily-goal celebration here.
      const finishedSection = sectionCompletedByUnit(unit, next);
      if (finishedSection) {
        setGoldenBloom(finishedSection.title);
        return;
      }
    }
    // The daily-goal celebration is a separate moment (shown once per session).
    if (!dailyGoalShown) {
      setShowDailyGoal(true);
      setDailyGoalShown(true);
    }
  }

  function completeGame(summary: { correct: number; total: number }) {
    if (!pathUnit || !playGameId) return;
    const alreadyGame = (gameProgress[pathUnit] ?? []).includes(playGameId);
    const next = withGameDone(gameProgress, pathUnit, playGameId);
    if (next !== gameProgress) {
      setGameProgress(next);
      saveGameProgress(next);
    }
    if (!alreadyGame) {
      const stats = withGameStats(gameStats, pathUnit, summary);
      setGameStats(stats);
      saveGameStats(stats);
    }
    const doneIds = next[pathUnit] ?? [];
    const finished = unitGamesComplete(pathUnit, doneIds);
    const already = completed.includes(pathUnit);
    setPlayGameId(null);
    if (finished && !already) finishUnit(pathUnit);
  }

  if (!onboarded) {
    return (
      <div className="app">
        <OnboardingSplash
          onStart={() => {
            try { localStorage.setItem('sprout.onboarded', '1'); } catch { /* ignore */ }
            setOnboarded(true);
          }}
        />
      </div>
    );
  }

  if (showComeback) {
    return (
      <div className="app">
        <ComebackScreen onContinue={() => setShowComeback(false)} />
      </div>
    );
  }

  if (scanQuestion) {
    return (
      <div className="app">
        <LessonScreenSoT
          questions={[{ prompt: scanQuestion.prompt, choices: scanQuestion.choices, correct: scanQuestion.correct }]}
          onExit={() => setScanQuestion(null)}
          onComplete={() => {
            setScanQuestion(null);
            markTodayDone('lesson');
            playSproutFeedback('gardenGrowth');
          }}
        />
      </div>
    );
  }

  if (showScan) {
    return (
      <div className="app">
        <ScanHomeworkScreen
          onCancel={() => setShowScan(false)}
          onParsed={(q) => {
            setShowScan(false);
            setScanQuestion(q);
          }}
        />
      </div>
    );
  }

  if (pathUnit && playGameId) {
    const doneIds = gameProgress[pathUnit] ?? [];
    const prior = gameStats[pathUnit] ?? { correct: 0, total: 0 };
    const willFinishUnit = !completed.includes(pathUnit)
      && unitGamesComplete(pathUnit, doneIds.includes(playGameId) ? doneIds : [...doneIds, playGameId]);
    return (
      <div className="app">
        <LessonScreen
          onExit={() => setPlayGameId(null)}
          onComplete={completeGame}
          unitId={pathUnit}
          exerciseId={playGameId}
          celebrate={willFinishUnit}
          priorCorrect={prior.correct}
          priorTotal={prior.total}
          firstLesson={completed.length === 0}
        />
      </div>
    );
  }

  if (pathUnit) {
    return (
      <div className="app">
        <UnitPathScreen
          unitId={pathUnit}
          doneGameIds={gameProgress[pathUnit] ?? []}
          unitDone={completed.includes(pathUnit)}
          onBack={() => setPathUnit(null)}
          onStartGame={setPlayGameId}
        />
      </div>
    );
  }

  if (goldenBloom) {
    return (
      <div className="app">
        <GoldenBloomScreen sectionTitle={goldenBloom} onContinue={() => setGoldenBloom(null)} />
      </div>
    );
  }

  if (showDailyGoal) {
    return (
      <div className="app">
        <DailyGoalMet onContinue={() => setShowDailyGoal(false)} />
      </div>
    );
  }

  if (showStreak) {
    return (
      <div className="app">
        <StreakScreen onBack={() => setShowStreak(false)} />
      </div>
    );
  }

  if (showShop) {
    return (
      <div className="app">
        <ShopScreen onBack={() => setShowShop(false)} />
      </div>
    );
  }

  if (showQuests) {
    return (
      <div className="app">
        <QuestsScreen onBack={() => setShowQuests(false)} completed={completed} />
      </div>
    );
  }

  if (showCustomize) {
    return (
      <div className="app">
        <CustomizeScreen onBack={() => setShowCustomize(false)} />
      </div>
    );
  }

  if (showInvite) {
    return (
      <div className="app">
        <InviteScreen onBack={() => setShowInvite(false)} />
      </div>
    );
  }

  if (showInsights) {
    return (
      <div className="app">
        <InsightsScreen onBack={() => setShowInsights(false)} completed={completed} />
      </div>
    );
  }

  if (showTales) {
    return (
      <div className="app">
        <TalesScreen onBack={() => setShowTales(false)} />
      </div>
    );
  }

  if (showSettings) {
    return (
      <div className="app">
        <SettingsScreen onBack={() => setShowSettings(false)} />
      </div>
    );
  }

  return (
    <div className="app">
      {tab === 'learn' && (
        <HomeScreen tab={tab} onTabChange={setTab} completed={completed} focusTarget={pendingPathFocus} onFocusSettled={() => setPendingPathFocus(null)} onStartUnit={openUnit} onOpenShop={() => setShowShop(true)} onOpenWater={() => { playSproutFeedback('waterOpen'); setShowWater(true); }} onOpenScan={() => setShowScan(true)} />
      )}
      {tab === 'garden' && <GardenScreen tab={tab} onTabChange={setTab} completed={completed} onOpenTales={() => setShowTales(true)} />}
      {tab === 'words' && <WordsScreen tab={tab} onTabChange={setTab} />}
      {tab === 'grove' && <GroveScreen tab={tab} onTabChange={setTab} completed={completed} />}
      {tab === 'me' && <MeScreen tab={tab} onTabChange={setTab} completed={completed} onOpenStreak={() => setShowStreak(true)} onOpenQuests={() => setShowQuests(true)} onOpenCustomize={() => setShowCustomize(true)} onOpenInvite={() => setShowInvite(true)} onOpenInsights={() => setShowInsights(true)} onOpenSettings={() => setShowSettings(true)} />}

      {showWater && (
        <Modal onClose={() => { playSproutFeedback('modalClose'); setShowWater(false); }}>
          <div className="wmodal">
            <span className="wmodal__icon" aria-hidden="true">💧</span>
            <h2 className="wmodal__title">Water</h2>
            <p className="wmodal__body">
              Water powers your lessons — you have {hud.water} left. Each lesson uses one drop, and it refills over time.
            </p>
            <button type="button" className="btn-primary" onClick={() => { playSproutFeedback('modalClose'); setShowWater(false); setShowShop(true); }}>
              Top up in the Shop
            </button>
            <button type="button" className="wmodal__dismiss" onClick={() => { playSproutFeedback('modalClose'); setShowWater(false); }}>Maybe later</button>
          </div>
        </Modal>
      )}

      {offline && (
        <Modal onClose={() => setOffline(false)}>
          <div className="wmodal wmodal--offline">
            <Pip className="wmodal__pip" />
            <h2 className="wmodal__title">You're offline</h2>
            <p className="wmodal__body">Your garden is safe — everything is saved. Pip will be right here when you reconnect. 🌱</p>
            <button type="button" className="btn-primary" onClick={() => setOffline(!navigator.onLine)}>Try again</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
