/* Daily scans per parent account, and a monthly spend cap for the whole
   Worker. Counters live in Cloudflare KV (free plan). KV is eventually
   consistent, so the provider dashboard budget is the hard backstop. */

export interface LimitStore {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

export interface LimitConfig {
  dailyLimit: number;
  burstPerMinute: number;
  costCents: number;
  capCents: number;
}

export type LimitCode = 'daily_limit' | 'spending_cap' | 'rate_limit';

export function limitConfigFromEnv(env: {
  DAILY_SCAN_LIMIT?: string;
  BURST_PER_MINUTE?: string;
  MONTHLY_SPEND_CAP_USD?: string;
  ESTIMATED_COST_PER_SCAN_USD?: string;
}): LimitConfig {
  return {
    dailyLimit: nonNegativeInt(env.DAILY_SCAN_LIMIT, 20),
    burstPerMinute: nonNegativeInt(env.BURST_PER_MINUTE, 5),
    costCents: dollarsToCents(env.ESTIMATED_COST_PER_SCAN_USD, 3),
    capCents: dollarsToCents(env.MONTHLY_SPEND_CAP_USD, 500),
  };
}

function nonNegativeInt(raw: string | undefined, fallback: number): number {
  if (raw === undefined || raw.trim() === '') return fallback;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 0) return fallback;
  return n;
}

function dollarsToCents(raw: string | undefined, fallbackCents: number): number {
  if (raw === undefined || raw.trim() === '') return fallbackCents;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return fallbackCents;
  return Math.round(n * 100);
}

export function accountKey(accountId: string): string {
  return accountId.toLowerCase().replace(/[^a-z0-9@._+-]/g, '_').slice(0, 120);
}

export function utcStamp(now: Date): { day: string; month: string; minute: string } {
  const iso = now.toISOString();
  return { day: iso.slice(0, 10), month: iso.slice(0, 7), minute: iso.slice(0, 16) };
}

export async function monthSpendCents(store: LimitStore, now: Date): Promise<number> {
  const { month } = utcStamp(now);
  return Number(await store.get(`m:${month}`) || '0') || 0;
}

export async function scanningPaused(store: LimitStore, now: Date, cfg: LimitConfig): Promise<boolean> {
  if (cfg.capCents <= 0) return true;
  const spent = await monthSpendCents(store, now);
  return spent + cfg.costCents > cfg.capCents;
}

/** Reserve one scan. Refusals do not increment. Images are not stored. */
export async function reserveScan(
  store: LimitStore,
  accountId: string,
  now: Date,
  cfg: LimitConfig,
): Promise<{ ok: true } | { ok: false; code: LimitCode }> {
  const stamp = utcStamp(now);
  const who = accountKey(accountId);
  const burstKey = `b:${who}:${stamp.minute}`;
  const dayKey = `d:${who}:${stamp.day}`;
  const monthKey = `m:${stamp.month}`;

  const burst = Number(await store.get(burstKey) || '0') || 0;
  if (burst >= cfg.burstPerMinute) return { ok: false, code: 'rate_limit' };
  const daily = Number(await store.get(dayKey) || '0') || 0;
  if (daily >= cfg.dailyLimit) return { ok: false, code: 'daily_limit' };
  const spent = Number(await store.get(monthKey) || '0') || 0;
  if (cfg.capCents <= 0 || spent + cfg.costCents > cfg.capCents) {
    return { ok: false, code: 'spending_cap' };
  }

  await store.put(burstKey, String(burst + 1), { expirationTtl: 120 });
  await store.put(dayKey, String(daily + 1), { expirationTtl: 60 * 60 * 48 });
  await store.put(monthKey, String(spent + cfg.costCents), { expirationTtl: 60 * 60 * 24 * 40 });
  return { ok: true };
}
