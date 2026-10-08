/* Scan endpoint. The image is read once and never stored or logged.
   Invalid model JSON and error strings return no questions. */

import { extractJsonObject, validateModelPayload } from '../../src/lib/scan/schema';
import { suggestionsFromModel } from '../../src/lib/scan/suggestions';
import type { ScannedQuestion } from '../../src/lib/scan/types';
import { authenticate, type AuthResult } from './auth';
import { createAdapter, type VisionAdapter } from './adapters';
import { verifyGoogleIdToken } from './googleJwt';
import { limitConfigFromEnv, reserveScan, scanningPaused, type LimitStore } from './limits';
import { VISION_PROMPT } from './visionPrompt';

export interface ScanEnv {
  PROVIDER?: string;
  VISION_API_KEY?: string;
  VISION_MODEL?: string;
  ALLOWED_ORIGIN?: string;
  GOOGLE_CLIENT_ID?: string;
  ALLOWED_EMAILS?: string;
  DAILY_SCAN_LIMIT?: string;
  BURST_PER_MINUTE?: string;
  MONTHLY_SPEND_CAP_USD?: string;
  ESTIMATED_COST_PER_SCAN_USD?: string;
  SCAN_LIMITS?: LimitStore;
}

export interface HandlerDeps {
  verifyToken?: (token: string, env: ScanEnv) => Promise<string | null>;
  adapter?: VisionAdapter;
  now?: () => Date;
}

const MAX_BYTES = 4_000_000;
const DEFAULT_ORIGIN = 'https://xipzzz.github.io';

function allowedOrigin(request: Request, env: ScanEnv): string | null {
  const origin = request.headers.get('Origin');
  const list = (env.ALLOWED_ORIGIN || DEFAULT_ORIGIN).split(',').map((item) => item.trim()).filter(Boolean);
  if (!origin) return list[0] || null;
  return list.includes(origin) ? origin : null;
}

function corsHeaders(origin: string | null): Headers {
  const headers = new Headers();
  if (origin) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Vary', 'Origin');
    headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    headers.set('Access-Control-Max-Age', '86400');
  }
  return headers;
}

function json(status: number, body: Record<string, unknown>, origin: string | null): Response {
  const headers = corsHeaders(origin);
  headers.set('Content-Type', 'application/json');
  headers.set('Cache-Control', 'no-store');
  return new Response(JSON.stringify(body), { status, headers });
}

function fail(status: number, code: string, message: string, origin: string | null): Response {
  return json(status, { error: message, code }, origin);
}

async function readLimited(request: Request): Promise<Uint8Array | null> {
  const claimed = Number(request.headers.get('content-length') || '0');
  if (claimed > MAX_BYTES) return null;
  if (!request.body) return new Uint8Array();
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    total += value.byteLength;
    if (total > MAX_BYTES) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return out;
}

function looksLikeImage(bytes: Uint8Array): boolean {
  if (bytes.length < 32) return false;
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return true;
  if (bytes[0] === 0x89 && bytes[1] === 0x50) return true;
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) return true;
  return false;
}

function mediaType(bytes: Uint8Array): string {
  if (bytes[0] === 0x89) return 'image/png';
  if (bytes[0] === 0x52) return 'image/webp';
  return 'image/jpeg';
}

function solvePrompt(questions: ScannedQuestion[]): string {
  return [
    'Solve these already-transcribed children\'s English questions for a parent to check.',
    'Do not add, remove, or rewrite the questions. Return JSON only:',
    '{"suggestions":[{"id":"q1","answer":"..."}]}',
    'Rules:',
    '- Skip an id if you are not sure.',
    '- If the question has options, answer must be exactly one of those option strings.',
    '- matching: one line per pair, "left => right", using only that question\'s left and right strings, each left once.',
    '- fill_blank with no options: the missing word or short phrase.',
    '- rewrite: the full rewritten sentence.',
    JSON.stringify(questions),
  ].join('\n');
}

function pathOf(request: Request): string {
  return new URL(request.url).pathname.replace(/\/$/, '') || '/';
}

