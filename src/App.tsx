import { useState, useEffect } from 'react';
import type { TabKey } from './components/TabBar';
import HomeScreen from './screens/HomeScreen';
import LessonScreen from './screens/LessonScreen';
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
import Modal from './components/Modal';
import { loadCompleted, saveCompleted } from './state/progress';
import { firstUnlockedUnit, hud, sectionCompletedByUnit } from './data/course';

export default function App() {
  const [tab, setTab] = useState<TabKey>('learn');
  const [completed, setCompleted] = useState<string[]>(loadCompleted);
  const [lessonUnit, setLessonUnit] = useState<string | null>(null);
  const [pendingPathFocus, setPendingPathFocus] = useState<string | null>(null);
  const [showStreak, setShowStreak] = useState(false);
  const [showQuests, setShowQuests] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [showTales, setShowTales] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
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

  // Finishing a lesson marks its unit complete → the next unit unlocks.
  function completeLesson() {
    const unit = lessonUnit;
    setLessonUnit(null);
    if (unit && !completed.includes(unit)) {
      const next = [...completed, unit];
      setCompleted(next);
      saveCompleted(next);
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

  if (lessonUnit) {
    return (
      <div className="app">
        <LessonScreen onExit={() => setLessonUnit(null)} onComplete={completeLesson} unitId={lessonUnit} />
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
        <QuestsScreen onBack={() => setShowQuests(false)} />
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
        <HomeScreen tab={tab} onTabChange={setTab} completed={completed} focusTarget={pendingPathFocus} onFocusSettled={() => setPendingPathFocus(null)} onStartUnit={setLessonUnit} onOpenShop={() => setShowShop(true)} onOpenWater={() => setShowWater(true)} />
      )}
      {tab === 'garden' && <GardenScreen tab={tab} onTabChange={setTab} completed={completed} onOpenTales={() => setShowTales(true)} />}
      {tab === 'words' && <WordsScreen tab={tab} onTabChange={setTab} />}
      {tab === 'grove' && <GroveScreen tab={tab} onTabChange={setTab} />}
      {tab === 'me' && <MeScreen tab={tab} onTabChange={setTab} completed={completed} onOpenStreak={() => setShowStreak(true)} onOpenQuests={() => setShowQuests(true)} onOpenCustomize={() => setShowCustomize(true)} onOpenInvite={() => setShowInvite(true)} onOpenInsights={() => setShowInsights(true)} onOpenSettings={() => setShowSettings(true)} />}

      {showWater && (
        <Modal onClose={() => setShowWater(false)}>
          <div className="wmodal">
            <span className="wmodal__icon" aria-hidden="true">💧</span>
            <h2 className="wmodal__title">Water</h2>
            <p className="wmodal__body">
              Water powers your lessons — you have {hud.water} left. Each lesson uses one drop, and it refills over time.
            </p>
            <button type="button" className="btn-primary" onClick={() => { setShowWater(false); setShowShop(true); }}>
              Top up in the Shop
            </button>
            <button type="button" className="wmodal__dismiss" onClick={() => setShowWater(false)}>Maybe later</button>
          </div>
        </Modal>
      )}

      {offline && (
        <Modal onClose={() => setOffline(false)}>
          <div className="wmodal">
            <span className="wmodal__icon" aria-hidden="true">🌙</span>
            <h2 className="wmodal__title">You're offline</h2>
            <p className="wmodal__body">Your garden is safe — everything you've done is saved. Reconnect to grow more.</p>
            <button type="button" className="btn-primary" onClick={() => setOffline(false)}>Okay</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
