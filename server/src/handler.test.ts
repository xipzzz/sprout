import assert from 'node:assert/strict';
import fs from 'node:fs';
import { describe, it } from 'node:test';
import { createAdapter } from './adapters';
import { authenticate } from './auth';
import { handleScan, type ScanEnv } from './handler';
import { reserveScan, type LimitStore } from './limits';
import { mockAdapter } from './mock';

function memoryStore(): LimitStore & { map: Map<string, string> } {
  const map = new Map<string, string>();
  return {
    map,
    async get(key) {
      return map.has(key) ? map.get(key)! : null;
    },
    async put(key, value) {
      map.set(key, value);
    },
  };
}

function jpeg(): Uint8Array {
  const bytes = new Uint8Array(64);
  bytes[0] = 0xff;
  bytes[1] = 0xd8;
  bytes[2] = 0xff;
  return bytes;
}

function scanRequest(headers: Record<string, string> = {}): Request {
  return new Request('https://scan.example/scan', {
    method: 'POST',
    headers: {
      'Content-Type': 'image/jpeg',
      Origin: 'https://xipzzz.github.io',
      ...headers,
    },
    body: jpeg().slice(),
  });
}

const baseEnv = {
  PROVIDER: 'openai',
  VISION_API_KEY: 'test-key',
  GOOGLE_CLIENT_ID: 'client-id',
  ALLOWED_EMAILS: 'parent@example.com',
  DAILY_SCAN_LIMIT: '20',
  MONTHLY_SPEND_CAP_USD: '5',
  ESTIMATED_COST_PER_SCAN_USD: '0.03',
} satisfies Partial<ScanEnv>;

const validPage = JSON.stringify({
  error: '',
  questions: [{
    id: 'q1',
    type: 'multiple_choice',
    instruction: '',
    prompt: 'Which word is a noun?',
    options: ['run', 'table'],
    left: [],
    right: [],
    emphasis: [],
  }],
});

async function bodyOf(res: Response): Promise<Record<string, unknown>> {
  return await res.json() as Record<string, unknown>;
}

describe('authenticate', () => {
  it('refuses when parent sign-in is not configured', async () => {
    const result = await authenticate(scanRequest({ Authorization: 'Bearer abc' }), {});
    assert.equal(result.status, 'not_configured');
  });

  it('refuses a request with no token', async () => {
    const result = await authenticate(scanRequest(), baseEnv, async () => 'parent@example.com');
    assert.equal(result.status, 'rejected');
  });

  it('refuses a token the verifier does not accept', async () => {
    const result = await authenticate(
      scanRequest({ Authorization: 'Bearer nope' }),
      baseEnv,
      async () => null,
    );
    assert.equal(result.status, 'rejected');
  });
});

