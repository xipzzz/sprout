"""Photo to parent scan.

Default read is free Tesseract. No API key.
Zhipu GLM-4.6V is optional, and runs only when ZHIPU_API_KEY is set
(env, .env, or macOS Keychain). The sample photo uses the labeled stub.
"""

from __future__ import annotations

import base64
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

import httpx
from dotenv import load_dotenv

from deskew import prepare_page
from schema import map_question, subject_slug
from worksheet_text import parse_worksheet_text

REPO_ROOT = Path(__file__).resolve().parents[3]
FIXTURE_PATH = REPO_ROOT / "src" / "exam" / "fixture.json"
ZHIPU_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions"

PROMPT = """You turn one photo of a school worksheet into JSON.
Return only JSON, no markdown, with this shape:
{
  "paper_title": "",
  "subject": "english or math",
  "questions": [
    {
      "id": "1",
      "stem": "printed question with handwriting left out of the sentence",
      "choices": ["printed choice"],
      "student_answer": "what the child wrote, or empty",
      "teacher_mark": "the teacher's check, cross, or score, or empty",
      "correct_answer": "the answer to use for practice",
      "explanation": "one or two plain sentences a parent can read",
      "flags": [
        {"field": "stem", "kind": "reconstructed", "note": "why this was guessed"}
      ]
    }
  ]
}
Rules:
- stem and choices are the printed question. Do not leave handwriting inside the stem.
- student_answer is only what the child wrote. teacher_mark is only the teacher's mark.
- If you guess text that was hidden, smudged, or covered, add a flags entry for that field.
- Use kind reconstructed for guessed page text, and kind generated for the explanation.
- Always flag the explanation as generated.
- If you are unsure, still give your best practice answer and flag correct_answer.
"""


def load_local_env() -> None:
    load_dotenv(REPO_ROOT / ".env")
    load_dotenv(REPO_ROOT / "prototype" / "exam" / ".env")


def keychain_api_key() -> str | None:
    if sys.platform != "darwin":
        return None
    try:
        out = subprocess.check_output(
            ["security", "find-generic-password", "-s", "sprout", "-a", "ZHIPU_API_KEY", "-w"],
            stderr=subprocess.DEVNULL,
            text=True,
            timeout=3,
        ).strip()
        return out or None
    except (OSError, subprocess.SubprocessError):
        return None


def vision_api_key() -> str | None:
    load_local_env()
    key = os.environ.get("ZHIPU_API_KEY", "").strip()
    if key:
        return key
    return keychain_api_key()


def load_fixture() -> dict:
    return json.loads(FIXTURE_PATH.read_text(encoding="utf-8"))


def stub_scan(filename: str) -> dict:
    fixture = load_fixture()
    return {
        "extraction": "stub",
        "subject": fixture["subject"],
        "paper_title": fixture["paper_title"],
        "source_photo": filename,
        "note": (
            "Sample demo. These questions are a labeled stub, not a live read of the photo. "
            "The page was still straightened and colored ink was lifted. "
            "A real photo is read with free Tesseract. ZHIPU_API_KEY is optional, for a Zhipu vision read."
        ),
        "questions": fixture["questions"],
    }


def _strip_fence(text: str) -> str:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    return cleaned.strip()


def parse_model_payload(text: str) -> dict:
    cleaned = _strip_fence(text)
    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if not match:
            raise ValueError("The vision model did not return JSON") from None
        data = json.loads(match.group(0))
    if not isinstance(data, dict):
        raise ValueError("The vision model did not return an object")
    return data


def questions_from_model(data: dict) -> list[dict]:
    raw_questions = data.get("questions") or []
    if not isinstance(raw_questions, list) or not raw_questions:
        raise ValueError("The vision model returned no questions")
    return [map_question(item, index + 1) for index, item in enumerate(raw_questions) if isinstance(item, dict)]


