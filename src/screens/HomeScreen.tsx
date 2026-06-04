/* HomeScreen — the winding-path home, showing the whole course:
   5 sections, each with 7–8 unit nodes (plus a Golden Bloom milestone).
   Statuses are derived live from the learner's progress. */

import { useEffect } from 'react';
import HUD from '../components/HUD';
import SectionBanner from '../components/SectionBanner';
import WindingPath from '../components/WindingPath';
import TabBar, { type TabKey } from '../components/TabBar';
import Pip from '../components/Pip';
import { courseWithProgress, firstUnlockedUnit, hud } from '../data/course';
import type { PathNode, Section } from '../data/course';

interface HomeScreenProps {
  completed: string[];
  focusTarget?: string | null;
  onFocusSettled?: () => void;
  onStartUnit: (unitId: string) => void;
  onOpenShop: () => void;
  onOpenWater: () => void;
  tab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

/** Turn a section's units into path nodes, plus a Golden Bloom at the end. */
function sectionNodes(section: Section): PathNode[] {
  const nodes: PathNode[] = section.units.map((u) => ({
    id: u.id,
    kind: 'lesson',
    status: u.status,
    title: u.title,
  }));
  nodes.push({
    id: `${section.id}-bloom`,
    kind: 'golden',
    status: section.status === 'done' ? 'done' : 'locked',
    title: 'Golden Bloom',
  });
  return nodes;
}

export default function HomeScreen({ completed, focusTarget, onFocusSettled, onStartUnit, onOpenShop, onOpenWater, tab, onTabChange }: HomeScreenProps) {
  const sections = courseWithProgress(completed);

  // The "Today Card": a calm pointer to the next lesson (or a rested state).
  const currentId = firstUnlockedUnit(completed);
  const allUnits = sections.flatMap((s) => s.units.map((u) => ({ id: u.id, title: u.title, section: s.title })));
  const current = allUnits.find((u) => u.id === currentId);

  useEffect(() => {
    if (!focusTarget) return;
    const targetId = focusTarget === 'next-unlocked' ? currentId : focusTarget;
    const timer = window.setTimeout(() => {
      const target = document.querySelector<HTMLElement>(`[data-path-node-id="${targetId}"]`);
      target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      onFocusSettled?.();
    }, 180);
    return () => window.clearTimeout(timer);
  }, [currentId, focusTarget, onFocusSettled]);

  function startUnit(node: PathNode) {
    if (node.kind === 'lesson') onStartUnit(node.id); // golden blooms aren't lessons
  }

  return (
    <div className="screen">
      <HUD leaves={hud.leaves} gems={hud.gems} water={hud.water} onOpenShop={onOpenShop} onOpenWater={onOpenWater} />

      <main className="screen__body">
        <section className="today">
          <div className="today__head">
            <div className="today__text">
              <p className="today__eyebrow">Today</p>
              <h2 className="today__title">{current ? current.title : 'All caught up!'}</h2>
              <p className="today__meta">
                {current ? `${current.section} · a short, calm lesson` : 'Your garden is resting — come back soon 🌱'}
              </p>
            </div>
            <Pip className="today__pip" />
          </div>
          <button
            type="button"
            className="btn-primary today__cta"
            onClick={() => onStartUnit(current ? current.id : allUnits[0].id)}
          >
            {current ? "Start today's lesson" : 'Practice a lesson'}
          </button>
        </section>

        {sections.map((section) => (
          <section key={section.id} className="course-section">
            <SectionBanner section={section} />
            <WindingPath nodes={sectionNodes(section)} onSelect={startUnit} />
          </section>
        ))}
      </main>

      <TabBar active={tab} onChange={onTabChange} />
    </div>
  );
}
