import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

function parseCsvLine(line) {
  const cols = [];
  let cur = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') {
        cur += '"';
        i += 1;
        continue;
      }
      quoted = !quoted;
      continue;
    }
    if (ch === ',' && !quoted) {
      cols.push(cur);
      cur = '';
      continue;
    }
    cur += ch;
  }
  cols.push(cur);
  return cols;
}

const out = process.env.QA_SUMMARY_OUT;
const rows = [];
const csvPath = join(out, 'results.csv');
if (existsSync(csvPath)) {
  const raw = await readFile(csvPath, 'utf8');
  const lines = raw.trim().split(/\r?\n/);
  const headers = parseCsvLine(lines.shift() || '');
  for (const line of lines) {
    if (!line.trim()) continue;
    const cols = parseCsvLine(line);
    rows.push(Object.fromEntries(headers.map((h, i) => [h, cols[i] ?? ''])));
  }
}

const byEngine = {};
for (const row of rows) (byEngine[row.engine] ||= []).push(row);

function rate(list) {
  if (!list?.length) return 'n/a';
  const pass = list.filter((r) => r.pass === 'pass').length;
  return `${pass}/${list.length} (${Math.round((pass / list.length) * 100)}%)`;
}

const md = [
  '# Sprout QA summary',
  '',
  `- Branch: ${process.env.QA_SUMMARY_BRANCH} @ ${process.env.QA_SUMMARY_SHA}`,
  `- When: ${process.env.QA_SUMMARY_DATE}`,
  `- Image folder: ${process.env.QA_SUMMARY_IMAGES}`,
  `- Paddle: ${process.env.QA_SUMMARY_PADDLE}`,
  '',
  '## Checks',
  '',
  '| check | result |',
  '| --- | --- |',
  `| npm run test:exam | ${process.env.QA_SUMMARY_TEST} |`,
  `| npx tsc -b | ${process.env.QA_SUMMARY_TSC} |`,
  `| npm run build | ${process.env.QA_SUMMARY_BUILD} |`,
  `| photo scan | ${process.env.QA_SUMMARY_SCAN} |`,
  '',
  '## Photo pass rates',
  '',
  `- Tesseract: ${rate(byEngine.tesseract)}`,
  `- Paddle: ${rate(byEngine.paddle)}`,
  `- All engine rows: ${rate(rows)}`,
  '',
  'Pass rule: at least 1 question, no child-payload leak, no crash.',
  '',
];

if (rows.length) {
  md.push('## Per page', '');
  md.push('| file | engine | questions | choices | flags | leak | pass | error |');
  md.push('| --- | --- | ---: | ---: | --- | --- | --- | --- |');
  for (const row of rows) {
    const err = (row.error || '').replaceAll('|', '/').slice(0, 80);
    const flags = (row.flags || '').replaceAll('|', ', ').slice(0, 60);
    md.push(
      `| ${row.file} | ${row.engine} | ${row.questions} | ${row.choices} | ${flags} | ${row.leak} | ${row.pass} | ${err} |`,
    );
  }
  md.push('');
}

md.push(
  '## Notes',
  '',
  '- Child payload must be stem and choices only. Leak column uses the same forbidden keys as the app.',
  `- ${process.env.QA_SUMMARY_NOTE}`,
  '- Full check log: checks.log',
  '',
);

await writeFile(join(out, 'summary.md'), md.join('\n'));
