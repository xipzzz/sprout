#!/usr/bin/env bash
# Turn the raw Playwright recording into an mp4 under 15 MB.
# Speeds up only long waits (with a visible "waiting, sped up" caption)
# and muxes the local TTS narration.
#
#   bash qa/record/trim.sh [qa/out/record]
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
WORK="${1:-}"
if [[ -z "$WORK" ]]; then
  ROOT="$(cd "$HERE/../.." && pwd)"
  WORK="${QA_OUT:-$ROOT/qa/out}/record"
fi
if [[ ! -f "$WORK/sections.json" ]]; then
  echo "No $WORK/sections.json — run node qa/record/record.mjs first." >&2
  exit 2
fi
if ! command -v ffmpeg >/dev/null || ! command -v ffprobe >/dev/null; then
  echo "ffmpeg and ffprobe are required (brew install ffmpeg / apt install ffmpeg)." >&2
  exit 2
fi
python3 "$HERE/assemble.py" "$WORK"
