// Read an image with Tesseract.js, the same engine the browser uses.
// Usage: node prototype/exam/ocr_fixture.mjs IMAGE [eng|chi_sim] > out.txt
// Language data comes from the public tesseract.js CDN and is cached in /tmp.
import { createWorker } from 'tesseract.js';

const [image, lang = 'eng'] = process.argv.slice(2);
if (!image) {
  console.error('usage: node prototype/exam/ocr_fixture.mjs IMAGE [eng|chi_sim]');
  process.exit(2);
}
const worker = await createWorker(lang, 1, { cachePath: '/tmp/sprout-tessdata' });
try {
  const { data } = await worker.recognize(image);
  process.stdout.write(data.text);
} finally {
  await worker.terminate();
}
