import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const QA_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const REPO_ROOT = resolve(QA_DIR, '..');
export const OUT_DIR = resolve(QA_DIR, 'out');
export const DATA_DIR = resolve(QA_DIR, 'data');

export const API_PORT = Number(process.env.SPROUT_API_PORT || 8787);
export const VITE_PORT = Number(process.env.SPROUT_VITE_PORT || 5173);
export const API_URL = `http://127.0.0.1:${API_PORT}`;
export const APP_URL = `http://127.0.0.1:${VITE_PORT}`;

export const VIEWPORT = { width: 390, height: 844 };

export function defaultImageDir() {
  const arg = process.argv.find((value, i) => i > 1 && !value.startsWith('-'));
  if (arg) return resolve(process.cwd(), arg);
  if (process.env.QA_IMAGE_DIR) return resolve(process.env.QA_IMAGE_DIR);
  const local = resolve(DATA_DIR, 'real-hw');
  if (existsSync(local)) return local;
  return '';
}

export function imageExtensions(name) {
  return /\.(jpe?g|png|webp|gif|tif{1,2}|bmp)$/i.test(name);
}
