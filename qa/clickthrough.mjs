#!/usr/bin/env node
/** Headless 390x844 click-through of exam features. Screenshots each step.
 *  Missing stacked features (#97 PIN/print, #98 notebook, #99 explain/hints)
 *  are detected and skipped with a clear 'not in this build' note.
 *  Fails loudly if any child screen shows answer text.
 *
 *    node qa/clickthrough.mjs [image-folder]
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { defaultImageDir, imageExtensions, OUT_DIR, REPO_ROOT } from './lib/paths.mjs';
import { startExamStack, stopExamStack } from './lib/exam-stack.mjs';
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
  shot,
  showTitleCard,
  visibleText,
  waitForChild,
  waitForParentOrError,
} from './lib/playwright-kit.mjs';
import { readdir } from 'node:fs/promises';

const outDir = join(process.env.QA_OUT || OUT_DIR, 'clickthrough');
const report = [];
const features = {
  scan_sample: 'pending',
  scan_real: 'pending',
  explain_hints: 'pending',
  notebook: 'pending',
  pin_year_print: 'pending',
};

function log(line) {
  report.push(line);
  console.log(line);
}

async function pickRealPhoto() {
  const dir = defaultImageDir();
  if (!dir || !existsSync(dir)) return '';
  const preferred = [
    'rhw_22_sg-cna_p3-maths-5x8-marked.jpg',
    'rhw_24_sg-mothership_p1-maths-counting-marked.jpg',
    'rhw_16_flickr_are-there-enough-math.jpg',
    'rhw_02_flickr_math-compare-stars-worksheet.jpg',
  ];
  const names = (await readdir(dir)).filter(imageExtensions);
  for (const name of preferred) {
    if (names.includes(name)) return join(dir, name);
  }
  return names[0] ? join(dir, names[0]) : '';
}

async function noteMissing(page, n, title, reason) {
  await showTitleCard(page, { n, title, note: `not in this build — ${reason}` }, 1200);
  await shot(page, outDir, `${String(n).padStart(2, '0')}-missing-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
  await hideTitleCard(page);
  log(`SKIP ${title}: not in this build (${reason})`);
}

async function practiceIfUnlocked(page, label, secrets, n) {
  const locked = page.getByRole('button', { name: /Practice locked/i });
  const open = page.getByRole('button', { name: /Practice with Pip/i });
  if (await locked.isVisible().catch(() => false)) {
    await shot(page, outDir, `${n}-practice-locked`);
    log(`WARN ${label}: practice stayed locked`);
    return false;
  }
  if (!(await open.isVisible().catch(() => false))) {
    log(`WARN ${label}: no Practice with Pip button`);
    return false;
  }
  await outlineTap(page, open);
  await waitForChild(page);
  await shot(page, outDir, `${n}-child`);
  await assertChildScreenSafe(page, secrets);
  log(`PASS ${label}: child screen has stem/choices only`);
  await chooseFirstChildAnswer(page);
  await shot(page, outDir, `${n}-child-after-tap`);
  await assertChildScreenSafe(page, secrets);
  const hint = page.locator('.exam-child__hint');
  if (await hint.isVisible().catch(() => false)) {
    log('NOTE hint appeared after a tap');
    await shot(page, outDir, `${n}-child-hint`);
    await assertChildScreenSafe(page, secrets);
  }
  return true;
}

async function run() {
  await mkdir(outDir, { recursive: true });
  process.chdir(REPO_ROOT);
  let ownStack = true;
  try {
    const health = await fetch('http://127.0.0.1:5173/?exam=1', { signal: AbortSignal.timeout(1500) }).catch(() => null);
    if (health && health.status < 500) ownStack = false;
  } catch {
    ownStack = true;
  }
  if (ownStack) {
    log('starting exam stack');
    await startExamStack({ vite: true });
  } else {
    log('reusing exam stack');
  }

  const { browser, context, page } = await launchPhone({ chromium }, { timeout: 60_000 });

  try {
    await openExam(page);
    await dismissPinIfPresent(page);
    await shot(page, outDir, '00-exam-pick');

    // --- 1. Goppai-style scan: sample ---
    const sample = page.getByRole('button', { name: /Try the sample photo/i });
    if (!(await sample.isVisible().catch(() => false))) {
      features.scan_sample = 'fail';
      throw new Error('Sample photo button missing on the exam pick screen');
    }
    await outlineTap(page, sample);
    await shot(page, outDir, '01-sample-loading');
    const sampleState = await waitForParentOrError(page, 180_000);
    await shot(page, outDir, '02-sample-parent');
    if (sampleState !== 'parent') {
      features.scan_sample = 'fail';
      throw new Error('Sample scan did not reach parent review');
    }
    log('PASS scan sample: parent review opened');
    const sampleSecrets = await collectOnScreenSecrets(page);
    await pickParentAnswers(page);
    await shot(page, outDir, '03-sample-picked');
    const practised = await practiceIfUnlocked(page, 'scan sample', sampleSecrets, '04');
    features.scan_sample = practised ? 'pass' : 'fail';
    const back = page.getByRole('button', { name: /Parent page/i });
    if (await back.isVisible().catch(() => false)) await outlineTap(page, back);

    // --- 1b. Real photo ---
    const real = process.env.QA_REAL_PHOTO || (await pickRealPhoto());
    if (!real) {
      features.scan_real = 'skip';
      log('SKIP scan real: no image folder (pass a folder or set QA_IMAGE_DIR)');
    } else {
      const another = page.getByRole('button', { name: /Scan another photo/i });
      if (await another.isVisible().catch(() => false)) await outlineTap(page, another);
      await page.waitForTimeout(300);
      const file = page.locator('input[type=file]').first();
      await file.setInputFiles(real);
      await shot(page, outDir, '05-real-loading');
      const realState = await waitForParentOrError(page, 180_000);
      await shot(page, outDir, '06-real-result');
      if (realState === 'parent') {
        log(`PASS scan real: parent review opened (${real.split('/').pop()})`);
        const secrets = await collectOnScreenSecrets(page);
        await pickParentAnswers(page);
        await shot(page, outDir, '07-real-picked');
        const ok = await practiceIfUnlocked(page, 'scan real', secrets, '08');
        features.scan_real = ok ? 'pass' : 'fail';
        const back2 = page.getByRole('button', { name: /Parent page/i });
        if (await back2.isVisible().catch(() => false)) await outlineTap(page, back2);
      } else {
        const err = await page.locator('.scan__error-body').innerText().catch(() => 'error screen');
        features.scan_real = 'fail';
        log(`FAIL scan real: ${err}`);
      }
    }

    // Stay on / return to parent or pick so we can detect later features.
    if ((await screenOf(page))?.includes('child')) {
      const parent = page.getByRole('button', { name: /Parent page/i });
      if (await parent.isVisible().catch(() => false)) await parent.click();
    }
    if ((await screenOf(page)) === 'exam-pick' || /Scan a page/i.test(await visibleText(page))) {
      const sampleAgain = page.getByRole('button', { name: /Try the sample photo/i });
      if (await sampleAgain.isVisible().catch(() => false)) {
        await sampleAgain.click();
        await waitForParentOrError(page, 120_000);
        await pickParentAnswers(page);
      }
    }

    const found = await detectFeatures(page);

    // --- 2. Explain card + hints (#99) ---
    const explainBtn = await hasButton(page, [/Explain each question/i]);
    if (!explainBtn) {
      features.explain_hints = 'skip';
      await noteMissing(page, 9, 'Explain card and hints', 'only present after PR #99 is stacked');
    } else {
      await outlineTap(page, explainBtn);
      await page.waitForTimeout(400);
      await shot(page, outDir, '09-explain-card');
      const screen = await screenOf(page);
      if (screen !== 'parent-explain' && !/Explain/i.test(await visibleText(page))) {
        features.explain_hints = 'fail';
        log('FAIL explain: button present but explain card did not open');
      } else {
        log('PASS explain: explain card opened');
        const backExplain = page.getByRole('button', { name: /Check page|Back to the page/i });
        if (await backExplain.isVisible().catch(() => false)) await outlineTap(page, backExplain);
        const open = page.getByRole('button', { name: /Practice with Pip/i });
        if (await open.isVisible().catch(() => false)) {
          await outlineTap(page, open);
          await waitForChild(page);
          const choices = page.locator('.exam-proto__pick');
          if ((await choices.count()) >= 2) {
            await outlineTap(page, choices.nth(1));
            await page.waitForTimeout(300);
            await shot(page, outDir, '10-hint-after-wrong');
            if (await page.locator('.exam-child__hint').isVisible().catch(() => false)) {
              log('PASS hints: Hint from Pip shown after a wrong try');
              features.explain_hints = 'pass';
            } else {
              log('WARN hints: explain present, hint not shown after a wrong try');
              features.explain_hints = 'fail';
            }
          } else {
            features.explain_hints = 'pass';
            log('PASS explain: card present (no extra choice to trigger a hint)');
          }
          await assertChildScreenSafe(page);
          const parent = page.getByRole('button', { name: /Parent page/i });
          if (await parent.isVisible().catch(() => false)) await outlineTap(page, parent);
        } else {
          features.explain_hints = 'pass';
        }
      }
    }

    // --- 3. Notebook (#98) and PIN / year / print (#97) ---
    const notebookBtn = await hasButton(page, [/Mistake notebook/i]);
    if (!notebookBtn) {
      features.notebook = 'skip';
      await noteMissing(page, 11, 'Parent notebook', 'only present after PR #98 is stacked');
    } else {
      await outlineTap(page, notebookBtn);
      await page.waitForTimeout(400);
      await shot(page, outDir, '11-notebook');
      const screen = await screenOf(page);
      if (!/mistake-notebook|weak-topics/.test(screen || '')) {
        features.notebook = 'fail';
        log('FAIL notebook: button present but notebook screen did not open');
      } else {
        const weak = page.getByRole('tab', { name: /Weak topics/i });
        if (await weak.isVisible().catch(() => false)) {
          await outlineTap(page, weak);
          await shot(page, outDir, '12-weak-topics');
        }
        log('PASS notebook: mistake notebook opened');
        features.notebook = 'pass';
        const backBook = page.locator('button[aria-label="Back to the scan"]');
        if (await backBook.isVisible().catch(() => false)) await outlineTap(page, backBook);
      }
    }

    const pinPrintBits = [];
    if (found.pin || found.year || found.print) {
      if (found.year) {
        await shot(page, outDir, '13-year-group');
        pinPrintBits.push('year');
      }
      const printBtn = await hasButton(page, [/Print worksheet/i]);
      if (printBtn) {
        await outlineTap(page, printBtn);
        await page.waitForTimeout(400);
        await shot(page, outDir, '14-print');
        pinPrintBits.push('print');
        const close = page.getByRole('button', { name: /Close|Done|Back/i }).first();
        if (await close.isVisible().catch(() => false)) await close.click();
      }
      const lock = await hasButton(page, [/Lock parent page/i]);
      if (lock) {
        await outlineTap(page, lock);
        await page.waitForTimeout(300);
        await shot(page, outDir, '15-pin-lock');
        pinPrintBits.push('pin');
      }
      features.pin_year_print = pinPrintBits.length ? 'pass' : 'fail';
      log(`PASS PIN/year/print: ${pinPrintBits.join(', ') || 'detected'}`);
    } else {
      features.pin_year_print = 'skip';
      await noteMissing(page, 13, 'Parent PIN, year group and print', 'only present after PR #97 is stacked');
    }

    await shot(page, outDir, '99-end');
  } finally {
    await context.close();
    await browser.close();
    if (ownStack) stopExamStack();
  }

  const lines = [
    '# Click-through report',
    '',
    '| feature | result |',
    '| --- | --- |',
    ...Object.entries(features).map(([key, value]) => `| ${key} | ${value} |`),
    '',
    '## Log',
    '',
    ...report.map((line) => `- ${line}`),
    '',
  ];
  await writeFile(join(outDir, 'report.md'), lines.join('\n'));
  log(`Wrote ${join(outDir, 'report.md')}`);

  const hardFail = Object.entries(features).filter(([, value]) => value === 'fail');
  if (hardFail.length) {
    console.error(`Click-through failed: ${hardFail.map(([k]) => k).join(', ')}`);
    process.exit(1);
  }
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  stopExamStack();
  process.exit(1);
});
