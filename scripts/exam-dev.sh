#!/usr/bin/env bash
# One command for the exam-scan prototype: local saver + Vite.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
VENV="$ROOT/prototype/exam/.venv"
if [[ ! -x "$VENV/bin/python" ]]; then
  python3 -m venv "$VENV"
  "$VENV/bin/pip" install -r "$ROOT/prototype/exam/server/requirements.txt"
fi
"$VENV/bin/uvicorn" app:app --app-dir "$ROOT/prototype/exam/server" --host 127.0.0.1 --port 8787 &
PID=$!
trap 'kill "$PID" 2>/dev/null || true' EXIT
npm run dev
