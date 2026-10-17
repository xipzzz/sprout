import { useSyncExternalStore } from 'react';
import { isParentUnlocked, subscribeParent } from './pin.ts';
import { getYearGroup, subscribeYearGroup, YEAR_SETTINGS, type YearSettings } from './yearGroup.ts';

export function useParentUnlocked(): boolean {
  return useSyncExternalStore(subscribeParent, isParentUnlocked, () => false);
}

export function useYearSettings(): YearSettings {
  const year = useSyncExternalStore(subscribeYearGroup, getYearGroup, getYearGroup);
  return YEAR_SETTINGS[year];
}
