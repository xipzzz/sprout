#!/usr/bin/env bash
# Sprout exam QA: unit/type/build checks, then every photo through the real
# /api/extract route (Tesseract path; Paddle too when SPROUT_OCR=paddle).
#
#   bash qa/run-qa.sh <image-folder>
#
# Writes qa/out/results.csv and qa/out/summary.md. Photos and outputs stay
# out of git (see qa/.gitignore).
set -u

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
QA="$ROOT/qa"
OUT="${QA_OUT:-$QA/out}"
IMAGE_DIR="${1:-${QA_IMAGE_DIR:-}}"
cd "$ROOT"

mkdir -p "$OUT"
PASS_LOG="$OUT/checks.log"
: > "$PASS_LOG"

note() { printf '%s\n' "$*" | tee -a "$PASS_LOG"; }

if [[ ! -d node_modules ]]; then
  note "npm install (first run)"
  npm install
fi

VENV="$ROOT/prototype/exam/.venv"
if [[ ! -x "$VENV/bin/python" ]]; then
  note "creating exam virtualenv"
  python3 -m venv "$VENV"
  "$VENV/bin/pip" install -r "$ROOT/prototype/exam/server/requirements.txt"
fi

run_check() {
  local name="$1"
  shift
  note ""
  note "## $name"
  if "$@" >>"$PASS_LOG" 2>&1; then
    note "RESULT $name: pass"
    return 0
  fi
  note "RESULT $name: fail"
  return 1
}

TEST_EXAM=fail
TSC=fail
BUILD=fail
run_check "npm run test:exam" npm run test:exam && TEST_EXAM=pass
run_check "npx tsc -b" npx tsc -b && TSC=pass
run_check "npm run build" npm run build && BUILD=pass

API_PORT="${SPROUT_API_PORT:-8787}"
started_api=0
API_PID=""
if curl -sf "http://127.0.0.1:${API_PORT}/api/health" >/dev/null 2>&1; then
  note "reusing exam API on :$API_PORT"
else
  note "starting exam API on :$API_PORT"
  "$VENV/bin/python" -m uvicorn app:app \
    --app-dir "$ROOT/prototype/exam/server" \
    --host 127.0.0.1 --port "$API_PORT" >>"$OUT/api.log" 2>&1 &
  API_PID=$!
  started_api=1
  trap 'if [[ "${started_api:-0}" = 1 ]]; then kill "$API_PID" 2>/dev/null || true; fi' EXIT
  for _ in $(seq 1 50); do
    if curl -sf "http://127.0.0.1:${API_PORT}/api/health" >/dev/null 2>&1; then
      break
    fi
    sleep 0.2
  done
  if ! curl -sf "http://127.0.0.1:${API_PORT}/api/health" >/dev/null 2>&1; then
    note "RESULT exam-api: fail (did not become healthy)"
    echo "Could not start the exam API. See $OUT/api.log" >&2
    exit 1
  fi
fi

SCAN_STATUS=skip
SCAN_NOTE="no image folder given"
if [[ -n "$IMAGE_DIR" ]]; then
  if [[ ! -d "$IMAGE_DIR" ]]; then
    echo "Image folder not found: $IMAGE_DIR" >&2
    exit 2
  fi
  note ""
  note "## scan folder $IMAGE_DIR"
  if QA_OUT="$OUT" node "$QA/lib/run-scans.mjs" "$IMAGE_DIR" >>"$PASS_LOG" 2>&1; then
    SCAN_STATUS=pass
    SCAN_NOTE="wrote $OUT/results.csv"
  else
    SCAN_STATUS=fail
    SCAN_NOTE="scan runner failed; see $OUT/checks.log"
  fi
  note "RESULT scan-folder: $SCAN_STATUS"
else
  note "RESULT scan-folder: skip (pass an image folder: bash qa/run-qa.sh <folder>)"
fi

BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo unknown)"
SHA="$(git rev-parse --short HEAD 2>/dev/null || echo unknown)"
DATE="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
PADDLE_NOTE="skipped (set SPROUT_OCR=paddle and install paddleocr to add a second engine)"
if [[ "${SPROUT_OCR:-}" == "paddle" ]]; then
  if python3 -c "import paddleocr" >/dev/null 2>&1; then
    PADDLE_NOTE="enabled (SPROUT_OCR=paddle)"
  else
    PADDLE_NOTE="requested (SPROUT_OCR=paddle) but paddleocr is not importable"
  fi
fi

export QA_SUMMARY_OUT="$OUT"
export QA_SUMMARY_BRANCH="$BRANCH"
export QA_SUMMARY_SHA="$SHA"
export QA_SUMMARY_DATE="$DATE"
export QA_SUMMARY_IMAGES="${IMAGE_DIR:-none}"
export QA_SUMMARY_PADDLE="$PADDLE_NOTE"
export QA_SUMMARY_TEST="$TEST_EXAM"
export QA_SUMMARY_TSC="$TSC"
export QA_SUMMARY_BUILD="$BUILD"
export QA_SUMMARY_SCAN="$SCAN_STATUS"
export QA_SUMMARY_NOTE="$SCAN_NOTE"
node "$QA/lib/write-summary.mjs"

echo
echo "Wrote $OUT/summary.md"
[[ -f "$OUT/results.csv" ]] && echo "Wrote $OUT/results.csv"
echo "Checks: test:exam=$TEST_EXAM tsc=$TSC build=$BUILD scan=$SCAN_STATUS"
