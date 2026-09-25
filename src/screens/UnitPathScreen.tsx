/* UnitPathScreen — the games inside one unit, on a winding path.
   Tap the glowing node to play. Come back and the grown nodes stay green. */

import Pip from '../components/Pip';
import WindingPath from '../components/WindingPath';
import { getLesson, unitGameNodes } from '../data/course';
import type { PathNode } from '../data/course';

interface UnitPathScreenProps {
  unitId: string;
  doneGameIds: string[];
  unitDone: boolean;
  onBack: () => void;
  onStartGame: (gameId: string) => void;
}

export default function UnitPathScreen({
  unitId, doneGameIds, unitDone, onBack, onStartGame,
}: UnitPathScreenProps) {
  const lesson = getLesson(unitId);
  const nodes = unitGameNodes(unitId, doneGameIds, unitDone);
  const grown = nodes.filter((n) => n.status === 'done').length;

  function start(node: PathNode) {
    if (node.status === 'locked') return;
    onStartGame(node.id);
  }

  return (
    <div className="screen unit-path">
      <header className="streak__top">
        <button type="button" className="lesson__close" onClick={onBack} aria-label="Back to today">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
               strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <h1 className="streak__title">{lesson.title}</h1>
      </header>

      <main className="screen__body">
        <section className="unit-path__intro">
          <Pip className="unit-path__pip" />
          <div>
            <p className="today__eyebrow">Games</p>
            <p className="unit-path__meta">
              {unitDone || grown === nodes.length
                ? 'This unit is all grown. Tap any game to play it again.'
                : `${grown} of ${nodes.length} grown · tap the glowing one`}
            </p>
          </div>
        </section>
        <WindingPath nodes={nodes} onSelect={start} showLabels />
      </main>
    </div>
  );
}
