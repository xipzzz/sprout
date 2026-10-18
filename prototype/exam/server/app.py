"""Local scan server. The Vite dev server proxies /api here, so requests arrive same-origin."""

import os

from fastapi import APIRouter, Body, FastAPI, File, Form, Request, UploadFile
from fastapi.responses import JSONResponse

import paddle_ocr
from save_note import save_scan
from scan_reader import read_photo, vision_api_key

TRUE_WORDS = {"1", "true", "yes"}

api = APIRouter(prefix="/api")


def refuse(status: int, message: str) -> JSONResponse:
    # A failed vision call can echo the request header; keep the key out of the reply.
    return JSONResponse({"ok": False, "message": message.replace("Bearer ", "")[:500]}, status_code=status)


@api.get("/health")
def health() -> dict:
    try:
        default_engine = paddle_ocr.engine_name()
    except ValueError as exc:
        default_engine = f"invalid: {exc}"
    return {
        "ok": True,
        "ocr_default": default_engine,
        "paddle_installed": paddle_ocr.available(),
        "vision": bool(vision_api_key()),
        "vision_key_name": "ZHIPU_API_KEY",
        "model": os.environ.get("ZHIPU_MODEL", "glm-4.6v"),
    }


@api.post("/read")
async def read_api(
    request: Request,
    file: UploadFile = File(...),
    demo: str = Form("0"),
    subject: str = Form("auto"),
    ocr: str = Form(""),
    ocr_text: str = Form(""),
    ocr_lang: str = Form(""),
):
    """One photo in, one parent scan out. ?ocr= on the URL works the same as the form field."""
    engine = ocr or request.query_params.get("ocr", "")
    try:
        paddle_ocr.engine_name(engine)
    except ValueError as exc:
        return refuse(400, str(exc))
    photo = await file.read()
    if not photo:
        return {"ok": False, "message": "That photo was empty."}
    try:
        return await read_photo(
            photo,
            file.filename or "homework.jpg",
            demo.lower() in TRUE_WORDS,
            ocr_text,
            subject,
            ocr_lang,
            engine,
        )
    except Exception as exc:  # noqa: BLE001 - the parent screen shows the message instead of a blank 500
        return refuse(500, str(exc))


@api.post("/save")
def save_api(payload: dict = Body(...)):
    scan = payload["scan"] if isinstance(payload.get("scan"), dict) else payload
    replace = payload["replace"] if isinstance(payload.get("replace"), list) else []
    try:
        written = save_scan(scan, replace)
    except Exception as exc:  # noqa: BLE001
        return refuse(500, str(exc))
    return {"ok": True, "paths": written["paths"], "skipped": written["skipped"]}


app = FastAPI(title="Sprout scan server")
app.include_router(api)
