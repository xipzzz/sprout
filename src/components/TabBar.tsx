/* TabBar — bottom navigation. Bespoke line icons (~1.9px stroke),
   green active state. Five destinations; only "Learn" is built for now. */

import type { ReactNode } from 'react';

export type TabKey = 'learn' | 'garden' | 'words' | 'grove' | 'me';

interface TabBarProps {
  active: TabKey;
  onChange?: (tab: TabKey) => void;
}

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.9,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const TABS: { key: TabKey; label: string; icon: ReactNode }[] = [
  {
    key: 'learn',
    label: 'Learn',
    icon: (
      <svg viewBox="0 0 24 24" {...stroke}><path d="M4 11l8-6 8 6" /><path d="M6 10v9h12v-9" /><path d="M10 19v-5h4v5" /></svg>
    ),
  },
  {
    key: 'garden',
    label: 'Garden',
    icon: (
      <svg viewBox="0 0 24 24" {...stroke}><path d="M12 21V11" /><path d="M12 11c0-3 2-5 5-5 0 3-2 5-5 5z" /><path d="M12 13c0-3-2-5-5-5 0 3 2 5 5 5z" /></svg>
    ),
  },
  {
    key: 'words',
    label: 'Words',
    icon: (
      <svg viewBox="0 0 24 24" {...stroke}><path d="M5 5.5A1.5 1.5 0 0 1 6.5 4H18v16H6.5A1.5 1.5 0 0 0 5 21.5z" /><path d="M5 18.5A1.5 1.5 0 0 1 6.5 17H18" /></svg>
    ),
  },
  {
    key: 'grove',
    label: 'Grove',
    icon: (
      <svg viewBox="0 0 24 24" {...stroke}><circle cx="9" cy="9" r="3" /><path d="M3.5 19a5.5 5.5 0 0 1 11 0" /><path d="M16 7.5a3 3 0 0 1 0 5" /><path d="M17 14.5a5.5 5.5 0 0 1 3.5 4.5" /></svg>
    ),
  },
  {
    key: 'me',
    label: 'Me',
    icon: (
      <svg viewBox="0 0 24 24" {...stroke}><circle cx="12" cy="8.5" r="3.5" /><path d="M5.5 20a6.5 6.5 0 0 1 13 0" /></svg>
    ),
  },
];

export default function TabBar({ active, onChange }: TabBarProps) {
  return (
    <nav className="tabbar" aria-label="Main navigation">
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <button
            key={tab.key}
            type="button"
            className={`tab${isActive ? ' tab--active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onChange?.(tab.key)}
          >
            <span className="tab__icon" aria-hidden="true">{tab.icon}</span>
            <span className="tab__label">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
