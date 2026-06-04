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
