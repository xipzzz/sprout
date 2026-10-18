import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import { spawn } from 'node:child_process';
import { createWorker } from 'tesseract.js';
import { API_URL } from './paths.mjs';
import { checkChildPayload } from './child-leak.mjs';

const LANGS = ['eng', 'chi_sim'];

function nextOcrPass(response, tried) {
  if (!response?.need_ocr) return null;
  const lang = response.ocr_lang && LANGS.includes(response.ocr_lang) ? response.ocr_lang : 'eng';
  if (tried.includes(lang)) return null;
  const image = response.ocr_jpeg || '';
  if (!image.startsWith('data:image/')) return null;
  return { image, lang };
}

function dataUrlToBuffer(dataUrl) {
  const [, encoded = ''] = dataUrl.split(',', 2);
  return Buffer.from(encoded, 'base64');
}

export async function tesseractJsText(image, lang) {
  const worker = await createWorker(lang);
  try {
    const source = typeof image === 'string' && image.startsWith('data:') ? dataUrlToBuffer(image) : image;
    const { data } = await worker.recognize(source);
    return (data?.text || '').trim();
  } finally {
    try {
      await worker.terminate();
    } catch {
      /* ignore */
    }
  }
}

function run(cmd, args, { input, timeout = 120_000 } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: ['pipe', 'pipe', 'pipe'] });
    const chunks = [];
    const err = [];
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error(`${cmd} timed out`));
    }, timeout);
    child.stdout.on('data', (d) => chunks.push(d));
    child.stderr.on('data', (d) => err.push(d));
    child.on('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      const stdout = Buffer.concat(chunks).toString('utf8');
      const stderr = Buffer.concat(err).toString('utf8');
      if (code !== 0) reject(new Error(stderr || `${cmd} exited ${code}`));
      else resolve(stdout);
    });
    if (input) child.stdin.end(input);
    else child.stdin.end();
  });
}

export async function paddleAvailable() {
  if ((process.env.SPROUT_OCR || '').toLowerCase() !== 'paddle') return false;
  try {
    await run('python3', ['-c', 'import paddleocr; print("ok")'], { timeout: 20_000 });
    return true;
  } catch {
    return false;
  }
}

async function paddleOcrText(image, lang) {
  const script = `
import sys, tempfile, base64
from paddleocr import PaddleOCR
raw = sys.stdin.buffer.read()
lang = sys.argv[1] if len(sys.argv) > 1 else "en"
mapped = "ch" if lang in ("chi_sim", "ch", "chinese") else "en"
ocr = PaddleOCR(use_angle_cls=True, lang=mapped, show_log=False)
with tempfile.NamedTemporaryFile(suffix=".jpg") as handle:
    handle.write(raw)
    handle.flush()
    result = ocr.ocr(handle.name, cls=True)
lines = []
for page in result or []:
    for row in page or []:
        if row and row[1] and row[1][0]:
            lines.append(str(row[1][0]))
print("\\n".join(lines))
`;
  const buf = typeof image === 'string' && image.startsWith('data:') ? dataUrlToBuffer(image) : image;
  return (await run('python3', ['-c', script, lang === 'chi_sim' ? 'chi_sim' : 'en'], { input: buf, timeout: 180_000 })).trim();
}

async function postExtract(fileBytes, filename, extra) {
  const body = new FormData();
  body.append('file', new Blob([fileBytes], { type: 'application/octet-stream' }), filename);
  for (const [key, value] of Object.entries(extra)) {
    if (value !== undefined && value !== null) body.append(key, String(value));
  }
  const res = await fetch(`${API_URL}/api/extract`, { method: 'POST', body });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(text.slice(0, 400) || `Scan server returned ${res.status}`);
  }
  if (!res.ok && !data.need_ocr && !data.unsupported) {
    throw new Error(data.message || text.slice(0, 400) || `Scan server returned ${res.status}`);
  }
  return data;
}

async function recognize(engine, image, lang) {
  if (engine === 'paddle') return paddleOcrText(image, lang);
  return tesseractJsText(image, lang);
}

/** Same route the parent page uses: POST /api/extract, then OCR the cleaned
 *  page the server sent back (never the raw photo), then POST the text. */
export async function extractLikeParent(filePath, { engine = 'tesseract', subject = 'auto', demo = false } = {}) {
  const fileBytes = await readFile(filePath);
  const filename = basename(filePath);
  let response = await postExtract(fileBytes, filename, { demo: demo ? '1' : '0', subject });
  const tried = [];
  for (let pass = nextOcrPass(response, tried); pass; pass = nextOcrPass(response, tried)) {
    tried.push(pass.lang);
    const ocrText = await recognize(engine, pass.image, pass.lang);
    response = await postExtract(fileBytes, filename, {
      demo: '0',
      subject,
      ocr_text: ocrText,
      ocr_lang: pass.lang,
    });
  }
  return response;
}

function flagList(scan) {
  const flags = [];
  for (const page of scan?.page_flags || []) {
    flags.push(page.kind || page.note || 'page');
  }
  for (const question of scan?.questions || []) {
    for (const flag of question.flags || []) {
      flags.push(`${flag.field}:${flag.kind}`);
    }
  }
  return [...new Set(flags)];
}

export function scoreExtract(filePath, engine, response, error) {
  const scan = response?.scan || null;
  const questions = scan?.questions || [];
  const choices = questions.reduce((n, q) => n + (q.choices?.length || 0), 0);
  const flags = flagList(scan);
  let leak = '';
  if (scan) {
    const checked = checkChildPayload(scan);
    leak = checked.ok ? 'ok' : checked.leak;
  } else if (!error) {
    leak = 'n/a';
  }
  const crashed = Boolean(error);
  const unsupported = Boolean(response?.unsupported);
  const pass = !crashed && !unsupported && questions.length >= 1 && (leak === 'ok' || leak === '');
  return {
    file: basename(filePath),
    engine,
    questions: questions.length,
    choices,
    flags: flags.join('|'),
    leak: leak || (crashed ? 'n/a' : 'ok'),
    error: error || (response?.message && !response?.ok && !response?.scan ? response.message : ''),
    pass: pass ? 'pass' : 'fail',
    extraction: scan?.extraction || '',
    subject: scan?.subject || '',
    paper_title: scan?.paper_title || '',
    unsupported: unsupported ? 'yes' : '',
  };
}

export async function writePageDump(outDir, row, response) {
  if (!response) return;
  await mkdir(join(outDir, 'pages'), { recursive: true });
  const slim = {
    ok: response.ok,
    unsupported: response.unsupported,
    message: response.message,
    need_ocr: response.need_ocr,
    scan: response.scan
      ? {
          ...response.scan,
          previews: undefined,
        }
      : null,
  };
  const name = `${row.engine}-${row.file.replace(extname(row.file), '')}.json`;
  await writeFile(join(outDir, 'pages', name), JSON.stringify(slim, null, 2));
}
