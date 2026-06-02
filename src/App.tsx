import { useState } from 'react';
import type { TabKey } from './components/TabBar';
import HomeScreen from './screens/HomeScreen';
import LessonScreen from './screens/LessonScreen';
import GardenScreen from './screens/GardenScreen';
import PlaceholderScreen from './screens/PlaceholderScreen';

export default function App() {
  const [tab, setTab] = useState<TabKey>('learn');
  const [inLesson, setInLesson] = useState(false);

  if (inLesson) {
    return (
      <div className="app">
        <LessonScreen onExit={() => setInLesson(false)} onComplete={() => setInLesson(false)} />
      </div>
    );
  }

  return (
    <div className="app">
      {tab === 'learn' && (
        <HomeScreen tab={tab} onTabChange={setTab} onStartLesson={() => setInLesson(true)} />
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
