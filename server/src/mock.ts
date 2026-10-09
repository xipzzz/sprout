/* Test-only vision adapter.
   The Worker entry (index.ts, handler.ts, adapters.ts) does not import this
   file, and createAdapter() throws if PROVIDER=mock. */

import type { VisionAdapter } from './adapters';

export function mockAdapter(script: {
  image?: string;
  text?: string;
  onImage?: () => string;
  onText?: () => string;
}): VisionAdapter {
  return {
    id: 'mock',
    async readImage() {
      if (script.onImage) return script.onImage();
      return script.image ?? '';
    },
    async readText() {
      if (script.onText) return script.onText();
      return script.text ?? '{"suggestions":[]}';
    },
  };
}
