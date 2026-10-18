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
import subprocess
import sys
from pathlib import Path

import httpx
from dotenv import load_dotenv

from deskew import prepare_page
from schema import map_question, subject_slug
from local_ocr import OcrUnavailable, recognize
from worksheet_text import ParsedSheet, parse_worksheet_text, text_script

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
      "choice_letters": ["printed label for that choice"],
      "working": [{"expression": "written calculation", "result": "written result", "steps": []}],
      "is_correct": null,
      "teacher_comment": "visible teacher note, or empty",
      "marks": {"selected": [], "crossed": false, "note": "", "symbols": [], "score": ""},
      "question_type": "format of this question, or empty",
      "sub_questions": [],
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
- Leave correct_answer empty when it cannot be checked. Never invent a teacher comment or a score.
- Keep visible working and sub-questions in the parent fields. Use the same question shape for each sub-question.
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


OCR_NOTE = {
    "eng": "Read by Tesseract.js from the cleaned page. Blue and red ink were lifted first; pencil was not.",
    "chi_sim": "Read by Tesseract.js in Chinese (chi_sim) from the cleaned page. Pencil was not lifted.",
}


def _flag(field: str, note: str) -> dict:
    return {"field": field, "kind": "reconstructed", "note": note}


def read_sheet(text: str, ocr_lang: str = "eng", engine: str = "tesseract") -> tuple[ParsedSheet, list[dict]]:
    sheet = parse_worksheet_text(text)
    questions = []
    for parsed in sheet.questions:
        stem = parsed.stem
        choices = parsed.choices
        flags = [_flag("stem", OCR_NOTE.get(ocr_lang, OCR_NOTE["eng"]) if engine == "tesseract" else "Read by local PaddleOCR from the cleaned page. Check the printed text; pencil was not lifted.")]
        if choices:
            flags.append(_flag("choices", "Choices came from the text scan and may include stray handwriting."))
        if sheet.layout == "cloze":
            flags.append(_flag("stem", "One question per numbered blank in the passage. The stem is that blank's sentence."))
        if sheet.layout == "editing":
            flags.append(_flag("stem", "Editing passage. The child fixes the word after the number in brackets."))
        if parsed.stem_changes:
            flags.append(_flag("stem", "OCR ran words together. Spaces were added: " + "; ".join(parsed.stem_changes) + "."))
        if parsed.choice_changes:
            flags.append(
                _flag("choices", "OCR ran words together. Spaces were added: " + "; ".join(parsed.choice_changes) + ".")
            )
        if parsed.removed:
            flags.append(_flag("stem", "Stray marks were left out of the question: " + " ".join(parsed.removed) + "."))
        if parsed.set_aside:
            flags.append(
                _flag("stem", "A line after the last choice was left out: " + " / ".join(parsed.set_aside) + ".")
            )
        if choices and "____" not in stem:
            flags.append(_flag("stem", "The answer line was not read. Check where the blank goes before practice."))
        raw = {
            "id": str(parsed.number),
            "stem": stem or "Question from the photo",
            "choices": choices,
            "choice_letters": parsed.choice_letters,
            "student_answer": "",
            "teacher_mark": "",
            "correct_answer": "",
            "explanation": "",
            "flags": flags,
        }
        questions.append(map_question(raw, parsed.number))
    if not questions:
        raise ValueError("Could not find a question in the scanned text")
    return sheet, questions


def sheet_from_ocr(text: str, ocr_lang: str = "eng") -> tuple[str, list[dict]]:
    sheet, questions = read_sheet(text, ocr_lang)
    return sheet.title, questions


def questions_from_ocr(text: str) -> list[dict]:
    return sheet_from_ocr(text)[1]


def _tesseract_text(rgb, lang: str = "eng") -> str:
    try:
        return recognize(rgb, "tesseract", lang)
    except OcrUnavailable:
        return ""


def page_flags(pencil: dict, layout: str, ocr_lang: str, engine: str = "tesseract") -> list[dict]:
    flags = []
    if pencil.get("likely"):
        flags.append(
            {
                "kind": "pencil",
                "note": (
                    "Grey pencil-like marks were found. Pencil is not lifted yet, "
                    "so pencil answers may show inside questions. Check each stem."
                ),
            }
        )
    if layout == "cloze":
        flags.append({"kind": "cloze", "note": "Passage with numbered blanks. Each blank became its own question."})
    if layout == "editing":
        flags.append({"kind": "editing", "note": "Editing passage. Each numbered word became its own question."})
    if ocr_lang == "chi_sim":
        flags.append({"kind": "chinese", "note": f"Chinese page, read with {engine} chi_sim. Check characters closely."})
    return flags


def wanted_lang(subject: str) -> str:
    return "chi_sim" if subject_slug(subject) == "chinese" else "eng"


def ocr_decision(text: str, ocr_lang: str) -> dict:
    """What to do with one OCR pass: parse it, ask the browser for a Chinese pass, or give up."""
    script = text_script(text)
    if ocr_lang == "eng" and (script["garbled"] or script["han_share"] >= 0.3):
        return {"action": "retry", "ocr_lang": "chi_sim"}
    if ocr_lang == "chi_sim" and script["han_share"] < 0.3:
        return {"action": "unsupported"}
    return {"action": "parse"}


UNSUPPORTED = (
    "Sprout could not read this page as English or Chinese. "
    "Nothing was saved. Try a flatter, brighter photo, or type the questions in."
)


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


