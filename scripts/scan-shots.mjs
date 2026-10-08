import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const outDir = path.resolve('screenshots/scan-flow');
fs.mkdirSync(outDir, { recursive: true });

const shots = [
  ['check', 'check.png'],
  ['fill', 'quiz-fill-blank.png'],
  ['choice', 'quiz-multiple-choice.png'],
  ['match', 'quiz-matching.png'],
  ['rewrite', 'quiz-rewrite.png'],
  ['error', 'error.png'],
];

const browser = await chromium.launch({
  executablePath: '/usr/local/bin/google-chrome',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 1,
});

for (const [which, file] of shots) {
  await page.goto(`http://127.0.0.1:5173/?scanShot=${which}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-scan-shot-ready]');
  await page.evaluate(() => document.fonts?.ready);
  await page.screenshot({ path: path.join(outDir, file) });
  console.log(file);
}

const cvOk = await page.evaluate(async () => {
  const mod = await import('/src/lib/scan/preprocess.ts');
  const cv = await mod.loadCv();
  return Boolean(cv && cv.Mat);
});
console.log('opencv browser', cvOk);

await browser.close();
