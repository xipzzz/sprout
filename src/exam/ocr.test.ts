/* Run: node --experimental-strip-types src/exam/ocr.test.ts */

import { dataUrlToBlob, nextOcrPass, type ExtractResponse } from './ocr.ts';

function check(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

const CLEAN = 'data:image/jpeg;base64,/9j/AAAA';

const first: ExtractResponse = { ok: false, need_ocr: true, ocr_lang: 'eng', ocr_jpeg: CLEAN };
const pass = nextOcrPass(first, []);
check(pass?.image === CLEAN, 'OCR reads the cleaned page the server sent back');
check(pass?.lang === 'eng', 'first pass is English unless the server asks for Chinese');

const chinese = nextOcrPass({ ok: false, need_ocr: true, ocr_lang: 'chi_sim', ocr_jpeg: CLEAN }, ['eng']);
check(chinese?.lang === 'chi_sim', 'a garbled English read retries once in Chinese');

check(
  nextOcrPass({ ok: false, need_ocr: true, ocr_lang: 'chi_sim', ocr_jpeg: CLEAN }, ['eng', 'chi_sim']) === null,
  'the same language is never read twice, so the loop ends',
);
check(nextOcrPass({ ok: false, need_ocr: true, ocr_lang: 'eng' }, []) === null, 'no cleaned page, no OCR of the raw photo');
check(
  nextOcrPass({ ok: false, need_ocr: true, ocr_lang: 'eng', ocr_jpeg: 'blob:raw-photo' }, []) === null,
  'only a data URL from the server is OCR input',
);
check(nextOcrPass({ ok: false, unsupported: true, message: 'no' }, []) === null, 'unsupported pages stop');
check(nextOcrPass({ ok: true }, []) === null, 'a finished scan needs no OCR');

const blob = dataUrlToBlob('data:image/jpeg;base64,' + btoa('abc'));
check(blob.type === 'image/jpeg' && blob.size === 3, 'data URL decodes to the JPEG bytes');

console.log('ocr routing test passed');
