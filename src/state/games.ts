/* Per-unit game progress — which nodes on a unit path are grown.
   Separate from unit completion so a kid can leave mid-path and come back. */

const KEY = 'sprout.games.v1';

export type GameProgress = Record<string, string[]>;

export function loadGameProgress(): GameProgress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as GameProgress;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function saveGameProgress(progress: GameProgress): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(progress));
  } catch {
    /* ignore (e.g. private browsing) */
  }
}

export function withGameDone(progress: GameProgress, unitId: string, gameId: string): GameProgress {
  const prev = progress[unitId] ?? [];
  if (prev.includes(gameId)) return progress;
  return { ...progress, [unitId]: [...prev, gameId] };
}

/** Running score for a unit path, so the finish celebration reflects every game. */
const STATS_KEY = 'sprout.gameStats.v1';

export interface UnitGameStats {
  correct: number;
  total: number;
}

export type GameStats = Record<string, UnitGameStats>;

export function loadGameStats(): GameStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as GameStats;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function saveGameStats(stats: GameStats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    /* ignore */
  }
}

export function withGameStats(
  stats: GameStats,
  unitId: string,
  summary: UnitGameStats,
): GameStats {
  const prev = stats[unitId] ?? { correct: 0, total: 0 };
  return {
    ...stats,
    [unitId]: {
      correct: prev.correct + summary.correct,
      total: prev.total + summary.total,
    },
  };
}
