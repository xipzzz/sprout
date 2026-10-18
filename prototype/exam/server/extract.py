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
from ocr_engines import OcrUnavailable, paddle_text, pick_engine, tesseract_text
from schema import map_question, subject_slug
from worksheet_text import ParsedSheet, parse_worksheet_text, text_script

REPO_ROOT = Path(__file__).resolve().parents[3]
FIXTURE_PATH = REPO_ROOT / "src" / "exam" / "fixture.json"
ZHIPU_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions"

PROMPT = """Read this photo of a primary school worksheet for a parent.
Reply with one JSON object and nothing else. No markdown fence.

Top level keys: paper_title (the sheet heading, or empty), subject (english, math or chinese),
and questions (a list, one item per numbered question, in page order).

Each question item has these keys:
- id: the number printed on the page, as a string.
- stem: the printed question only. Leave the child's handwriting out of it.
- choices: a list of the printed options, without their letters or numbers. Empty if none.
- student_answer: only what the child wrote or circled. Empty if nothing.
- teacher_mark: only the teacher's tick, cross or score. Empty if nothing.
- correct_answer: your best answer for practice.
- explanation: one or two short sentences a parent can read.
- flags: a list of {field, kind, note} for every part you were not sure of.
- choice_labels: the printed label of each choice, such as A or 1, in the same order.
- question_type: a short name, such as multiple choice, fill in the blank or word problem.
- working: a list of the child's working steps, if any.
- is_correct: true or false from the teacher's mark, or null if there is no mark.
- teacher_comment: any words the teacher wrote. Empty if none.
- marks: the score the teacher gave, such as 2 or 1/2. Empty if none.
- sub_questions: parts like 1a and 1b, each with these same keys. Empty if none.

How to flag:
- If print was hidden, smudged or covered and you guessed it, flag that field with kind reconstructed.
- Always flag explanation with kind generated.
- If you are not sure of correct_answer, still give one and flag it.
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


PADDLE_NOTE = "Read by local PaddleOCR from the cleaned page. Blue and red ink were lifted first; pencil was not."

OCR_NOTE = {
    "eng": "Read by Tesseract.js from the cleaned page. Blue and red ink were lifted first; pencil was not.",
    "chi_sim": "Read by Tesseract.js in Chinese (chi_sim) from the cleaned page. Pencil was not lifted.",
}


def _flag(field: str, note: str) -> dict:
    return {"field": field, "kind": "reconstructed", "note": note}


def read_sheet(text: str, ocr_lang: str = "eng") -> tuple[ParsedSheet, list[dict]]:
    sheet = parse_worksheet_text(text)
    questions = []
    for parsed in sheet.questions:
        stem = parsed.stem
        choices = parsed.choices
        flags = [_flag("stem", OCR_NOTE.get(ocr_lang, OCR_NOTE["eng"]))]
        if choices:
            flags.append(_flag("choices", "Choices came from the text scan and may include stray handwriting."))
        if sheet.layout == "cloze":
            flags.append(_flag("stem", "One question per numbered blank in the passage. The stem is that blank's sentence."))
        if sheet.layout == "editing":
            flags.append(_flag("stem", "Editing passage. The child fixes the word after the number in brackets."))
        if parsed.stem_changes:
            flags.append(_flag("stem", "Tesseract ran words together. Spaces were added: " + "; ".join(parsed.stem_changes) + "."))
        if parsed.choice_changes:
            flags.append(
                _flag("choices", "Tesseract ran words together. Spaces were added: " + "; ".join(parsed.choice_changes) + ".")
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
            "choice_labels": parsed.choice_labels,
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
    return tesseract_text(rgb, lang)


def _engine_text(rgb, lang: str, engine: str) -> str:
    return paddle_text(rgb, lang) if engine == "paddle" else _tesseract_text(rgb, lang)


def page_flags(pencil: dict, layout: str, ocr_lang: str) -> list[dict]:
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
        flags.append({"kind": "chinese", "note": "Chinese page, read with Tesseract chi_sim. Check characters closely."})
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


def _tesseract_scan(
    page: dict,
    previews: dict,
    filename: str,
    ocr_text: str,
    subject: str,
    ocr_lang: str,
    engine: str = "tesseract",
) -> dict:
    lang = ocr_lang if ocr_lang in OCR_NOTE else wanted_lang(subject)
    paddle = engine == "paddle"
    try:
        text = ("" if paddle else (ocr_text or "").strip()) or _engine_text(page["clean_rgb"], lang, engine)
        retried = False
        while True:
            if not text:
                if paddle:
                    return {"ok": False, "unsupported": True, "ocr_lang": lang, "message": UNSUPPORTED, "previews": previews}
                return _need_ocr(page, previews, lang, retried)
            decision = ocr_decision(text, lang)
            if decision["action"] == "retry" and not retried:
                lang, retried = decision["ocr_lang"], True
                text = _engine_text(page["clean_rgb"], lang, engine)
                continue
            break
    except OcrUnavailable as exc:
        return {"ok": False, "ocr_unavailable": True, "message": str(exc), "previews": previews}
    if decision["action"] != "parse":
        return {"ok": False, "unsupported": True, "ocr_lang": lang, "message": UNSUPPORTED, "previews": previews}
    sheet, questions = read_sheet(text, lang)
    if paddle:
        for question in questions:
            for flag in question["flags"]:
                if flag["note"] in OCR_NOTE.values():
                    flag["note"] = PADDLE_NOTE
    if lang == "chi_sim":
        subject_name = "chinese"
    else:
        subject_name = subject_slug(subject) if subject not in {"", "auto"} else "english"
    scan = {
        "extraction": engine,
        "subject": subject_name,
        "paper_title": sheet.title or "Homework",
        "source_photo": filename,
        "note": (
            ("Read with local PaddleOCR" if paddle else "Read with free Tesseract")
            + " from the cleaned page. Pencil is not lifted. Flagged fields need a parent look."
        ),
        "questions": questions,
        "ocr_lang": lang,
        "page_flags": page_flags(page["pencil"], sheet.layout, lang),
    }
    return {"ok": True, "scan": scan}


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

    ocr_engine (or SPROUT_OCR) set to paddle reads the page with local PaddleOCR on this server.
    """
    engine = pick_engine(ocr_engine)
    page = prepare_page(image_bytes)
    previews = {"deskew_jpeg": page["deskew_jpeg"], "clean_jpeg": page["clean_jpeg"]}
    sample_name = filename.lower().startswith("sample-exam")
    if demo or sample_name:
        scan = stub_scan(filename)
        scan["page_flags"] = page_flags(page["pencil"], "questions", "eng")
    else:
        key = None if engine == "paddle" else vision_api_key()
        if key:
            scan = await vision_extract(_jpeg_bytes(page["clean_jpeg"]), key)
            scan["page_flags"] = page_flags(page["pencil"], "questions", "eng")
        else:
            result = _tesseract_scan(page, previews, filename, ocr_text, subject, ocr_lang, engine)
            if not result["ok"]:
                return result
            scan = result["scan"]
    scan["source_photo"] = filename
    scan["deskew"] = page["deskew"]
    scan["ink_pixels_lifted"] = page["ink_pixels_lifted"]
    scan["previews"] = previews
    return {"ok": True, "scan": scan}
