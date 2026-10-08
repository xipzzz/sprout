import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { bandFromOrder, bandFromWords } from './locate';

describe('page location', () => {
  it('places a band from question order', () => {
    const band = bandFromOrder(0, 2);
    assert.ok(band);
    assert.ok(band.y < 0.2);
    assert.equal(bandFromOrder(-1, 2), null);
  });

  it('uses the printed words when they match', () => {
    const band = bandFromWords([
      { text: 'The', x0: 10, y0: 40, x1: 40, y1: 60 },
      { text: 'synthetic', x0: 44, y0: 40, x1: 120, y1: 60 },
      { text: 'fox', x0: 124, y0: 40, x1: 160, y1: 60 },
      { text: 'box', x0: 200, y0: 40, x1: 240, y1: 60 },
      { text: 'shape', x0: 10, y0: 200, x1: 70, y1: 220 },
    ], 'The synthetic fox ___ the box.', 300, 400);
    assert.ok(band);
    assert.ok(band.y < 0.3);
  });

  it('returns null when the words are not on the page', () => {
    assert.equal(bandFromWords([
      { text: 'circle', x0: 0, y0: 0, x1: 10, y1: 10 },
    ], 'The synthetic fox runs.', 100, 100), null);
  });
});