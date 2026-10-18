import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { API_PORT, API_URL, APP_URL, REPO_ROOT, VITE_PORT } from './paths.mjs';

const children = [];

function spawnLogged(command, args, { cwd = REPO_ROOT, env = process.env, name } = {}) {
  const child = spawn(command, args, {
    cwd,
    env,
    stdio: process.env.QA_VERBOSE ? ['ignore', 'pipe', 'pipe'] : 'ignore',
    detached: true,
  });
  if (process.env.QA_VERBOSE) {
    child.stdout.on('data', (buf) => process.stdout.write(`[${name}] ${buf}`));
    child.stderr.on('data', (buf) => process.stderr.write(`[${name}] ${buf}`));
  }
  child.unref();
  children.push(child);
  return child;
}

async function waitFor(url, { timeout = 60_000, ok = (res) => res.ok } = {}) {
  const start = Date.now();
  let last = '';
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
      if (ok(res)) return;
      last = `${res.status}`;
    } catch (err) {
      last = err instanceof Error ? err.message : String(err);
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(`Timed out waiting for ${url} (${last})`);
}

export function pythonBin() {
  const venv = `${REPO_ROOT}/prototype/exam/.venv/bin/python`;
  return existsSync(venv) ? venv : 'python3';
}

export async function ensureVenv() {
  const venvPy = `${REPO_ROOT}/prototype/exam/.venv/bin/python`;
  if (existsSync(venvPy)) return venvPy;
  const { error } = await new Promise((resolve) => {
    const child = spawn('python3', ['-m', 'venv', `${REPO_ROOT}/prototype/exam/.venv`], {
      cwd: REPO_ROOT,
      stdio: 'inherit',
    });
    child.on('exit', (code) => resolve({ error: code ? new Error(`venv exit ${code}`) : null }));
  });
  if (error) throw error;
  await new Promise((resolve, reject) => {
    const child = spawn(
      `${REPO_ROOT}/prototype/exam/.venv/bin/pip`,
      ['install', '-r', `${REPO_ROOT}/prototype/exam/server/requirements.txt`],
      { cwd: REPO_ROOT, stdio: 'inherit' },
    );
    child.on('exit', (code) => (code ? reject(new Error('pip install failed')) : resolve()));
  });
  return venvPy;
}

export async function startApi() {
  await ensureVenv();
  spawnLogged(pythonBin(), ['-m', 'uvicorn', 'app:app', '--host', '127.0.0.1', '--port', String(API_PORT)], {
    cwd: `${REPO_ROOT}/prototype/exam/server`,
    env: { ...process.env, SPROUT_OCR: process.env.SPROUT_OCR || '' },
    name: 'api',
  });
  await waitFor(`${API_URL}/api/health`);
}

export async function startVite() {
  spawnLogged('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(VITE_PORT), '--strictPort'], {
    name: 'vite',
  });
  await waitFor(`${APP_URL}/?exam=1`, {
    ok: (res) => res.status >= 200 && res.status < 500,
    timeout: 90_000,
  });
}

export async function startExamStack({ vite = true } = {}) {
  await startApi();
  if (vite) await startVite();
}

export function stopExamStack() {
  for (const child of children.splice(0)) {
    try {
      if (child.pid) process.kill(-child.pid, 'SIGTERM');
    } catch {
      try {
        child.kill('SIGTERM');
      } catch {
        /* ignore */
      }
    }
  }
}

export async function withExamStack(fn, opts) {
  await startExamStack(opts);
  try {
    return await fn();
  } finally {
    stopExamStack();
  }
}
