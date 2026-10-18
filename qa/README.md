# Sprout exam QA harness

Internal kit for the exam-scan prototype. It does **not** change app code. Run it on any exam branch — including after PRs #97 (PIN / year / print), #98 (mistake notebook) and #99 (explain card / hints) are stacked. Missing features are detected and skipped. They are never faked.

Photos, scan dumps, screenshots and videos stay out of git (`qa/data/` and `qa/out/`). Never commit real handwriting images or anything derived from them.

## What you get

| Command | What it does |
| --- | --- |
| `bash qa/run-qa.sh <image-folder>` | `npm run test:exam`, `npx tsc -b`, `npm run build`, then every image through the real `POST /api/extract` route |
| `node qa/clickthrough.mjs [image-folder]` | Headless Playwright at **390×844**. Clicks the three feature groups and screenshots each step |
| `node qa/record/record.mjs` then `bash qa/record/trim.sh` | Walkthrough recording kit: title cards, red tap outlines, runtime answer picks, local TTS, mp4 under 15 MB |

Outputs land in `qa/out/` (`results.csv`, `summary.md`, `clickthrough/`, `record/walkthrough.mp4`).

## One-time setup

From the repo root:

```bash
npm install
python3 -m venv prototype/exam/.venv
prototype/exam/.venv/bin/pip install -r prototype/exam/server/requirements.txt
npx playwright install chromium
```

Optional, but the photo scan is faster if a Tesseract binary is on `PATH` (the parent page uses the same server route; the browser Tesseract.js path still runs when the server has no binary):

```bash
# macOS
brew install tesseract tesseract-lang ffmpeg espeak

# Debian / Ubuntu
sudo apt-get install tesseract-ocr tesseract-ocr-eng tesseract-ocr-chi-sim ffmpeg espeak-ng
```

Playwright is installed with `npx` / `npm install` at the repo root. The harness does not add it to the app `package.json`.

## Photo scan

```bash
bash qa/run-qa.sh /path/to/worksheet-photos
```

On a Mac that is the whole command. The script:

1. Records pass/fail for `npm run test:exam`, `npx tsc -b` and `npm run build` (a failed check does not skip the photos).
2. Starts the exam API on `:8787` (or reuses one that is already healthy).
3. Posts every `jpg`/`png`/`webp` in the folder to `/api/extract` — the same route the parent page uses.
4. Follows the **Tesseract path**: if the server asks for OCR (`need_ocr`), the harness reads the **cleaned** JPEG with Tesseract.js (never the raw photo) and posts `ocr_text` back, matching `src/exam/api.ts`.
5. If `SPROUT_OCR=paddle` **and** `paddleocr` is importable, it runs a second engine pass the same way.
6. Writes `qa/out/results.csv` and `qa/out/summary.md`.

CSV columns: `file`, `engine`, `questions`, `choices`, `flags`, `leak`, `error`, `pass`.

**Pass rule:** at least one question, no child-payload leak, no crash. The leak check is the same shape as the app: child JSON may only contain `id`, `stem` and `choices`.

Paddle is off unless you ask for it:

```bash
SPROUT_OCR=paddle bash qa/run-qa.sh /path/to/photos
```

If `paddleocr` is missing, the summary says so and Tesseract still runs.

## Click-through

```bash
node qa/clickthrough.mjs /path/to/worksheet-photos
```

Viewport is 390×844. It:

1. **Goppai-style scan** — sample demo, then one real photo. Parent review, pick answers from what is on screen, child practice.
2. **Explain card + hints** — only after #99. If the “Explain each question” button is absent, it screenshots a **not in this build** card and skips.
3. **Notebook, PIN and print** — #98 and #97, same detection.

It **fails** if a child screen shows parent-only answer text (explanations, handwritten answers that are not also a printed choice, “Handwritten answer”, “For you”, “hidden from the child”, and so on).

Screenshots and `report.md` go to `qa/out/clickthrough/`.

Set `QA_REAL_PHOTO=/path/to/one.jpg` to pick the real photo yourself.

## Walkthrough recording

```bash
node qa/record/record.mjs
bash qa/record/trim.sh
```

Recipe:

- Playwright at 390×844, video on.
- A short title card before each section.
- A red outline around the control just before it is tapped.
- Answers are read off the screen. Nothing is hardcoded.
- `qa/out/record/sections.json` stores each section’s start time (and wait spans).
- Narration is one short plain-English line per section, spoken by **piper** (if `piper` and `PIPER_MODEL` are set) or **espeak-ng** / `espeak`. No API keys.
- `trim.sh` uses ffmpeg to speed up **only** long waits, burns in a `waiting, sped up` caption, muxes the wavs, and writes `qa/out/record/walkthrough.mp4` under 15 MB.

Sections:

1. Scan a worksheet (Goppai-style approach)
2. Parent review with flags
3. Explain card and hint
4. Mistake notebook and weak topics
5. Parent PIN, year group and print
6. Child practice (no answers shown)

A missing feature gets its own title card that says **not in this build**. The video does not invent UI.

## Running on another branch

```bash
git switch cursor/exam-scan-prototype-90ce   # or a branch with #97–#99 stacked
npm install                                  # if lockfile changed
bash qa/run-qa.sh ~/Desktop/real-hw
node qa/clickthrough.mjs ~/Desktop/real-hw
node qa/record/record.mjs && bash qa/record/trim.sh
```

The exam UI is `http://127.0.0.1:5173/?exam=1`. The click-through and recorder start Vite + the API themselves if they are not already up.

On a Mac, use the same bash commands. Homebrew names: `tesseract`, `ffmpeg`, `espeak`. `python3` from Xcode or python.org is enough for the venv.

## Layout

```
qa/
  run-qa.sh              # checks + photo scan
  clickthrough.mjs       # 390x844 feature walk
  README.md
  .gitignore             # data/ and out/
  lib/                   # shared scan client, leak check, Playwright kit
  record/
    record.mjs           # title cards, red outlines, sections.json, TTS
    trim.sh              # ffmpeg assemble
    assemble.py          # wait-speed + mux
    lines.json           # one narration line per section
```
