/* PlaceholderScreen — a calm "coming soon" for tabs not built yet,
   so navigation works while we build each one out. */

import TabBar, { type TabKey } from '../components/TabBar';
import Pip from '../components/Pip';

interface PlaceholderScreenProps {
  tab: TabKey;
  onTabChange: (tab: TabKey) => void;
  title: string;
  emoji: string;
  blurb: string;
}

export default function PlaceholderScreen({ tab, onTabChange, title, emoji, blurb }: PlaceholderScreenProps) {
  return (
    <div className="screen placeholder">
      <main className="screen__body placeholder__body">
        <Pip className="placeholder__pip" />
        <h1 className="placeholder__title">{emoji} {title}</h1>
        <p className="placeholder__blurb">{blurb}</p>
        <p className="placeholder__soon">Coming soon</p>
      </main>
      <TabBar active={tab} onChange={onTabChange} />
    </div>
  );
}