describe('handleScan abuse protection', () => {
  it('returns 401 with no questions when the caller is not signed in', async () => {
    const store = memoryStore();
    const res = await handleScan(scanRequest(), { ...baseEnv, SCAN_LIMITS: store });
    assert.equal(res.status, 401);
    const body = await bodyOf(res);
    assert.equal(body.code, 'unauthorized');
    assert.equal('questions' in body, false);
  });

  it('returns 401 when sign-in is not configured', async () => {
    const res = await handleScan(scanRequest({ Authorization: 'Bearer x' }), {
      ...baseEnv,
      GOOGLE_CLIENT_ID: '',
      ALLOWED_EMAILS: '',
      SCAN_LIMITS: memoryStore(),
    });
    assert.equal(res.status, 401);
    const body = await bodyOf(res);
    assert.equal(body.code, 'auth_not_configured');
    assert.equal('questions' in body, false);
  });

  it('refuses the daily limit before calling the model', async () => {
    const store = memoryStore();
    const now = new Date('2026-10-08T12:00:00.000Z');
    for (let i = 0; i < 2; i++) {
      const reserved = await reserveScan(store, 'parent@example.com', now, {
        dailyLimit: 2,
        burstPerMinute: 10,
        costCents: 3,
        capCents: 500,
      });
      assert.equal(reserved.ok, true);
    }
    let called = false;
    const res = await handleScan(
      scanRequest({ Authorization: 'Bearer good' }),
      { ...baseEnv, DAILY_SCAN_LIMIT: '2', SCAN_LIMITS: store },
      {
        now: () => now,
        verifyToken: async () => 'parent@example.com',
        adapter: mockAdapter({ onImage() { called = true; return validPage; } }),
      },
    );
    assert.equal(res.status, 429);
    const body = await bodyOf(res);
    assert.equal(body.code, 'daily_limit');
    assert.equal('questions' in body, false);
    assert.equal(called, false);
  });

  it('refuses the monthly cap before calling the model', async () => {
    const store = memoryStore();
    const now = new Date('2026-10-08T12:00:00.000Z');
    store.map.set('m:2026-10', '100');
    let called = false;
    const res = await handleScan(
      scanRequest({ Authorization: 'Bearer good' }),
      {
        ...baseEnv,
        MONTHLY_SPEND_CAP_USD: '1',
        ESTIMATED_COST_PER_SCAN_USD: '0.03',
        SCAN_LIMITS: store,
      },
      {
        now: () => now,
        verifyToken: async () => 'parent@example.com',
        adapter: mockAdapter({ onImage() { called = true; return validPage; } }),
      },
    );
    assert.equal(res.status, 429);
    const body = await bodyOf(res);
    assert.equal(body.code, 'spending_cap');
    assert.equal('questions' in body, false);
    assert.equal(called, false);
  });

  it('returns the model error and no questions', async () => {
    const res = await handleScan(
      scanRequest({ Authorization: 'Bearer good' }),
      { ...baseEnv, SCAN_LIMITS: memoryStore() },
      {
        verifyToken: async () => 'parent@example.com',
        adapter: mockAdapter({
          image: JSON.stringify({
            error: 'blank page',
            questions: [{
              id: 'q9',
              type: 'rewrite',
              instruction: '',
              prompt: 'Invented sentence.',
              options: [],
              left: [],
              right: [],
              emphasis: [],
            }],
          }),
        }),
      },
    );
    assert.equal(res.status, 422);
    const body = await bodyOf(res);
    assert.equal('questions' in body, false);
    assert.match(String(body.error), /blank page/);
  });

  it('returns validated questions from the mock adapter in tests', async () => {
    const res = await handleScan(
      scanRequest({ Authorization: 'Bearer good' }),
      { ...baseEnv, SCAN_LIMITS: memoryStore() },
      {
        verifyToken: async () => 'parent@example.com',
        adapter: mockAdapter({
          image: validPage,
          text: JSON.stringify({ suggestions: [{ id: 'q1', answer: 'table' }, { id: 'q99', answer: 'nope' }] }),
        }),
      },
    );
    assert.equal(res.status, 200);
    const body = await bodyOf(res);
    const questions = body.questions as { suggestion: string; prompt: string }[];
    assert.equal(questions.length, 1);
    assert.equal(questions[0].prompt, 'Which word is a noun?');
    assert.equal(questions[0].suggestion, 'table');
  });
});

describe('production provider switch', () => {
  it('rejects the mock provider', () => {
    assert.throws(() => createAdapter('mock', undefined), /mock adapter cannot be enabled/);
  });

  it('does not import the mock adapter from the worker entry', () => {
    const dir = new URL('.', import.meta.url);
    const sources = ['index.ts', 'handler.ts', 'adapters.ts']
      .map((name) => fs.readFileSync(new URL(name, dir), 'utf8'))
      .join('\n');
    assert.doesNotMatch(sources, /from '\.\/mock'/);
  });

  it('builds each real adapter', () => {
    assert.equal(createAdapter('openai', undefined).id, 'openai');
    assert.equal(createAdapter('anthropic', undefined).id, 'anthropic');
    assert.equal(createAdapter('xai', undefined).id, 'xai');
  });
});
