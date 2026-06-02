import { useState } from 'react';
import HomeScreen from './screens/HomeScreen';
import LessonScreen from './screens/LessonScreen';

export default function App() {
  const [view, setView] = useState<'home' | 'lesson'>('home');

  return (
    <div className="app">
      {view === 'home' ? (
        <HomeScreen onStartLesson={() => setView('lesson')} />
      ) : (
        <LessonScreen onExit={() => setView('home')} onComplete={() => setView('home')} />
      )}
    </div>
  );
}
