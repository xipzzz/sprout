# License note: Goppai/exam was not vendored

Checked 2026-10-17 by cloning https://github.com/Goppai/exam (default branch `main`).

The repository has **no LICENSE, COPYING, or NOTICE file**. The only license text is the README section:

> 本项目仅用于学习与比赛展示，如需商业化请联系作者。
>
> This project is only for learning and competition display. Contact the author for commercial use.

That is not a grant to copy or redistribute the code. Sprout therefore **does not vendor** Goppai's source, prompts, images, or model client. This prototype adapts the idea only:

- one photo in
- one JSON object per question
- fields for the printed stem, choices, the child's handwritten answer, and the teacher's mark
- a short parent-facing explanation

Field names in Sprout (`stem`, `choices`, `student_answer`, `teacher_mark`) match that idea. A small mapper also accepts the public output shape (`options`, `student_answer.final`, `teacher_feedback.symbols` / `score`) so a later live read can land in the same parent object.

## Extraction attempt

Goppai's own extract endpoint was run on their sample `inputs/english1.png` (subject `english`). The call reached Zhipu **GLM-4.6V** and the API returned HTTP 429, error code 1113: insufficient balance or no resource package (`余额不足或无可用资源包,请充值。`). Sprout stays on free Tesseract. `ZHIPU_API_KEY` is optional and unused unless you set it. Nothing from that clone, including any `.env`, was copied into Sprout.

## Code audit (2026-10-18)

Compared this branch (`git diff main...HEAD`) with Goppai/exam at commit `128445471c564a5ad3659819c1bdff7fcee98633` (25 Dec 2025). The clone sat in a temp folder outside the repo and was not added to Sprout.

Method:

1. Matched every changed text file against every Goppai file by whole normalized lines and by 12-token runs.
2. Matched string literals and Chinese phrases (3 or more Han characters).
3. Compared CSS class names, image hashes and sizes, regexes, constants, prompts and comments by hand.

Found and rewritten:

| Where | What matched | Fix |
| --- | --- | --- |
| `server/test_child_view.py` | Test stem fragment `客厅面积有____平方米`, answer `30, 15` and score `2分`, taken from Goppai's `outputs/456.json` | Replaced with Sprout's own sample (`小明有____支红笔和____支蓝笔`, `6 和 9`, `× 1分`) |
| `server/extract.py` `PROMPT` | Own English wording, but it laid out a JSON skeleton in the same order as Goppai's prompt schema | Rewritten as a plain field list in Sprout's words |
| `server/app.py`, `src/exam/api.ts` | Same route and function names: `POST /api/extract`, `extract_api`, `extractExam` | Renamed to `POST /api/scan`, `scan_photo`, `scanPage` |

Checked and kept, with the reason:

- JSON field names (`paper_title`, `stem`, `options`, `student_answer.final`, `teacher_feedback.symbols`, `score`). These are interface facts, not expression. `schema.py` reads them so a Goppai-shaped reply maps into Sprout.
- FastAPI CORS setup, `JSONResponse` error handler, the Vite proxy and `// https://vite.dev/config/`. These are framework template lines that Goppai also copied from the FastAPI and Vite docs.
- The Zhipu chat message shape (`role`, `content`, `image_url`). This is the vendor API format. Sprout calls it with `httpx` in its own function. Goppai uses the `zai` SDK.
- EXIF orientation. Goppai calls `ImageOps.exif_transpose` in `utils/image.py`. Sprout had no EXIF step at audit time. The later fix in `deskew.py` (`UPRIGHT_STEPS`, `upright`) is Sprout's own table of the 8 EXIF cases.
- CSS. No branch class name matches a Goppai class name. The only shared lines are single generic declarations such as `align-items: center;`.
- Images. `public/sample-exam-english.png` is drawn by `make_sample.py`. The synthetic pages come from `synthetic_pages.py`. `01-local-worksheet1.jpg` is a local SG worksheet. No hash or size matches Goppai's `inputs/`.
- Regexes, constants, comments. Goppai has no parsing regexes. Its comments are Chinese and none appear in Sprout. Deskew, ink lift, the worksheet parser and the child view check have no Goppai counterpart.

Result: after the fixes above, no Goppai code, prompt, regex, CSS, constant, comment or data is in this branch.
