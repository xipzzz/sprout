from fastapi import Body, FastAPI, File, Form, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from extract import extract_scan, vision_api_key
from notebook_note import save_notebook, save_review
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
    return {
        "ok": True,
        "vision": bool(vision_api_key()),
        "vision_key_name": "ZHIPU_API_KEY",
        "model": os.environ.get("ZHIPU_MODEL", "glm-4.6v"),
    }


@app.post("/api/extract")
async def extract_api(
    file: UploadFile = File(...),
    demo: str = Form("0"),
    ocr_text: str = Form(""),
    subject: str = Form("auto"),
    ocr_lang: str = Form(""),
):
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
    )


@app.post("/api/save")
def save_api(payload: dict = Body(...)):
    scan = payload.get("scan") if isinstance(payload.get("scan"), dict) else payload
    replace = payload.get("replace") if isinstance(payload.get("replace"), list) else []
    paths = save_scan(scan, replace)
    return {"ok": True, "paths": paths["paths"], "skipped": paths["skipped"]}


@app.post("/api/notebook")
def notebook_api(payload: dict = Body(...)):
    return {"ok": True, **save_notebook(payload)}


@app.post("/api/review")
def review_api(payload: dict = Body(...)):
    return {"ok": True, **save_review(payload)}
