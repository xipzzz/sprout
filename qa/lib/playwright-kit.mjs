import { APP_URL, VIEWPORT } from './paths.mjs';
import { CHILD_SCREEN_BANNED } from './child-leak.mjs';

export { VIEWPORT };

export const FEATURE_BUTTONS = {
  explain: [/Explain each question/i, /Explain/i],
  notebook: [/Mistake notebook/i],
  print: [/Print worksheet/i, /Print with answer key/i, /Print this worksheet/i],
  year: [/Year group/i, /Which year is your child/i],
  pin: [/Set a parent PIN/i, /^Parent PIN$/i, /Lock parent page/i],
  hint: [/Hint from Pip/i],
};

export async function launchPhone(playwright, extras = {}) {
  const browser = await playwright.chromium.launch({
    headless: extras.headless !== false,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: extras.deviceScaleFactor ?? 2,
    recordVideo: extras.recordVideo,
    locale: 'en-GB',
  });
  const page = await context.newPage();
  page.setDefaultTimeout(extras.timeout ?? 45_000);
  return { browser, context, page };
}

export async function openExam(page, query = 'exam=1') {
  await page.goto(`${APP_URL}/?${query}`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.exam-proto, [data-screen]', { timeout: 30_000 });
}

export async function screenOf(page) {
  return page.locator('[data-screen]').first().getAttribute('data-screen');
}

export async function visibleText(page) {
  return page.locator('body').innerText();
}

export async function hasButton(page, names) {
  const list = Array.isArray(names) ? names : [names];
  for (const name of list) {
    const loc = page.getByRole('button', { name });
    if (await loc.first().isVisible().catch(() => false)) return loc.first();
  }
  return null;
}

export async function detectFeatures(page) {
  const text = await visibleText(page);
  const screen = (await screenOf(page)) || '';
  return {
    explain: Boolean(await hasButton(page, FEATURE_BUTTONS.explain)) || /Explain each question/i.test(text),
    notebook: Boolean(await hasButton(page, FEATURE_BUTTONS.notebook)) || /Mistake notebook/i.test(text),
    print: Boolean(await hasButton(page, FEATURE_BUTTONS.print)) || /Print worksheet|Print with answer key/i.test(text),
    year:
      Boolean(await hasButton(page, [/P1/, /P2/, /P3/, /P4/])) ||
      /Year group|Which year is your child in/i.test(text) ||
      screen.includes('year-group'),
    pin: /parent-gate/.test(screen) || /Set a parent PIN|Type the PIN again|Parent PIN/i.test(text),
    hint: Boolean(await page.locator('.exam-child__hint').first().isVisible().catch(() => false)),
    parentReview: screen === 'parent-review' || /Check the page/i.test(text),
    child: /child-practice|mistakes-round/.test(screen),
    pick: screen === 'exam-pick' || /Scan a page|Try the sample photo/i.test(text),
  };
}

export async function showTitleCard(page, { n, title, note = '' }, ms = 1600) {
  await page.evaluate(
    ({ n, title, note }) => {
      document.getElementById('qa-title')?.remove();
      const el = document.createElement('div');
      el.id = 'qa-title';
      el.setAttribute('data-qa', 'title-card');
      el.style.cssText = [
        'position:fixed',
        'inset:0',
        'z-index:2147483646',
        'background:#f6f3ea',
        'display:flex',
        'flex-direction:column',
        'justify-content:center',
        'padding:36px 28px',
        'font-family:Nunito,system-ui,sans-serif',
        'color:#243024',
      ].join(';');
      el.innerHTML = `
        <div style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#5a7a5a;font-weight:800">Section ${n}</div>
        <h1 style="font-size:26px;line-height:1.2;margin:10px 0 0;font-weight:900">${title}</h1>
        ${note ? `<p style="margin:14px 0 0;font-size:15px;line-height:1.4;color:#5c5348">${note}</p>` : ''}
      `;
      document.body.appendChild(el);
    },
    { n, title, note },
  );
  await page.waitForTimeout(ms);
}

export async function hideTitleCard(page) {
  await page.evaluate(() => document.getElementById('qa-title')?.remove());
}

export async function outlineElement(page, locator) {
  await locator.scrollIntoViewIfNeeded().catch(() => {});
  const box = await locator.boundingBox();
  if (!box) return;
  await page.evaluate((b) => {
    document.getElementById('qa-outline')?.remove();
    const el = document.createElement('div');
    el.id = 'qa-outline';
    el.setAttribute('data-qa', 'outline');
    Object.assign(el.style, {
      position: 'fixed',
      left: `${b.x - 4}px`,
      top: `${b.y - 4}px`,
      width: `${b.width + 8}px`,
      height: `${b.height + 8}px`,
      border: '3px solid #e11',
      borderRadius: '10px',
      boxShadow: '0 0 0 2px rgba(225,17,17,0.25)',
      pointerEvents: 'none',
      zIndex: '2147483647',
    });
    document.body.appendChild(el);
  }, box);
}

export async function clearOutline(page) {
  await page.evaluate(() => document.getElementById('qa-outline')?.remove());
}

export async function outlineTap(page, locator, { hold = 450 } = {}) {
  const target = typeof locator === 'string' ? page.locator(locator).first() : locator;
  await target.waitFor({ state: 'visible', timeout: 15_000 });
  await outlineElement(page, target);
  await page.waitForTimeout(hold);
  await target.click();
  await clearOutline(page);
}

export async function shot(page, dir, name) {
  const { mkdir } = await import('node:fs/promises');
  const { join } = await import('node:path');
  await mkdir(dir, { recursive: true });
  const file = join(dir, name.endsWith('.png') ? name : `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  return file;
}

export async function dismissPinIfPresent(page, pin = '1234') {
  const screen = (await screenOf(page)) || '';
  const text = await visibleText(page);
  if (!/parent-gate/.test(screen) && !/Set a parent PIN|Type the PIN again|Parent PIN/i.test(text)) {
    return { present: false };
  }
  async function typePin(digits) {
    for (const digit of digits) {
      const key = page.locator(`button.parent-gate__key[aria-label="${digit}"]`).first();
      if (await key.isVisible().catch(() => false)) await outlineTap(page, key, { hold: 220 });
      else await page.keyboard.press(digit);
      await page.waitForTimeout(80);
    }
  }
  if (/Set a parent PIN/i.test(text) || screen.includes('parent-gate-create')) {
    await typePin(pin);
    await page.waitForTimeout(400);
    await typePin(pin);
  } else if (/Parent PIN|Type your 4 numbers/i.test(text) || screen.includes('parent-gate-enter')) {
    await typePin(pin);
  }
  await page.waitForTimeout(400);
  const year = page.locator('.parent-year__card').first();
  if (await year.isVisible().catch(() => false)) await outlineTap(page, year, { hold: 250 });
  return { present: true };
}

/** Pick answers from whatever is on the parent review screen. Never hardcoded. */
export async function pickParentAnswers(page, { tap = outlineTap } = {}) {
  const cards = page.locator('article.exam-proto__card');
  const count = await cards.count();
  let picked = 0;
  let dropped = 0;
  let readAloud = 0;
  for (let i = 0; i < count; i += 1) {
    const card = cards.nth(i);
    await card.scrollIntoViewIfNeeded();
    const drop = card.getByRole('button', { name: /Drop this question/i });
    const alreadyDropped = (await card.getAttribute('data-review')) === 'dropped';
    const choices = card.locator('.exam-proto__answer-pick, [role="radio"]');
    const n = await choices.count();
    if (n > 0 && !alreadyDropped) {
      await tap(page, choices.first(), { hold: 280 });
      picked += 1;
    } else {
      const keep = card.getByRole('button', { name: /Keep as read-aloud/i });
      if (await keep.isVisible().catch(() => false)) {
        await tap(page, keep, { hold: 240 });
        readAloud += 1;
      } else if (await drop.isVisible().catch(() => false)) {
        await tap(page, drop, { hold: 240 });
        dropped += 1;
      }
    }
  }
  return { cards: count, picked, dropped, readAloud };
}

export async function collectOnScreenSecrets(page) {
  const choices = new Set(
    (await page.locator('.exam-proto__answer-pick, .exam-proto__pick').allInnerTexts())
      .map((t) => t.trim())
      .filter(Boolean),
  );
  const secrets = [];
  const explains = page.locator('.exam-proto__explain');
  const n = await explains.count();
  for (let i = 0; i < n; i += 1) {
    const text = (await explains.nth(i).innerText()).replace(/^For you\s*/i, '').trim();
    if (text && !/Pick the right answer and a short explanation/.test(text) && !choices.has(text)) {
      secrets.push(text);
    }
  }
  const facts = page.locator('.exam-proto__facts dd');
  const f = await facts.count();
  for (let i = 0; i < f; i += 1) {
    const text = (await facts.nth(i).innerText()).split('\n')[0].trim();
    if (text && !/^(Blank|None)$/i.test(text) && !choices.has(text) && text.length > 1) secrets.push(text);
  }
  return [...new Set(secrets)];
}

function isChildScreen(screen, text) {
  if (/child-practice|mistakes-round/.test(screen || '')) return true;
  return /^Practice$/m.test(text) && /of \d+/.test(text) && !/Check the page|Handwritten answer/i.test(text);
}

export async function assertChildScreenSafe(page, extraSecrets = []) {
  const screen = await screenOf(page);
  const text = await visibleText(page);
  if (!isChildScreen(screen, text)) {
    throw new Error(`Expected a child screen, got data-screen=${screen || '?'}`);
  }
  const leaks = [];
  for (const phrase of CHILD_SCREEN_BANNED) {
    if (text.includes(phrase)) leaks.push(phrase);
  }
  for (const secret of extraSecrets) {
    const trimmed = (secret || '').trim();
    if (trimmed.length < 4) continue;
    if (text.includes(trimmed)) leaks.push(trimmed.slice(0, 80));
  }
  if (leaks.length) {
    throw new Error(`Child screen showed answer text: ${leaks.join(' | ')}`);
  }
}

export async function waitForParentOrError(page, timeout = 180_000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const screen = await screenOf(page);
    const text = await visibleText(page);
    if (screen === 'parent-review' || /Check the page/i.test(text)) return 'parent';
    if (/Could not scan|not supported yet/i.test(text) && (await page.locator('.scan__error').isVisible().catch(() => false))) {
      return 'error';
    }
    await page.waitForTimeout(300);
  }
  throw new Error('Timed out waiting for parent review');
}

export async function waitForChild(page, timeout = 20_000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const screen = await screenOf(page);
    if (/child-practice|mistakes-round/.test(screen || '')) return screen;
    await page.waitForTimeout(200);
  }
  throw new Error('Timed out waiting for child practice');
}

export async function chooseFirstChildAnswer(page, { tap = outlineTap } = {}) {
  const choice = page.locator('.exam-proto__pick').first();
  if (await choice.isVisible().catch(() => false)) {
    await tap(page, choice, { hold: 300 });
    return 'choice';
  }
  const typed = page.locator('#exam-child-answer, #exam-round-answer');
  if (await typed.isVisible().catch(() => false)) {
    await typed.fill('1');
    const check = page.getByRole('button', { name: /^Check$/i });
    if (await check.isVisible().catch(() => false)) await tap(page, check, { hold: 250 });
    return 'typed';
  }
  return 'none';
}
