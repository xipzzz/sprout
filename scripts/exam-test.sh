#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
node --experimental-strip-types src/exam/childView.test.ts
VENV="$ROOT/prototype/exam/.venv"
if [[ ! -x "$VENV/bin/python" ]]; then
  python3 -m venv "$VENV"
  "$VENV/bin/pip" install -r "$ROOT/prototype/exam/server/requirements.txt"
fi
"$VENV/bin/python" -m unittest discover -s prototype/exam/server -p 'test_*.py'
