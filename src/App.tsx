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
import { loadCompleted, saveCompleted } from './state/progress';

export default function App() {
  const [tab, setTab] = useState<TabKey>('learn');
  const [completed, setCompleted] = useState<string[]>(loadCompleted);
  const [lessonUnit, setLessonUnit] = useState<string | null>(null);
  const [showStreak, setShowStreak] = useState(false);
  const [showShop, setShowShop] = useState(false);

  // Finishing a lesson marks its unit complete → the next unit unlocks.
  function completeLesson() {
    if (lessonUnit && !completed.includes(lessonUnit)) {
      const next = [...completed, lessonUnit];
      setCompleted(next);
      saveCompleted(next);
    }
    setLessonUnit(null);
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
        <HomeScreen tab={tab} onTabChange={setTab} completed={completed} onStartUnit={setLessonUnit} onOpenShop={() => setShowShop(true)} />
      )}
      {tab === 'garden' && <GardenScreen tab={tab} onTabChange={setTab} />}
      {tab === 'words' && <WordsScreen tab={tab} onTabChange={setTab} />}
      {tab === 'grove' && <GroveScreen tab={tab} onTabChange={setTab} />}
      {tab === 'me' && <MeScreen tab={tab} onTabChange={setTab} completed={completed} onOpenStreak={() => setShowStreak(true)} />}
    </div>
  );
}
