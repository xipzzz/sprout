import { mkdir, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { defaultImageDir, imageExtensions, OUT_DIR } from './paths.mjs';
import { extractLikeParent, paddleAvailable, scoreExtract, writePageDump } from './scan-client.mjs';

function csvEscape(value) {
  const text = String(value ?? '');
  if (/[",\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function toCsv(rows) {
  const headers = [
    'file',
    'engine',
    'questions',
    'choices',
    'flags',
    'leak',
    'error',
    'pass',
    'extraction',
    'subject',
    'paper_title',
    'unsupported',
  ];
  return [headers.join(','), ...rows.map((row) => headers.map((key) => csvEscape(row[key])).join(','))].join('\n') + '\n';
}

export async function listImages(dir) {
  const names = await readdir(dir);
  return names.filter(imageExtensions).sort().map((name) => join(dir, name));
}

export async function scanFolder(dir, outDir = OUT_DIR) {
  await mkdir(outDir, { recursive: true });
  const files = await listImages(dir);
  if (!files.length) throw new Error(`No images in ${dir}`);
  const engines = ['tesseract'];
  if (await paddleAvailable()) engines.push('paddle');
  const rows = [];
  for (const file of files) {
    for (const engine of engines) {
      process.stdout.write(`scan ${engine} ${file.split('/').pop()} … `);
      let response = null;
      let error = '';
      try {
        response = await extractLikeParent(file, { engine });
        if (!response.ok && !response.scan) error = response.message || 'extract failed';
      } catch (err) {
        error = err instanceof Error ? err.message : String(err);
      }
      const row = scoreExtract(file, engine, response, error);
      rows.push(row);
      await writePageDump(outDir, row, response).catch(() => {});
      console.log(row.pass, `q=${row.questions}`, row.error ? `err=${row.error.slice(0, 80)}` : '');
    }
  }
  await writeFile(join(outDir, 'results.csv'), toCsv(rows));
  return { rows, engines };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const dir = defaultImageDir();
  if (!dir) {
    console.error('Usage: node qa/lib/run-scans.mjs <image-folder>');
    process.exit(2);
  }
  await scanFolder(dir, process.env.QA_OUT || OUT_DIR);
}
