#!/usr/bin/env node
/** 390x844 walkthrough. Title card before each section, red outline before
 *  each tap, answers picked from the screen. Writes sections.json + raw video.
 *  Missing features are named on a title card and never faked.
 *
 *    node qa/record/record.mjs
 *    bash qa/record/trim.sh
 */
import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { OUT_DIR, REPO_ROOT } from '../lib/paths.mjs';
import { startExamStack, stopExamStack } from '../lib/exam-stack.mjs';
import { speakToWav } from '../lib/tts.mjs';
import {
  assertChildScreenSafe,
  collectOnScreenSecrets,
  chooseFirstChildAnswer,
  detectFeatures,
  dismissPinIfPresent,
  hasButton,
  hideTitleCard,
  launchPhone,
  openExam,
  outlineTap,
  pickParentAnswers,
  screenOf,
  showTitleCard,
  visibleText,
  waitForChild,
  waitForParentOrError,
} from '../lib/playwright-kit.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const outDir = join(process.env.QA_OUT || OUT_DIR, 'record');
const lines = JSON.parse(await readFile(join(HERE, 'lines.json'), 'utf8'));

function nowSec(t0) {
  return (Date.now() - t0) / 1000;
}

async function run() {
  await mkdir(join(outDir, 'narration'), { recursive: true });
  process.chdir(REPO_ROOT);

  let ownStack = true;
  try {
    const health = await fetch('http://127.0.0.1:5173/?exam=1', { signal: AbortSignal.timeout(1500) }).catch(() => null);
    if (health && health.status < 500) ownStack = false;
  } catch {
    ownStack = true;
  }
  if (ownStack) await startExamStack({ vite: true });

  const { browser, context, page } = await launchPhone(
    { chromium },
    {
      timeout: 90_000,
      recordVideo: { dir: join(outDir, 'raw'), size: { width: 390, height: 844 } },
    },
  );

  const sections = [];
  const waits = [];
  const t0 = Date.now();

  async function section(id, extraNote = '') {
    const meta = lines[String(id)];
    const start = nowSec(t0);
    await showTitleCard(page, { n: id, title: meta.title, note: extraNote }, extraNote ? 2600 : 2000);
    await hideTitleCard(page);
    const entry = {
      id,
      title: meta.title,
      start: Number(start.toFixed(3)),
      skipped: Boolean(extraNote),
      note: extraNote,
      narration: extraNote ? meta.skip : meta.line,
    };
    sections.push(entry);
    return entry;
  }

  async function markWait(fn) {
    const start = nowSec(t0);
    try {
      return await fn();
    } finally {
      const end = nowSec(t0);
      if (end - start > 2.4) waits.push({ start: Number(start.toFixed(3)), end: Number(end.toFixed(3)) });
    }
  }

  try {
    await openExam(page);
    await dismissPinIfPresent(page);

    await section(1);
    const sample = page.getByRole('button', { name: /Try the sample photo/i });
    if (await sample.isVisible().catch(() => false)) {
      await outlineTap(page, sample);
      const state = await markWait(() => waitForParentOrError(page, 180_000));
      if (state !== 'parent') throw new Error('Sample scan did not reach parent review');
    } else {
      sections.at(-1).skipped = true;
      sections.at(-1).note = 'not in this build';
      sections.at(-1).narration = lines['1'].skip;
    }

    const parentOk = (await screenOf(page)) === 'parent-review' || /Check the page/i.test(await visibleText(page));
    if (parentOk) {
      await page.waitForTimeout(1200);
      await section(2);
      await page.locator('.exam-proto__page-flags, .exam-proto__flag-summary, .exam-proto__flag').first().scrollIntoViewIfNeeded().catch(() => {});
      await page.waitForTimeout(1400);
      const secrets = await collectOnScreenSecrets(page);
      await pickParentAnswers(page);
      await page.locator('.exam-proto__card').last().scrollIntoViewIfNeeded().catch(() => {});
      await page.waitForTimeout(1400);
      page._qaSecrets = secrets;
    } else {
      await section(2, 'not in this build — parent review did not open');
    }

    const found = await detectFeatures(page);
    const explainBtn = await hasButton(page, [/Explain each question/i]);
    if (explainBtn) {
      await section(3);
      await outlineTap(page, explainBtn);
      await page.waitForTimeout(900);
      const back = page.getByRole('button', { name: /Check page|Back to the page/i });
      if (await back.isVisible().catch(() => false)) await outlineTap(page, back);
    } else {
      await section(3, 'not in this build — only present after PR #99 is stacked');
    }

    const notebookBtn = await hasButton(page, [/Mistake notebook/i]);
    if (notebookBtn) {
      await section(4);
      await outlineTap(page, notebookBtn);
      await page.waitForTimeout(700);
      const weak = page.getByRole('tab', { name: /Weak topics/i });
      if (await weak.isVisible().catch(() => false)) {
        await outlineTap(page, weak);
        await page.waitForTimeout(700);
      }
      const backBook = page.locator('button[aria-label="Back to the scan"]');
      if (await backBook.isVisible().catch(() => false)) await outlineTap(page, backBook);
    } else {
      await section(4, 'not in this build — only present after PR #98 is stacked');
    }

    if (found.pin || found.year || found.print) {
      await section(5);
      const yearBtn = page.locator('.parent-tools__year').first();
      if (await yearBtn.isVisible().catch(() => false)) {
        await outlineTap(page, yearBtn);
        await page.waitForTimeout(400);
      }
      const printBtn = await hasButton(page, [/Print worksheet/i]);
      if (printBtn) {
        await outlineTap(page, printBtn);
        await page.waitForTimeout(800);
        const close = page.getByRole('button', { name: /Close|Done|Back/i }).first();
        if (await close.isVisible().catch(() => false)) await close.click();
      }
      const lock = await hasButton(page, [/Lock parent page/i]);
      if (lock) {
        await outlineTap(page, lock);
        await page.waitForTimeout(500);
        await dismissPinIfPresent(page);
      }
    } else {
      await section(5, 'not in this build — only present after PR #97 is stacked');
    }

    const practice = page.getByRole('button', { name: /Practice with Pip/i });
    if (await practice.isVisible().catch(() => false)) {
      await section(6);
      await outlineTap(page, practice);
      await waitForChild(page);
      await page.waitForTimeout(1000);
      await assertChildScreenSafe(page, page._qaSecrets || []);
      await chooseFirstChildAnswer(page);
      await page.waitForTimeout(1600);
      await assertChildScreenSafe(page, page._qaSecrets || []);
    } else {
      await section(6, 'not in this build — practice did not unlock');
    }

    await page.waitForTimeout(800);
  } finally {
    const video = page.video();
    await context.close();
    await browser.close();
    if (ownStack) stopExamStack();
    if (video) {
      const src = await video.path();
      const dest = join(outDir, 'raw.webm');
      await copyFile(src, dest);
      console.log('raw video', dest);
    }
  }

  const engine = [];
  for (const section of sections) {
    const wav = join(outDir, 'narration', `${String(section.id).padStart(2, '0')}.wav`);
    const used = await speakToWav(section.narration, wav);
    section.wav = `narration/${String(section.id).padStart(2, '0')}.wav`;
    engine.push(used);
  }

  const payload = {
    viewport: { width: 390, height: 844 },
    rawVideo: 'raw.webm',
    recordedAt: new Date().toISOString(),
    tts: engine[0] || 'none',
    sections,
    waits,
  };
  await writeFile(join(outDir, 'sections.json'), JSON.stringify(payload, null, 2));
  console.log(JSON.stringify(payload, null, 2));
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  stopExamStack();
  process.exit(1);
});
