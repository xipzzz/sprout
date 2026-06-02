import { useState } from 'react';
import type { TabKey } from './components/TabBar';
import HomeScreen from './screens/HomeScreen';
import LessonScreen from './screens/LessonScreen';
import GardenScreen from './screens/GardenScreen';
import MeScreen from './screens/MeScreen';
import WordsScreen from './screens/WordsScreen';
import GroveScreen from './screens/GroveScreen';
import StreakScreen from './screens/StreakScreen';
import ShopScreen from './screens/ShopScreen';
import OnboardingSplash from './screens/OnboardingSplash';
import Modal from './components/Modal';
import { loadCompleted, saveCompleted } from './state/progress';
import { hud } from './data/course';

export default function App() {
  const [tab, setTab] = useState<TabKey>('learn');
  const [completed, setCompleted] = useState<string[]>(loadCompleted);
  const [lessonUnit, setLessonUnit] = useState<string | null>(null);
  const [showStreak, setShowStreak] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showWater, setShowWater] = useState(false);
  const [onboarded, setOnboarded] = useState(() => {
    try { return localStorage.getItem('sprout.onboarded') === '1'; } catch { return false; }
  });

  // Finishing a lesson marks its unit complete → the next unit unlocks.
  function completeLesson() {
    if (lessonUnit && !completed.includes(lessonUnit)) {
      const next = [...completed, lessonUnit];
      setCompleted(next);
      saveCompleted(next);
    }
    setLessonUnit(null);
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
        <LessonScreen onExit={() => setLessonUnit(null)} onComplete={completeLesson} />
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

  return (
    <div className="app">
      {tab === 'learn' && (
        <HomeScreen tab={tab} onTabChange={setTab} completed={completed} onStartUnit={setLessonUnit} onOpenShop={() => setShowShop(true)} onOpenWater={() => setShowWater(true)} />
      )}
      {tab === 'garden' && <GardenScreen tab={tab} onTabChange={setTab} />}
      {tab === 'words' && <WordsScreen tab={tab} onTabChange={setTab} />}
      {tab === 'grove' && <GroveScreen tab={tab} onTabChange={setTab} />}
      {tab === 'me' && <MeScreen tab={tab} onTabChange={setTab} completed={completed} onOpenStreak={() => setShowStreak(true)} />}

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
    </div>
  );
}
