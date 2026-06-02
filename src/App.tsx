import { useState } from 'react';
import type { TabKey } from './components/TabBar';
import HomeScreen from './screens/HomeScreen';
import LessonScreen from './screens/LessonScreen';
import GardenScreen from './screens/GardenScreen';
import PlaceholderScreen from './screens/PlaceholderScreen';
import { loadCompleted, saveCompleted } from './state/progress';

export default function App() {
  const [tab, setTab] = useState<TabKey>('learn');
  const [completed, setCompleted] = useState<string[]>(loadCompleted);
  const [lessonUnit, setLessonUnit] = useState<string | null>(null);

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

  return (
    <div className="app">
      {tab === 'learn' && (
        <HomeScreen tab={tab} onTabChange={setTab} completed={completed} onStartUnit={setLessonUnit} />
      )}
      {tab === 'garden' && <GardenScreen tab={tab} onTabChange={setTab} />}
      {tab === 'words' && (
        <PlaceholderScreen tab={tab} onTabChange={setTab}
          title="Words" emoji="📖" blurb="Every word you grow will live here, ready to review." />
      )}
      {tab === 'grove' && (
        <PlaceholderScreen tab={tab} onTabChange={setTab}
          title="Grove" emoji="🌳" blurb="Grow a shared garden with friends — calm, and never a ranking in sight." />
      )}
      {tab === 'me' && (
        <PlaceholderScreen tab={tab} onTabChange={setTab}
          title="Me" emoji="🌱" blurb="Your profile, streak, and settings will live here." />
      )}
    </div>
  );
}
