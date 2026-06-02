/* HomeScreen — the "Winding Path" home.
   Composes: HUD (top) + scrollable body (unit banner + path) + tab bar.
   Reads everything from src/data/course.ts. */

import { useState } from 'react';
import HUD from '../components/HUD';
import UnitBanner from '../components/UnitBanner';
import WindingPath from '../components/WindingPath';
import TabBar, { type TabKey } from '../components/TabBar';
import { currentUnit, hud } from '../data/course';
import type { PathNode } from '../data/course';

interface HomeScreenProps {
  onStartLesson: () => void;
}

export default function HomeScreen({ onStartLesson }: HomeScreenProps) {
  const [tab, setTab] = useState<TabKey>('learn');

  // A tapped (unlocked) node opens the lesson flow.
  function startLesson(_node: PathNode) {
    onStartLesson();
  }

  return (
    <div className="screen">
      <HUD leaves={hud.leaves} gems={hud.gems} water={hud.water} />

      <main className="screen__body">
        <UnitBanner
          section={currentUnit.section}
          unit={currentUnit.unit}
          title={currentUnit.title}
        />
        <WindingPath nodes={currentUnit.nodes} onSelect={startLesson} />
      </main>

      <TabBar active={tab} onChange={setTab} />
    </div>
  );
}
