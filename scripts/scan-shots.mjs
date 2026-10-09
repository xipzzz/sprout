import { chromium } from 'playwright-core';
import path from 'node:path';

const outDir = path.resolve('screenshots/scan-flow');
const browser = await chromium.launch({
  executablePath: '/usr/local/bin/google-chrome',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });

async function go(which) {
  await page.goto(`http://127.0.0.1:5173/?scanShot=${which}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForSelector('[data-scan-shot-ready]', { timeout: 20000 });
  await page.evaluate(() => document.fonts?.ready);
}

async function settle() {
  await page.evaluate(() => Promise.all(
    document.getAnimations()
      .filter((anim) => anim.effect?.getComputedTiming?.().iterations !== Infinity)
      .map((anim) => anim.finished.catch(() => undefined)),
  ));
  await page.waitForTimeout(350);
}

async function save(name) {
  await settle();
  await page.screenshot({ path: path.join(outDir, name) });
  console.log(name);
}

async function mark(selector) {
  await page.locator(selector).first().evaluate((el) => el.classList.add('scan-shot-mark'));
}

await go('check');
await save('check.png');
await go('error');
await save('error.png');
await go('loading');
await save('loading.png');

await go('fill');
await save('quiz-fill-blank.png');
await page.getByRole('button', { name: 'opens', exact: true }).click();
await mark('.lesson__bubble');
await save('quiz-fill-selected.png');
await page.getByRole('button', { name: 'Check' }).click();
await page.waitForSelector('.lesson__sheet--correct');
await mark('.lesson__sheet');
await save('quiz-correct.png');

await go('choice');
await save('quiz-multiple-choice.png');
await page.getByRole('button', { name: 'box', exact: true }).click();
await mark('.word-pick__answer--selected');
await save('quiz-selected.png');

await go('choice');
await page.getByRole('button', { name: 'circle', exact: true }).click();
await page.getByRole('button', { name: 'Check' }).click();
await page.waitForSelector('text=Got it');
await mark('.lesson__sheet');
await save('quiz-wrong.png');

await go('almost');
await page.locator('.scanq__type input').fill('opns');
await page.getByRole('button', { name: 'Check' }).click();
await page.waitForSelector('text=Almost!');
await mark('.lesson__sheet');
await save('quiz-almost.png');

await go('match');
await save('quiz-matching.png');
await page.getByRole('button', { name: 'fox', exact: true }).click();
await page.getByRole('button', { name: 'runs', exact: true }).click();
await mark('.scanq__pairs');
await save('quiz-matching-halfway.png');

await go('rewrite');
await save('quiz-rewrite.png');
for (const word of ['the', 'fox', 'is', 'quick', 'and', 'quiet']) {
  await page.getByRole('button', { name: word, exact: true }).click();
}
await mark('.arrange__build');
await save('quiz-rewrite-filled.png');

await go('check-tools');
await page.getByRole('button', { name: 'Remove' }).first().click();
await page.waitForSelector('.undo-toast');
await page.evaluate(() => {
  document.querySelectorAll('.review-add, .undo-toast').forEach((el) => el.classList.add('scan-shot-mark'));
});
await save('check-actions.png');

await go('finish');
await save('quiz-finish.png');

await go('parent-check');
await mark('.review-photo');
await save('parent-check.png');
await page.locator('.review-photo').click();
await page.waitForSelector('.page-viewer');
await mark('.page-viewer__sheet');
await save('parent-check-full-page.png');

await go('word-order');
await mark('.word-order');
await save('parent-check-word-order.png');

await go('check');
await page.getByRole('button', { name: 'See on page' }).first().click();
await page.waitForSelector('.page-viewer');
await save('page-viewer.png');

await browser.close();
