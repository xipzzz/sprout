/* Talk to the scan Worker. The photo is posted once and not kept here. */

import { healthEndpoint, scanEndpoint, scanWorkerUrl } from './config';
import { interpretScanResponse, type ScanOutcome } from './response';

export interface ScanHealth {
  ok: boolean;
  authConfigured: boolean;
  providerConfigured: boolean;
  costConfigured: boolean;
  paused: boolean;
  dailyLimit: number;
}

export async function fetchScanHealth(): Promise<ScanHealth> {
  const base = scanWorkerUrl();
  if (!base) {
    return { ok: false, authConfigured: false, providerConfigured: false, costConfigured: false, paused: false, dailyLimit: 20 };
  }
  const res = await fetch(healthEndpoint(base));
  if (!res.ok) throw new Error('health');
  const body = await res.json() as Partial<ScanHealth>;
  return {
    ok: true,
    authConfigured: Boolean(body.authConfigured),
    providerConfigured: Boolean(body.providerConfigured),
    costConfigured: body.costConfigured !== false,
    paused: Boolean(body.paused),
    dailyLimit: typeof body.dailyLimit === 'number' ? body.dailyLimit : 20,
  };
}

export async function postScanPage(jpeg: Blob, token: string): Promise<ScanOutcome> {
  const base = scanWorkerUrl();
  if (!base) {
    return {
      ok: false,
      code: 'not_configured',
      message: 'Scanning is not set up yet.',
    };
  }
  let res: Response;
  try {
    res = await fetch(scanEndpoint(base), {
      method: 'POST',
      headers: {
        'Content-Type': 'image/jpeg',
        Authorization: `Bearer ${token}`,
      },
      body: jpeg,
    });
  } catch {
    return {
      ok: false,
      code: 'provider_error',
      message: 'Pip could not reach the homework reader. Try again.',
    };
  }
  let body: unknown;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  return interpretScanResponse(res.status, body);
}
