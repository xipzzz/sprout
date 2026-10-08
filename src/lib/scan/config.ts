/* Worker location is baked in at build time. An empty URL means scanning
   is not set up — the app must say so and must not invent questions. */

export function scanWorkerUrl(): string {
  const value = import.meta.env.VITE_SCAN_WORKER_URL;
  return typeof value === 'string' ? value.trim().replace(/\/$/, '') : '';
}

export function scanGoogleClientId(): string {
  const value = import.meta.env.VITE_SCAN_GOOGLE_CLIENT_ID;
  return typeof value === 'string' ? value.trim() : '';
}

export function scanEndpoint(base: string): string {
  const trimmed = base.replace(/\/$/, '');
  return trimmed.endsWith('/scan') ? trimmed : `${trimmed}/scan`;
}

export function healthEndpoint(base: string): string {
  return scanEndpoint(base).replace(/\/scan$/, '/health');
}
