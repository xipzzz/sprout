/* HomeScreen — the winding-path home, showing the whole course:
   5 sections, each with 7–8 unit nodes (plus a Golden Bloom milestone).
   Statuses are derived live from the learner's progress. */

import HUD from '../components/HUD';
import SectionBanner from '../components/SectionBanner';
import WindingPath from '../components/WindingPath';
import TabBar, { type TabKey } from '../components/TabBar';
import { courseWithProgress, hud } from '../data/course';
import type { PathNode, Section } from '../data/course';

interface HomeScreenProps {
  completed: string[];
  onStartUnit: (unitId: string) => void;
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

export default function HomeScreen({ completed, onStartUnit, tab, onTabChange }: HomeScreenProps) {
  const sections = courseWithProgress(completed);

  function startUnit(node: PathNode) {
    if (node.kind === 'lesson') onStartUnit(node.id); // golden blooms aren't lessons
  }

  return (
    <div className="screen">
      <HUD leaves={hud.leaves} gems={hud.gems} water={hud.water} />

      <main className="screen__body">
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
