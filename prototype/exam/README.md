# Local exam scan

Run `npm run exam`, then open `http://localhost:5173/?exam=1`.
Use the sample to check the parent and child flow without OCR downloads.
Real scans need parent review. Pencil removal is still pending.

## Select OCR

Tesseract remains the default. The browser can use Tesseract.js if the local
Tesseract binary is missing. Neither needs an account or a paid key.

Select local PaddleOCR with either:

```bash
SPROUT_OCR=paddle npm run exam
```

Or open `http://localhost:5173/?exam=1&ocr=paddle`.
The URL overrides the environment setting. `?ocr=tesseract` explicitly selects
Tesseract. Either explicit local selection skips the optional vision provider.
The sample remains a labeled demo when selected with the sample button.

Install the optional packages into the server's Python environment:

```bash
prototype/exam/.venv/bin/python -m pip install -r prototype/exam/server/requirements-paddle.txt
```

The adapter targets the [PaddleOCR 3.x prediction API](https://www.paddleocr.ai/main/en/version3.x/pipeline_usage/OCR.html).
It uses CPU inference. The first run downloads public model files into the user's
cache. Photos go to the local engine. It needs no account or API key.
EXIF rotation, deskew and ink processing run before either local engine.

On this Mac Mini, installation failed on 2026-10-18 with Python 3.14:
`No matching distribution found for paddlepaddle<4,>=3.0`.
The code path ships with an installation message. Paddle inference has not been
verified here. Adapter and routing tests use the documented result shape.
Use a Python environment with a matching PaddlePaddle wheel to run inference.
A missing Paddle runtime does not silently select another engine.

## Export a folder

Activate the server's Python environment, then run from the checkout root:

```bash
source prototype/exam/.venv/bin/activate
python -m prototype.exam.server.batch --ocr tesseract /path/to/photos --out /tmp/results.csv
python -m prototype.exam.server.batch --ocr paddle /path/to/photos --out /tmp/paddle-results.csv
```

The CLI reads supported images in that folder and its subfolders. Each parsed
question gets a CSV row. Each failed photo gets an error row. Exit status is 0
when all photos pass, 1 when any photo fails, and 2 for invalid arguments.
It never calls a paid provider or saves Obsidian notes.

CSV paths inside this checkout are refused, including paths through symlinks.
Use a new output filename; existing files are not overwritten. Input photos stay
unchanged. Runtime logs use a temporary working folder and model caches stay
outside the checkout. For zero Python bytecode writes, add `-B` before `-m`.
Python can cache the entry module before its own code starts.

The CSV contains the file, OCR engine, status, subject, question ID, stem, choices,
choice labels and error. It contains OCR text, not a checked answer key.

## Verify

```bash
npm run test:exam
npx tsc -b
npm run build
```

The tests cover token leaks, parent-only details, the EXIF fixture, local OCR
selection, missing Paddle packages and batch output paths. The Tesseract CLI test
runs real OCR when the binary is installed.
See [LICENSE-NOTE.md](LICENSE-NOTE.md) for the reference source audit.
