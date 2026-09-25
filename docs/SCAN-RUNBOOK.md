# Scan homework runbook

Photo or file → straighten the page → on-device OCR → draft questions → parent accepts at least 4 → Lock B play. Drafts come only from the OCR text. There is no canned question bank on this path.

## Step order

1. **Deskew.** `straightenHomeworkFile` (`src/lib/homeworkScan.ts`) turns the photo into a raster and calls `deskewRaster` (`src/lib/deskew.ts`). Four page corners are required. After the perspective warp, `flattenResidualBow` straightens a bowed top line. If the corners are missing, OCR does not run. The top band of the straightened page is read again so a recoverable first question is not dropped when the full-page read starts mid-sheet.
2. **OCR.** `readStraightenedSheet` runs Tesseract.js (`eng`) on the straightened image only.
3. **Draft parse.** `parseWorksheetOcr` (`src/lib/homeworkQuestions.ts`) builds numbered questions from that text. `restoreFillBlank` puts `_____` back when an underline was dropped or read as a dash, ellipsis, or spaced underscore. A bracket pair on the same line, `(rise, rises)` or `(rise / rises)` or `(find finds)`, is that line’s choices and becomes the blank. A number on its own line still starts the next sentence. The stem stops at the next numbered item, and a publisher footer (`©`, Educational Publishing House, Pte Ltd) is dropped.

## Question shapes

In: numbered lines with a paren or slash verb pair, labeled choices `(1) word`, and fill-blank have/has or possessives. Out for now: handwriting with no printed number, unnumbered prose, and multi-column matching. The parser stays generic by splitting on question numbers and reading choices from that line only — it does not keep a list of worksheet titles. Have/has agreement uses `correctHaveHasForSubject` (`src/lib/haveHasOcrRules.ts`). A printed answer key wins. Grammar sets `correct` only when that word is already one of the OCR choices.
4. **Parent gate.** `assessAcceptance` blocks garbage, blocks low confidence until a parent edits, and blocks a draft with no real correct choice. `canStartPractice` stays false until 4 accepted questions.
5. **Lock B play.** `ScanHomeworkScreen` passes accepted questions to `LessonScreenSoT` via `toPlayable`. Check → result sheet → Continue → 3–5 stars (`starsForAccuracy`).

## How to test

```bash
npx tsx src/lib/homeworkQuestions.test.ts
npx tsx src/lib/haveHasOcrRules.test.ts
npx tsx src/lib/deskew.test.ts
npx tsx src/lib/lessonStars.test.ts
npm run build
```

## When a scan looks wrong

- **Retake, page not straight.** Deskew returned no quad. The message asks for the whole page in frame. OCR must not see the tilted original.
- **No questions.** OCR text had no numbered items, or each item had fewer than two choices. Empty text yields no drafts.
- **Stem is missing a blank.** Add a case next to the others in `homeworkQuestions.test.ts` (dropped underline, `---`, `…`, `—`, `_`, `She____a`).
- **Wrong have/has or possessive.** Check the subject and whether the expected word is actually in `choices`. Missing words stay `correct: null`. Key lines (`1. have`, `1) have`) override the guess.
- **Accept stays disabled.** Garbage stem, low confidence without an edit, or no correct choice. A short cloze with a blank (`I _____ a dog.`) is not garbage. A vowel-free stem is.

## Known gaps

- First scan downloads `eng` traineddata from the Tesseract CDN. It is not bundled in the app.
- Low light, upside-down text, and handwriting are out of scope. One printed English sheet only.
