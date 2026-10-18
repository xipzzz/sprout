from fastapi import Body, FastAPI, File, Form, Query, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

import paddle_ocr
from extract import extract_scan, vision_api_key
from save_note import save_scan
import os

app = FastAPI(title="Sprout exam prototype")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def unhandled(request: Request, exc: Exception):
    message = str(exc).replace("Bearer ", "")
    return JSONResponse(status_code=500, content={"ok": False, "message": message[:500]})


@app.get("/api/health")
def health():
    try:
        ocr_default = paddle_ocr.engine_name()
    except ValueError as exc:
        ocr_default = f"invalid: {exc}"
    return {
        "ok": True,
        "vision": bool(vision_api_key()),
        "vision_key_name": "ZHIPU_API_KEY",
        "model": os.environ.get("ZHIPU_MODEL", "glm-4.6v"),
        "ocr_default": ocr_default,
        "paddle_installed": paddle_ocr.available(),
    }


@app.post("/api/extract")
async def extract_api(
    file: UploadFile = File(...),
    demo: str = Form("0"),
    ocr_text: str = Form(""),
    subject: str = Form("auto"),
    ocr_lang: str = Form(""),
    ocr: str = Form(""),
    ocr_query: str = Query("", alias="ocr"),
):
    engine = ocr or ocr_query
    try:
        paddle_ocr.engine_name(engine)
    except ValueError as exc:
        return JSONResponse(status_code=400, content={"ok": False, "message": str(exc)})
    data = await file.read()
    if not data:
        return {"ok": False, "message": "That photo was empty."}
    return await extract_scan(
        data,
        file.filename or "homework.jpg",
        demo in {"1", "true", "yes"},
        ocr_text,
        subject,
        ocr_lang,
        engine,
    )


@app.post("/api/save")
def save_api(payload: dict = Body(...)):
    scan = payload.get("scan") if isinstance(payload.get("scan"), dict) else payload
    replace = payload.get("replace") if isinstance(payload.get("replace"), list) else []
    paths = save_scan(scan, replace)
    return {"ok": True, "paths": paths["paths"], "skipped": paths["skipped"]}
