import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { loadCv, preprocessRgba } from './preprocess';

describe('preprocess', () => {
  it('straightens a synthetic page without throwing', async () => {
    const cv = await loadCv();
    const W = 240;
    const H = 320;
    const data = new Uint8ClampedArray(W * H * 4);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        const onPage = x > 20 && x < 220 && y > 20 && y < 300;
        const v = onPage ? 245 : 30;
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
        data[i + 3] = 255;
        if (onPage && y > 80 && y < 92 && x > 40 && x < 180) {
          data[i] = 20;
          data[i + 1] = 20;
          data[i + 2] = 20;
        }
      }
    }
    const out = preprocessRgba(cv, data, W, H);
    assert.ok(out.vis.length === out.width * out.height);
    assert.ok(out.width > 0 && out.height > 0);
  });
});
