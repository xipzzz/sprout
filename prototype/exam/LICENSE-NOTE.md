# Source comparison: Goppai/exam

Audit date: 2026-10-18. Sprout baseline: `3b09509` on `compare/96-codex`.
Reference: https://github.com/Goppai/exam, `main` at
`128445471c564a5ad3659819c1bdff7fcee98633`.

The reference has no LICENSE, COPYING or NOTICE file. Its README limits use to
learning and competition display and asks commercial users to contact its author.
Sprout treats this as unavailable for copying. No reference code, prompts, CSS,
comments or assets may be imported into Sprout.

## Scope and method

Compared all reference backend and frontend source, four prompt files, output
examples and image assets with `prototype/exam/`, `src/exam/`, `src/screens/Exam*`,
`src/styles/app.css` and `public/sample-exam-english.png`. Read the implementations
side by side. Checked exact source lines, normalized 20-token windows and file
hashes. The reference clone stayed outside this repository and was never executed.

Reproduce the exact-line and file-hash checks after cloning that reference commit:

```bash
python3 prototype/exam/audit_source.py /path/to/reference-clone
```

The script is a review aid. It cannot establish originality or detect all
paraphrases. The result below includes manual comparison.

## Findings and changes

- Replaced a close paraphrase of the room-area question in reference
  `outputs/456*.json`. Sprout's schema test now uses an original flower-count
  question. Only the test inputs changed.
- No copied implementation or close prompt paraphrase was found in the remaining
  scope. Sprout uses its own worksheet text parser, page warp, ink processing,
  local explanation rules, review gate and child payload builder. The reference
  uses model prompts and Ant Design question cards.
- No matching regex, CSS block, substantive comment or application-specific
  constant table was found. Model names, the provider endpoint and API field
  names are protocol identifiers. Nested field aliases remain for interoperability.
- Shared source fragments are FastAPI imports and CORS setup, standard JSON HTTP
  requests and the model provider's message envelope. They do not contain the
  reference's extraction, caching, retry or explanation logic.
- No byte-identical image or fixture asset was found. Sprout's sample page and
  synthetic worksheets have local drawing scripts and different question content.

This review covers the named reference commit and current source. It does not
certify earlier Git history or unknown sources. The removed test text remains in
prior commits; this change does not rewrite history. Keep future work independent.
