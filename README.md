# 🌱 Sprout

A **calm**, kid-friendly way to learn **English** — a Duolingo-style path, deliberately
free of pressure. No red, no streak-guilt, no demotion. A wrong answer is just *warm clay*
to reshape. You grow a little garden as you learn, guided by **Pip**, a friendly sprout.

**Live:** https://xipzzz.github.io/sprout/ · **Stack:** Vite + React 19 + TypeScript + plain CSS.

---

## Run it locally

```bash
npm install        # once
npm run dev        # dev server → http://localhost:5173  (also on your phone via LAN/Tailscale)
npm run build      # production build → dist/
npm run preview    # preview the production build
npx tsc -b         # type-check
```

The dev server listens on all interfaces, so a phone on the same network (or Tailscale)
can open it too — handy for on-device review.

## How it's organized

```
src/
  App.tsx              # the router: tabs + full-screen overlays (a small state machine)
  main.tsx             # entry; mounts <App/> + the QA flag
  screens/             # one file per screen (Home, Lesson, Garden, Words, Grove, Me, …)
  components/          # reusable pieces (HUD, WindingPath, MultipleChoice, Pip, TabBar, …)
  data/course.ts       # ALL course content + types (the single source of content truth)
  state/progress.ts    # localStorage progress (which units are done)
  styles/
    tokens.css         # design tokens — colors, spacing, radii, type scale (calm palette)
    app.css            # every component/screen style, reading from the tokens
```

## How content works (`src/data/course.ts`)