def _need_ocr(page: dict, previews: dict, lang: str, retry: bool) -> dict:
    if retry:
        message = "This page looks Chinese. The browser will read the cleaned page again with Tesseract chi_sim."
    else:
        message = (
            "This server has no Tesseract binary. "
            "The browser will read the cleaned page with free Tesseract.js, or use the sample photo."
        )
    return {
        "ok": False,
        "need_ocr": True,
        "ocr_lang": lang,
        "ocr_jpeg": page["ocr_jpeg"],
        "message": message,
        "previews": previews,
        "deskew": page["deskew"],
    }


def _tesseract_scan(page: dict, previews: dict, filename: str, ocr_text: str, subject: str, ocr_lang: str) -> dict:
    lang = ocr_lang if ocr_lang in OCR_NOTE else wanted_lang(subject)
    text = (ocr_text or "").strip() or _tesseract_text(page["clean_rgb"], lang)
    retried = False
    while True:
        if not text:
            return _need_ocr(page, previews, lang, retried)
        decision = ocr_decision(text, lang)
        if decision["action"] == "retry" and not retried:
            lang, retried = decision["ocr_lang"], True
            text = _tesseract_text(page["clean_rgb"], lang)
            continue
        break
    if decision["action"] != "parse":
        return {"ok": False, "unsupported": True, "ocr_lang": lang, "message": UNSUPPORTED, "previews": previews}
    sheet, questions = read_sheet(text, lang)
    if lang == "chi_sim":
        subject_name = "chinese"
    else:
        subject_name = subject_slug(subject) if subject not in {"", "auto"} else "english"
    scan = {
        "extraction": "tesseract",
        "subject": subject_name,
        "paper_title": sheet.title or "Homework",
        "source_photo": filename,
        "note": (
            "Read with free Tesseract from the cleaned page. "
            "Pencil is not lifted. Flagged fields need a parent look."
        ),
        "questions": questions,
        "ocr_lang": lang,
        "page_flags": page_flags(page["pencil"], sheet.layout, lang),
    }
    return {"ok": True, "scan": scan}


def local_scan(image_bytes: bytes, filename: str, backend: str, subject: str = "auto") -> dict:
    """Batch and Paddle web entry point. No model keys, browser fallback or saving."""
    page = prepare_page(image_bytes)
    lang = wanted_lang(subject)
    text = recognize(page["clean_rgb"], backend, lang)
    decision = ocr_decision(text, lang)
    if decision["action"] == "retry":
        lang = decision["ocr_lang"]
        text = recognize(page["clean_rgb"], backend, lang)
        decision = ocr_decision(text, lang)
    if not text.strip() or decision["action"] != "parse":
        raise ValueError(UNSUPPORTED)
    sheet, questions = read_sheet(text, lang, backend)
    return {
        "extraction": backend,
        "subject": "chinese" if lang == "chi_sim" else subject_slug(subject) if subject != "auto" else "english",
        "paper_title": sheet.title or "Homework", "source_photo": filename,
        "note": f"Read with local {backend}. Pencil is not lifted. Check each question before practice.",
        "questions": questions, "ocr_lang": lang,
        "page_flags": page_flags(page["pencil"], sheet.layout, lang, backend),
        "deskew": page["deskew"], "ink_pixels_lifted": page["ink_pixels_lifted"],
        "previews": {"deskew_jpeg": page["deskew_jpeg"], "clean_jpeg": page["clean_jpeg"]},
    }


def selected_ocr(requested: str = "") -> str:
    choice = (requested or os.environ.get("SPROUT_OCR", "")).strip().lower()
    if choice not in {"", "paddle", "tesseract"}:
        raise ValueError("Choose OCR paddle or tesseract.")
    return choice


async def extract_scan(
    image_bytes: bytes,
    filename: str,
    demo: bool,
    ocr_text: str,
    subject: str = "auto",
    ocr_lang: str = "",
    ocr: str = "",
) -> dict:
    """OCR always reads the cleaned, straightened page, never the raw photo."""
    backend = selected_ocr(ocr)
    if not demo and backend == "paddle":
        try:
            return {"ok": True, "scan": local_scan(image_bytes, filename, backend, subject)}
        except (OcrUnavailable, ValueError) as exc:
            return {"ok": False, "message": str(exc)}
    page = prepare_page(image_bytes)
    previews = {"deskew_jpeg": page["deskew_jpeg"], "clean_jpeg": page["clean_jpeg"]}
    sample_name = filename.lower().startswith("sample-exam")
    if demo or sample_name:
        scan = stub_scan(filename)
        scan["page_flags"] = page_flags(page["pencil"], "questions", "eng")
    else:
        key = None if backend else vision_api_key()
        if key:
            scan = await vision_extract(_jpeg_bytes(page["clean_jpeg"]), key)
            scan["page_flags"] = page_flags(page["pencil"], "questions", "eng")
        else:
            result = _tesseract_scan(page, previews, filename, ocr_text, subject, ocr_lang)
            if not result["ok"]:
                return result
            scan = result["scan"]
    scan["source_photo"] = filename
    scan["deskew"] = page["deskew"]
    scan["ink_pixels_lifted"] = page["ink_pixels_lifted"]
    scan["previews"] = previews
    return {"ok": True, "scan": scan}