def sheet_from_ocr(text: str) -> tuple[str, list[dict]]:
    sheet = parse_worksheet_text(text)
    questions = []
    for parsed in sheet.questions:
        index = parsed.number
        stem = parsed.stem
        choices = parsed.choices
        raw = {
            "id": str(index),
            "stem": stem or "Question from the photo",
            "choices": choices,
            "student_answer": "",
            "teacher_mark": "",
            "correct_answer": "",
            "explanation": "",
            "flags": [
                {
                    "field": "stem",
                    "kind": "reconstructed",
                    "note": "Read by Tesseract.js. Handwriting was not separated from the print.",
                },
            ],
        }
        if choices:
            raw["flags"].append(
                {
                    "field": "choices",
                    "kind": "reconstructed",
                    "note": "Choices came from the text scan and may include stray handwriting.",
                }
            )
        if parsed.stem_changes:
            raw["flags"].append(
                {
                    "field": "stem",
                    "kind": "reconstructed",
                    "note": "Tesseract ran words together. Spaces were added: " + "; ".join(parsed.stem_changes) + ".",
                }
            )
        if parsed.choice_changes:
            raw["flags"].append(
                {
                    "field": "choices",
                    "kind": "reconstructed",
                    "note": "Tesseract ran words together. Spaces were added: " + "; ".join(parsed.choice_changes) + ".",
                }
            )
        if choices and "____" not in stem:
            raw["flags"].append(
                {
                    "field": "stem",
                    "kind": "reconstructed",
                    "note": "The answer line was not read. Check where the blank goes before practice.",
                }
            )
        questions.append(map_question(raw, index))
    if not questions:
        raise ValueError("Could not find a question in the scanned text")
    return sheet.title, questions


def questions_from_ocr(text: str) -> list[dict]:
    return sheet_from_ocr(text)[1]


def _tesseract_text(rgb) -> str:
    if not shutil.which("tesseract"):
        return ""
    from PIL import Image

    with tempfile.NamedTemporaryFile(suffix=".png") as handle:
        Image.fromarray(rgb, "RGB").save(handle.name)
        try:
            out = subprocess.check_output(
                ["tesseract", handle.name, "stdout", "-l", "eng"],
                stderr=subprocess.DEVNULL,
                text=True,
                timeout=40,
            )
        except (OSError, subprocess.SubprocessError):
            return ""
    return out.strip()


async def vision_extract(image_jpeg: bytes, api_key: str) -> dict:
    model = os.environ.get("ZHIPU_MODEL", "glm-4.6v").strip() or "glm-4.6v"
    encoded = base64.b64encode(image_jpeg).decode("ascii")
    payload = {
        "model": model,
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{encoded}"}},
                    {"type": "text", "text": PROMPT},
                ],
            }
        ],
    }
    async with httpx.AsyncClient(timeout=120) as client:
        response = await client.post(
            ZHIPU_URL,
            headers={"Authorization": f"Bearer {api_key}"},
            json=payload,
        )
    if response.status_code >= 400:
        detail = response.text[:300]
        raise RuntimeError(f"Zhipu GLM-4.6V returned {response.status_code}: {detail}")
    content = response.json()["choices"][0]["message"]["content"]
    data = parse_model_payload(content)
    return {
        "extraction": "zhipu",
        "subject": subject_slug(str(data.get("subject") or "english")),
        "paper_title": str(data.get("paper_title") or "Homework"),
        "note": f"Optional vision read with Zhipu {model}. Anything guessed is flagged on the question.",
        "questions": questions_from_model(data),
    }


def _jpeg_bytes(data_url: str) -> bytes:
    prefix, _, encoded = data_url.partition(",")
    if not encoded or "base64" not in prefix:
        raise ValueError("Could not encode the straightened page")
    return base64.b64decode(encoded)


async def extract_scan(
    image_bytes: bytes,
    filename: str,
    demo: bool,
    ocr_text: str,
    subject: str = "auto",
) -> dict:
    page = prepare_page(image_bytes)
    previews = {"deskew_jpeg": page["deskew_jpeg"], "clean_jpeg": page["clean_jpeg"]}
    sample_name = filename.lower().startswith("sample-exam")
    if demo or sample_name:
        scan = stub_scan(filename)
    else:
        key = vision_api_key()
        if key:
            scan = await vision_extract(_jpeg_bytes(page["clean_jpeg"]), key)
            scan["source_photo"] = filename
        else:
            text = (ocr_text or "").strip() or _tesseract_text(page["clean_rgb"])
            if not text:
                return {
                    "ok": False,
                    "need_ocr": True,
                    "message": (
                        "This server has no Tesseract binary. "
                        "The browser will retry with free Tesseract.js, or use the sample photo."
                    ),
                    "previews": previews,
                    "deskew": page["deskew"],
                }
            title, questions = sheet_from_ocr(text)
            scan = {
                "extraction": "tesseract",
                "subject": subject_slug(subject) if subject not in {"", "auto"} else "english",
                "paper_title": title or "Homework",
                "source_photo": filename,
                "note": (
                    "Read with free Tesseract. "
                    "Handwriting is not reliably separated. Flagged fields need a parent look."
                ),
                "questions": questions,
            }
    scan["source_photo"] = filename
    scan["deskew"] = page["deskew"]
    scan["ink_pixels_lifted"] = page["ink_pixels_lifted"]
    scan["previews"] = previews
    return {"ok": True, "scan": scan}
