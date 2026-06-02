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

export default function HomeScreen() {
  const [tab, setTab] = useState<TabKey>('learn');

  // The lesson flow is the next thing we'll build — this is where a
  // tapped node will open it.
  function startLesson(node: PathNode) {
    console.log('start lesson:', node.id, node.title);
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
