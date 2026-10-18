#!/usr/bin/env python3
"""Build the ffmpeg command that speeds long waits and muxes narration."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path


SPEED_AFTER = 2.5
SPEED = 4.0
MAX_BYTES = 15 * 1024 * 1024
CAPTION = "waiting, sped up"


def ffprobe_duration(path: Path) -> float:
    out = subprocess.check_output(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            str(path),
        ],
        text=True,
    ).strip()
    return float(out)


def find_font() -> str:
    for candidate in (
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/Library/Fonts/Arial.ttf",
    ):
        if Path(candidate).exists():
            return candidate
    return ""


def remap(original: float, waits: list[dict], speed: float) -> float:
    shifted = 0.0
    cursor = 0.0
    for wait in waits:
        start, end = wait["start"], wait["end"]
        if original <= start:
            return shifted + (original - cursor)
        shifted += start - cursor
        duration = end - start
        if original < end:
            return shifted + (original - start) / speed
        shifted += duration / speed
        cursor = end
    return shifted + (original - cursor)


def main() -> int:
    work = Path(sys.argv[1] if len(sys.argv) > 1 else ".")
    meta = json.loads((work / "sections.json").read_text())
    raw = work / meta.get("rawVideo", "raw.webm")
    if not raw.exists():
        print(f"missing {raw}", file=sys.stderr)
        return 2
    duration = ffprobe_duration(raw)
    waits = [
        w
        for w in meta.get("waits", [])
        if w["end"] - w["start"] >= SPEED_AFTER and w["start"] < duration
    ]
    waits = sorted(waits, key=lambda w: w["start"])
    font = find_font()
    font_opt = f":fontfile='{font}'" if font else ""

    # Build [normal][wait][normal]… segments.
    cuts = [0.0]
    for wait in waits:
        cuts.extend([wait["start"], wait["end"]])
    cuts.append(duration)
    # unique, in range
    points = []
    for t in cuts:
        t = max(0.0, min(duration, t))
        if not points or t - points[-1] > 0.01:
            points.append(t)

    filters = []
    concat_v = []
    concat_a = []
    idx = 0
    for a, b in zip(points, points[1:]):
        is_wait = any(abs(a - w["start"]) < 0.05 and abs(b - w["end"]) < 0.05 for w in waits)
        vf = f"[0:v]trim=start={a:.3f}:end={b:.3f},setpts=PTS-STARTPTS"
        af = f"[0:a]atrim=start={a:.3f}:end={b:.3f},asetpts=PTS-STARTPTS"
        if is_wait:
            vf += f",setpts=PTS/{SPEED}"
            af += f",atempo={SPEED}"
            vf += (
                f",drawtext=text='{CAPTION}':fontsize=22:fontcolor=white"
                f":box=1:boxcolor=black@0.55:x=(w-text_w)/2:y=h-72{font_opt}"
            )
        vf += f"[v{idx}]"
        af += f"[a{idx}]"
        filters.append(vf)
        filters.append(af)
        concat_v.append(f"[v{idx}]")
        concat_a.append(f"[a{idx}]")
        idx += 1

    n = idx
    if n == 0:
        print("empty video", file=sys.stderr)
        return 2
    filters.append(f"{''.join(concat_v)}concat=n={n}:v=1:a=0[vout]")
    filters.append(f"{''.join(concat_a)}concat=n={n}:v=0:a=1[a0]")

    # Some webm recordings have no audio track. Use anullsrc if needed.
    has_audio = True
    try:
        streams = subprocess.check_output(
            [
                "ffprobe",
                "-v",
                "error",
                "-select_streams",
                "a",
                "-show_entries",
                "stream=index",
                "-of",
                "csv=p=0",
                str(raw),
            ],
            text=True,
        ).strip()
        has_audio = bool(streams)
    except subprocess.CalledProcessError:
        has_audio = False

    if not has_audio:
        filters = [
            f"[0:v]trim=start={a:.3f}:end={b:.3f},setpts=PTS-STARTPTS"
            + (
                f",setpts=PTS/{SPEED},drawtext=text='{CAPTION}':fontsize=22:fontcolor=white"
                f":box=1:boxcolor=black@0.55:x=(w-text_w)/2:y=h-72{font_opt}"
                if any(abs(a - w["start"]) < 0.05 and abs(b - w["end"]) < 0.05 for w in waits)
                else ""
            )
            + f"[v{i}]"
            for i, (a, b) in enumerate(zip(points, points[1:]))
        ]
        n = len(points) - 1
        filters.append(f"{''.join(f'[v{i}]' for i in range(n))}concat=n={n}:v=1:a=0[vout]")
        new_dur = remap(duration, waits, SPEED) if waits else duration
        filters.append(f"anullsrc=channel_layout=stereo:sample_rate=44100,atrim=duration={new_dur:.3f}[a0]")

    inputs = ["-i", str(raw)]
    voice_labels = []
    for i, section in enumerate(meta.get("sections", [])):
        wav = work / section["wav"]
        if not wav.exists():
            continue
        inputs += ["-i", str(wav)]
        delay_ms = int(max(0, remap(section["start"], waits, SPEED) * 1000))
        voice_labels.append((i + 1, delay_ms))

    mix_parts = ["[a0]"]
    for input_index, delay_ms in voice_labels:
        filters.append(f"[{input_index}:a]adelay={delay_ms}|{delay_ms},volume=1.15[n{input_index}]")
        mix_parts.append(f"[n{input_index}]")
    if len(mix_parts) == 1:
        filters.append("[a0]anull[aout]")
    else:
        filters.append(
            f"{''.join(mix_parts)}amix=inputs={len(mix_parts)}:normalize=0:dropout_transition=0[aout]"
        )

    graph = ";\n".join(filters)
    graph_path = work / "filter.ff"
    graph_path.write_text(graph)
    out_mp4 = work / "walkthrough.mp4"

    def encode(crf: int, audio_k: int) -> None:
        cmd = [
            "ffmpeg",
            "-y",
            "-hide_banner",
            "-loglevel",
            "error",
            *inputs,
            "-filter_complex_script",
            str(graph_path),
            "-map",
            "[vout]",
            "-map",
            "[aout]",
            "-c:v",
            "libx264",
            "-preset",
            "veryfast",
            "-crf",
            str(crf),
            "-pix_fmt",
            "yuv420p",
            "-c:a",
            "aac",
            "-b:a",
            f"{audio_k}k",
            "-movflags",
            "+faststart",
            str(out_mp4),
        ]
        subprocess.check_call(cmd)

    encode(28, 80)
    if out_mp4.stat().st_size > MAX_BYTES:
        encode(32, 64)
    if out_mp4.stat().st_size > MAX_BYTES:
        encode(35, 48)

    new_sections = []
    for section in meta.get("sections", []):
        item = dict(section)
        item["start_trimmed"] = round(remap(section["start"], waits, SPEED), 3)
        new_sections.append(item)
    meta["sections_trimmed"] = new_sections
    meta["waits_sped"] = waits
    meta["speed"] = SPEED
    (work / "sections.json").write_text(json.dumps(meta, indent=2))
    print(out_mp4)
    print(f"bytes={out_mp4.stat().st_size}")
    print(f"duration={ffprobe_duration(out_mp4):.2f}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
