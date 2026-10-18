"""Photo to parent scan.

Default read is free Tesseract. No API key.
Zhipu GLM-4.6V is optional, and runs only when ZHIPU_API_KEY is set
(env, .env, or macOS Keychain). The sample photo uses the labeled stub.
"""

from __future__ import annotations

import asyncio
import base64
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path

import httpx
from dotenv import load_dotenv

import paddle_ocr
from deskew import prepare_page
from schema import map_question, subject_slug
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


OCR_NOTE = {
    "eng": "Read by Tesseract.js from the cleaned page. Blue and red ink were lifted first; pencil was not.",
    "chi_sim": "Read by Tesseract.js in Chinese (chi_sim) from the cleaned page. Pencil was not lifted.",
}
PADDLE_NOTE = (
    "Read by PaddleOCR (PP-OCRv5, on this computer) from the cleaned page. "
    "Blue and red ink were lifted first; pencil was not."
)
ENGINE_LABEL = {"tesseract": "Tesseract", "paddle": "PaddleOCR"}


def _flag(field: str, note: str) -> dict:
    return {"field": field, "kind": "reconstructed", "note": note}


def read_sheet(text: str, ocr_lang: str = "eng", engine: str = "tesseract") -> tuple[ParsedSheet, list[dict]]:
    sheet = parse_worksheet_text(text)
    label = ENGINE_LABEL.get(engine, "Tesseract")
    questions = []
    for parsed in sheet.questions:
        stem = parsed.stem
        choices = parsed.choices
        note = PADDLE_NOTE if engine == "paddle" else OCR_NOTE.get(ocr_lang, OCR_NOTE["eng"])
        flags = [_flag("stem", note)]
        if choices:
            flags.append(_flag("choices", "Choices came from the text scan and may include stray handwriting."))
        if sheet.layout == "cloze":
            flags.append(_flag("stem", "One question per numbered blank in the passage. The stem is that blank's sentence."))
        if sheet.layout == "editing":
            flags.append(_flag("stem", "Editing passage. The child fixes the word after the number in brackets."))
        if parsed.stem_changes:
            flags.append(_flag("stem", f"{label} ran words together. Spaces were added: " + "; ".join(parsed.stem_changes) + "."))
        if parsed.choice_changes:
            flags.append(
                _flag("choices", f"{label} ran words together. Spaces were added: " + "; ".join(parsed.choice_changes) + ".")
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
    if not shutil.which("tesseract"):
        return ""
    from PIL import Image

    with tempfile.NamedTemporaryFile(suffix=".png") as handle:
        Image.fromarray(rgb, "RGB").save(handle.name)
        try:
            out = subprocess.check_output(
                ["tesseract", handle.name, "stdout", "-l", lang],
                stderr=subprocess.DEVNULL,
                text=True,
                timeout=40,
            )
        except (OSError, subprocess.SubprocessError):
            return ""
    return out.strip()


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
        reader = "PaddleOCR PP-OCRv5" if engine == "paddle" else "Tesseract chi_sim"
        flags.append({"kind": "chinese", "note": f"Chinese page, read with {reader}. Check characters closely."})
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


def _ocr_scan(page: dict, filename: str, text: str, lang: str, subject: str, engine: str) -> dict:
    sheet, questions = read_sheet(text, lang, engine)
    if lang == "chi_sim":
        subject_name = "chinese"
    else:
        subject_name = subject_slug(subject) if subject not in {"", "auto"} else "english"
    return {
        "extraction": engine,
        "subject": subject_name,
        "paper_title": sheet.title or "Homework",
        "source_photo": filename,
        "note": (
            f"Read with free {ENGINE_LABEL[engine]} from the cleaned page. "
            "Pencil is not lifted. Flagged fields need a parent look."
        ),
        "questions": questions,
        "ocr_lang": lang,
        "ocr_engine": engine,
        "page_flags": page_flags(page["pencil"], sheet.layout, lang, engine),
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
    return {"ok": True, "scan": _ocr_scan(page, filename, text, lang, subject, "tesseract"), "ocr_text": text}


async def _paddle_scan(page: dict, previews: dict, filename: str, subject: str) -> dict:
    if not paddle_ocr.available():
        return {
            "ok": False,
            "engine_missing": True,
            "message": f"PaddleOCR is not installed on this server. Run: {paddle_ocr.INSTALL}",
            "previews": previews,
        }
    text = await asyncio.to_thread(paddle_ocr.paddle_text, page["clean_rgb"])
    script = text_script(text)
    lang = "chi_sim" if script["han_share"] >= 0.3 else "eng"
    if not text.strip() or script["garbled"]:
        return {"ok": False, "unsupported": True, "ocr_lang": lang, "message": UNSUPPORTED, "previews": previews, "ocr_text": text}
    return {"ok": True, "scan": _ocr_scan(page, filename, text, lang, subject, "paddle"), "ocr_text": text}


async def extract_scan(
    image_bytes: bytes,
    filename: str,
    demo: bool,
    ocr_text: str,
    subject: str = "auto",
    ocr_lang: str = "",
    ocr_engine: str = "",
) -> dict:
    """OCR always reads the cleaned, straightened page, never the raw photo.

    ocr_engine (or SPROUT_OCR) picks tesseract or paddle. Naming an engine explicitly
    skips the optional Zhipu vision read.
    """
    engine = paddle_ocr.engine_name(ocr_engine)
    started = time.perf_counter()
    page = prepare_page(image_bytes)
    prepared = time.perf_counter()
    previews = {"deskew_jpeg": page["deskew_jpeg"], "clean_jpeg": page["clean_jpeg"]}
    sample_name = filename.lower().startswith("sample-exam")
    text = ""
    key = None if (ocr_engine or os.environ.get("SPROUT_OCR")) else vision_api_key()
    if demo or sample_name:
        scan = stub_scan(filename)
        scan["page_flags"] = page_flags(page["pencil"], "questions", "eng")
    elif key:
        scan = await vision_extract(_jpeg_bytes(page["clean_jpeg"]), key)
        scan["page_flags"] = page_flags(page["pencil"], "questions", "eng")
    else:
        if engine == "paddle":
            result = await _paddle_scan(page, previews, filename, subject)
        else:
            result = _tesseract_scan(page, previews, filename, ocr_text, subject, ocr_lang)
        result["timings"] = {
            "prepare_s": round(prepared - started, 3),
            "ocr_s": round(time.perf_counter() - prepared, 3),
        }
        if not result["ok"]:
            return result
        scan, text = result["scan"], result.get("ocr_text", "")
    scan["source_photo"] = filename
    scan["deskew"] = page["deskew"]
    scan["ink_pixels_lifted"] = page["ink_pixels_lifted"]
    scan["previews"] = previews
    timings = {"prepare_s": round(prepared - started, 3), "ocr_s": round(time.perf_counter() - prepared, 3)}
    return {"ok": True, "scan": scan, "ocr_text": text, "timings": timings}
