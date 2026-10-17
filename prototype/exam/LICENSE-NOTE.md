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

Goppai's own `POST /api/extract` was run on their sample `inputs/english1.png` (subject `english`). The call reached Zhipu **GLM-4.6V** and the API returned HTTP 429, error code 1113: insufficient balance or no resource package (`余额不足或无可用资源包,请充值。`). Sprout stays on free Tesseract. `ZHIPU_API_KEY` is optional and unused unless you set it. Nothing from that clone, including any `.env`, was copied into Sprout.