- The course is **5 sections × 7–8 units** (38 units), all authored in English.
- Each lesson is a list of **exercises** — a discriminated union by `kind`:
  `choice` (tap the picture) · `arrange` (build a sentence, drag to reorder) ·
  `match` (word ↔ picture, optional audio) · `fill` (type the word) ·
  `listen` (type/tap what you hear, via the browser's speech).
- Two builders keep it terse: **`vocabLesson()`** (picture units) and
  **`sentenceLesson()`** (grammar units). `getLesson(unitId)` returns a unit's lesson,
  falling back to a gentle review so every tap is always playable.
- The **Words** tab vocabulary is derived automatically from the authored lessons.

## Review tool — the QA flag

Add `?qa=1` to the URL once (it persists) to show a floating 🚩 button on every screen.
Tap it to capture the **current screen name + a note** and copy a tidy report to the
clipboard (or capture an image to share). Turn it off with `?qa=0`. Hidden for learners.

## Deploy

Every merge to `main` auto-deploys to **GitHub Pages** via
`.github/workflows/deploy.yml` (build → Pages, ~1 min). The production `base` is
`/sprout/` (see `vite.config.ts`); dev stays at `/`.

GitHub Pages cannot run the homework reader. That is a separate Cloudflare Worker
in [`server/`](server/). The Pages build only bakes in the Worker URL:

```bash
# repository variables (Settings → Secrets and variables → Actions → Variables)
VITE_SCAN_WORKER_URL          # https://sprout-scan.<account>.workers.dev
VITE_SCAN_GOOGLE_CLIENT_ID    # Google OAuth client id (public). Empty until sign-in is connected.
```

If `VITE_SCAN_WORKER_URL` is empty, Scan homework shows **Scanning isn’t set up yet**
and does not invent questions.

## Scan homework

A parent photographs a real English worksheet. The phone straightens the page in
the browser (opencv.js), the Worker reads the printed questions, and the parent
confirms every answer before the child plays a Lock B quiz. Photos are not stored.
There is no sample worksheet on this path.

### Hosting and cost

The Worker is meant for the **Cloudflare Workers free plan**. It does not store
photos and it does not log image bytes. Counters (daily scans, monthly spend) live
in **Workers KV**, which is on the free plan. KV is eventually consistent, so two
taps at the same moment can slightly overshoot a limit.

The **vision API key and the per-scan cost are billed to the owner's own provider
account** (OpenAI, Anthropic, or xAI), not to Cloudflare. Each accepted page is
one scan and **two billed calls** (read the page, then suggest answers). The
Worker reserves that full amount once, before either call. Set
`COST_PER_SCAN_USD` to the sum from the provider's **current price page**.
There is no default. If it is unset, scans are refused. The monthly cap defaults
to **$5** (`MONTHLY_SPEND_CAP_USD`). The daily limit defaults to **20** per
signed-in parent (`DAILY_SCAN_LIMIT`).

Only **`gpt-6-astra`** on OpenAI was measured (98.3% on the holdout). It is the
OpenAI default. Any other provider or `MODEL` needs the holdout rerun with the
real paid key before approval.

The first scan downloads the on-phone page cleaner and shows that it is loading.
If that cleaner fails, the photo is sent as taken.

**Also set a hard budget or usage limit in the AI provider's dashboard.** That is
the backstop if KV is briefly stale or the estimate is low. When the cap is hit,
the app shows **Scanning is paused** and does not call the model.

### What the owner does once

1. Create a free Cloudflare account.
2. `cd server && npm install && npx wrangler login`
3. Set the provider with one variable in `wrangler.toml`: `PROVIDER` =
   `openai`, `anthropic`, or `xai`. `mock` is rejected.
4. `MODEL` overrides any adapter. OpenAI defaults to **`gpt-6-astra`**, the only
   model measured on the holdout (98.3%). Anthropic and xAI have **no default**
   and will not start until `MODEL` is set. Any other provider or model needs
   the holdout rerun with the real paid key before it is approved.
6. Secrets, not files:
   ```bash
   npx wrangler secret put VISION_API_KEY
   npx wrangler secret put GOOGLE_CLIENT_ID
   npx wrangler secret put ALLOWED_EMAILS   # comma-separated parent emails
   npx wrangler secret put COST_PER_SCAN_USD # both calls, from the price page
   ```
7. `npx wrangler kv namespace create SCAN_LIMITS` and paste the id into
   `server/wrangler.toml`. Deploy and `wrangler dev` stop if that id is still
   the placeholder.
8. `npx wrangler deploy`
9. Put the Worker URL in `VITE_SCAN_WORKER_URL` and the same Google client id in
   `VITE_SCAN_GOOGLE_CLIENT_ID`, then redeploy GitHub Pages.
10. Set the provider dashboard budget.

Switching provider later is the same `PROVIDER` variable plus a `VISION_API_KEY`
for that provider, then `npx wrangler deploy`. One variable selects the adapter.
The key never ships in the client.

### Sign-in

Sprout has **no server-verifiable account**. Progress is `localStorage` on the
device. The old account screen (removed for kids-only mode) was a local
"Save my garden" button with no token and no backend. A shared secret or a token
made in the browser would be forgeable by anyone who can see the public Worker
URL, so this app does not add one.

Until `GOOGLE_CLIENT_ID`, `ALLOWED_EMAILS`, and `VITE_SCAN_GOOGLE_CLIENT_ID` are
set, every scan returns **401** and the app says scanning needs a parent sign-in.
The smallest real option, already wired, is **Google sign-in**: the parent gets
a Google-signed ID token, and the Worker checks the signature against Google's
public keys, the audience, and the email allow-list. The daily limit is counted
on that email. The client id is public; the allow-list is the lock.

### Tests

```bash
npm test
```

Schema validation, the error path (no made-up questions), quiz mapping for all
four types, the parent edit/delete/confirm flow, unauthenticated requests, and
the daily and monthly limits. The mock vision adapter is imported only by tests.
`PROVIDER=mock` cannot be deployed.

## Design fidelity

The visual source of truth is **`design/Sprout-Viewer.html`** (a React/JSX design
prototype). **`design/DESIGN-NOTES.md`** tracks the palette match, the 66-screen
inventory with build status, the design's intent log, and the remaining divergence
backlog.

## Calm principles (please keep these)

- **Light mode only**, no red, no streak-guilt, no demotion — wrong = warm clay.
- **English only** content.
- Small, reusable components; **content as data** in `course.ts`.
- Ship each change as its own **branch → PR → squash-merge** to `main`.
