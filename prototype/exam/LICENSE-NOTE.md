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

Sprout's mapper reads only Sprout's own field names. It does not accept Goppai's output shape.

## Extraction attempt

Goppai's own extract endpoint was run on their sample `inputs/english1.png` (subject `english`). The call reached Zhipu **GLM-4.6V** and the API returned HTTP 429, error code 1113: insufficient balance or no resource package (`余额不足或无可用资源包,请充值。`). Sprout stays on free Tesseract. `ZHIPU_API_KEY` is optional and unused unless you set it. Nothing from that clone, including any `.env`, was copied into Sprout.

## Copy audit (done 2026-10-18)

The whole PR #96 branch was diffed against Goppai/exam at commit `1284454` (their `main`). The comparison covered code, prompts, regexes, CSS, constants, file structure and comments.

How it was checked:

- sha256 of every file on both sides: no identical files.
- Every line the branch adds, compared after whitespace folding with every line of theirs.
- Runs of 8 tokens shared between the branch's added text and any file of theirs.
- CSS: each new rule body and class name compared with their `App.css` and `index.css`. Of 77 new rules, none has an identical or near-identical body, and no class name is shared.
- Their prompts (`prompt_english.txt`, `prompt_math.txt`, `explain_english.txt`, `explain_math.txt`) were read by hand next to ours. Sprout's explanation is rule-based and has no prompt.

### Found and replaced

Line numbers are from the branch before the audit (`573c13b`).

| Where | What matched | Now |
| --- | --- | --- |
| `server/app.py` 1–76 | App skeleton: wildcard CORS block (12–17), global `@app.exception_handler(Exception)` (20–23), `@app.post("/api/extract")` / `extract_api` (42–43) | Rewritten. Routes sit on an `APIRouter`, errors are caught per route, and there is no CORS middleware because Vite proxies `/api`. The endpoint is `POST /api/read`. |
| `server/extract.py` 34–70 | The prompt's JSON skeleton followed their schema example: `paper_title`, `subject`, `questions`, then per question `sub_questions`, `student_marks`, `is_correct` | Rewritten as a plain field list in our own words and order. The file is now `server/scan_reader.py`, and `extract_scan` is `read_photo`. |
| Python, TS, fixture, note, tests | Field names from their schema: `paper_title`, `sub_questions`, `student_marks`, `is_correct` (also `types.ts` 13–17, 27–33, 47–52, 61) | Renamed to `sheet_title`, `parts`, `marks_awarded`, `marked_right`. The type `SubQuestion` is `QuestionPart`. |
| `server/schema.py` 14, 49–53, 61–206 | Mapper read their output shape: `options` dict, `student_answer.final`, `teacher_feedback.symbols` / `score` / `comment`, `steps`, `type`, plus Chinese type names from their prompt (选择题, 填空题, 完形填空, 改错, 问答题, 应用题) | Removed. The mapper reads only Sprout's field names. Parent-only keys come from one `PARENT_ONLY` tuple. |
| `server/test_child_view.py` 16–38, 44–47, 96 | Tests that fed their shape | Replaced with tests in Sprout's shape, plus a test that answer objects are not read as text. |
| `server/deskew.py` 12, 28–42 | Same recipe as their `utils/image.py` `compress_image`: `ImageOps.exif_transpose`, convert to RGB, longest-edge LANCZOS resize | Rewritten. One EXIF orientation table holds the parent label and the transpose. The resize floors the size so OCR stays stable. |
| `src/exam/api.ts` 7–50 | `extractExam(file, …)` and `/api/extract`, matching their `services/api.ts` | `readPhoto`, `postPhoto`, `/api/read`. |
| `src/exam/childView.ts` 12 | `teacher_feedback` in the child deny list | Removed, along with the matching Python entry. |
| `src/screens/ExamPrototypeScreen.tsx` 341–352 | The sample loader (fetch, `blob()`, `new File`) written out twice, the same pattern as their `handleSampleSelect` | One `samplePhoto()` helper in `api.ts`, which reads the bytes with `arrayBuffer` under the Vite base URL. |
| `server/requirements.txt` 1–8 | Version floors identical to their `backend/requirements.txt` | Floors are now the versions this prototype was tested on, grouped by use. |
| `server/extract.py` 297 | `timeout=120` on the vision call, same as theirs | 90 s. |

### Left as is, and why

- The Zhipu request body (`messages`, `role: user`, an `image_url` part with a `data:image/jpeg;base64,` URL, then a `text` part), the endpoint URL and the model id `glm-4.6v` are Zhipu's documented API, not Goppai's expression. Sprout calls it directly with `httpx`, not through their SDK client or retry loop.
- Library idioms: `Image.open(io.BytesIO(...))`, `json.loads` in `try` / `except json.JSONDecodeError`, `from fastapi.responses import JSONResponse`, `load_dotenv`, `if __name__ == "__main__":`, `<button type="button" className=…>`, `useState`.
- Generic words: `stem`, `choices`, `student_answer`, `explanation`, `subject`, `questions`, and the Chinese subject names in `subject_slug` (数学, 英语).
- Single CSS declarations such as `display: flex` and `color: var(--ink)`. `--ink` is Sprout's own token from before this PR.
- File layout differs. Theirs is `backend/app/{main,extract,explain}.py` with `utils/`, `services/` and `prompts/`, plus a layer-split React app. Sprout's is `prototype/exam/server/*.py` and one feature folder, `src/exam/`.

After the rewrite, the line and 8-token checks show only the items in "Left as is".