export async function handleScan(request: Request, env: ScanEnv, deps: HandlerDeps = {}): Promise<Response> {
  const origin = allowedOrigin(request, env);
  const requestOrigin = request.headers.get('Origin');
  if (requestOrigin && !origin) return fail(403, 'forbidden', 'This app cannot use the reader.', null);

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  const path = pathOf(request);
  const now = deps.now ? deps.now() : new Date();
  const limits = env.SCAN_LIMITS;

  if (request.method === 'GET' && (path === '/health' || path === '/')) {
    const cfg = limitConfigFromEnv(env);
    let paused = cfg.capCents <= 0;
    if (limits) {
      try {
        paused = await scanningPaused(limits, now, cfg);
      } catch {
        paused = true;
      }
    }
    return json(200, {
      ok: true,
      authConfigured: Boolean(env.GOOGLE_CLIENT_ID?.trim() && env.ALLOWED_EMAILS?.trim()),
      providerConfigured: Boolean(env.VISION_API_KEY?.trim()) && Boolean(env.PROVIDER?.trim()) && env.PROVIDER !== 'mock',
      paused,
      dailyLimit: cfg.dailyLimit,
    }, origin);
  }

  if (request.method !== 'POST' || (path !== '/scan' && path !== '/')) {
    return fail(404, 'not_found', 'Nothing here.', origin);
  }

  const providerName = (env.PROVIDER || '').trim().toLowerCase();
  if (providerName === 'mock' || providerName === 'test') {
    return fail(500, 'provider_disabled', 'Scanning is not set up yet.', origin);
  }

  const auth: AuthResult = await authenticate(request, env, deps.verifyToken);
  if (auth.status === 'not_configured') {
    return fail(401, 'auth_not_configured', 'Parent sign-in is not connected yet.', origin);
  }
  if (auth.status === 'rejected') {
    return fail(401, 'unauthorized', 'Sign in as a parent before scanning.', origin);
  }

  if (!limits) return fail(503, 'not_configured', 'Scanning is not set up yet.', origin);
  if (!env.VISION_API_KEY?.trim()) return fail(503, 'not_configured', 'Scanning is not set up yet.', origin);

  const bytes = await readLimited(request);
  if (!bytes) return fail(413, 'too_large', 'That photo is too big.', origin);
  if (!looksLikeImage(bytes)) return fail(400, 'bad_image', 'That file does not look like a photo of a page.', origin);

  const cfg = limitConfigFromEnv(env);
  let reserved: Awaited<ReturnType<typeof reserveScan>>;
  try {
    reserved = await reserveScan(limits, auth.accountId, now, cfg);
  } catch {
    return fail(503, 'not_configured', 'Scanning is not set up yet.', origin);
  }
  if (!reserved.ok) {
    const message = reserved.code === 'spending_cap'
      ? 'Scanning is paused for now.'
      : reserved.code === 'daily_limit'
        ? 'Enough pages for today.'
        : 'Wait a minute, then try again.';
    return fail(429, reserved.code, message, origin);
  }

  let adapter = deps.adapter;
  if (!adapter) {
    try {
      adapter = createAdapter(env.PROVIDER, env.VISION_MODEL);
    } catch {
      return fail(500, 'provider_disabled', 'Scanning is not set up yet.', origin);
    }
  }

  let raw: string;
  try {
    raw = await adapter.readImage({
      prompt: VISION_PROMPT,
      bytes,
      mediaType: mediaType(bytes),
      apiKey: env.VISION_API_KEY,
    });
  } catch {
    return fail(502, 'provider_error', 'Pip could not read that page. Try another photo.', origin);
  }

  let validated: ReturnType<typeof validateModelPayload>;
  try {
    validated = validateModelPayload(extractJsonObject(raw));
  } catch {
    return fail(422, 'invalid', 'Pip could not read that page. Try another photo.', origin);
  }
  if (!validated.ok) {
    return fail(422, 'invalid', validated.reason, origin);
  }

  let suggestions: Record<string, string> = {};
  try {
    const solved = await adapter.readText({
      prompt: solvePrompt(validated.questions),
      apiKey: env.VISION_API_KEY,
    });
    suggestions = suggestionsFromModel(validated.questions, extractJsonObject(solved));
  } catch {
    suggestions = {};
  }

  return json(200, {
    questions: validated.questions.map((question) => ({
      ...question,
      suggestion: suggestions[question.id] || '',
    })),
  }, origin);
}

export { verifyGoogleIdToken };
