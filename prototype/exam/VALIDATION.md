# PR 96 completion checks

Checked on the Mac Mini on 2026-10-18, branch `compare/96-codex`.
Starting commit: `3b09509`. Changes are local commits, not a PR push or merge.

| Item | Commit |
| --- | --- |
| Source and license audit | `409d7e9` |
| Whole-token child guard | `0c59eec` |
| EXIF rotation | `fd124a6` |
| Parent-only parsed details | `2ebcda0` |
| Grouped AI chips and close icons | `7e71944` |
| Local Paddle adapter and batch CLI | `32be3ea` |
| Final checks and review fixes | This commit |

## Results

- `npm run test:exam`: passed, 3 TypeScript test scripts and 70 Python tests.
- `npx tsc -b`: passed.
- `npm run build`: passed.
- `git diff --check`: passed.
- Repeated the source comparison against Goppai commit
  `128445471c564a5ad3659819c1bdff7fcee98633`. Only two long FastAPI import
  lines match. See [LICENSE-NOTE.md](LICENSE-NOTE.md) for the full audit scope.
- Ran the module CLI with real Tesseract on `fixtures/exif-rotate-6.jpg`.
  It read the upright question and choices and wrote a CSV outside the checkout.
- PaddlePaddle installation has no matching Python 3.14 wheel here. The real CLI
  wrote an error row with the setup message. Real Paddle inference remains untested.

## Browser checks

Checked the sample in Chrome against isolated local servers. Notes went to `/tmp`.
The parent gate stayed locked until the final pick. Each question had one AI chip
row. All six chips for question 3 shared the same vertical position. The close
icon had a visible stroke and returned to the start screen.

Child practice showed the question and unmarked choices. A wrong pick showed only
“Almost. Try another word.” Parent answers, marks, explanations and AI notes were
absent from the child page.

## Diff review

Reviewed the full change against `3b09509`, including the source comparison,
parent schema, child projection, image path, UI, adapters and export paths.
The final review fixed these issues:

- Arial connects printed letters. The ink filter now counts those groups while
  retaining its baseline checks. The existing blue-print and handwriting tests pass.
- A word such as “is” can be ordinary text in another question. Answer checks use
  the matching question's text. An answer token in its own stem still fails.
- Duplicate child IDs could overwrite text during validation. Both guards reject them.
- Unicode combining marks now count as token characters in both guards.
- Saved practice prompts also run the child guard before the note is written.
- Default scan notes now use `Codex/Scans` in the local vault.

The batch application refuses repository output paths, including symlink paths.
Python can cache its entry module before the application starts. Use `python -B -m`
for zero bytecode writes. No paid API calls or new accounts were used.
