/* One vision-adapter interface. PROVIDER picks OpenAI, Anthropic, or xAI.
   The mock adapter is not imported here and cannot be selected. */

export interface VisionAdapter {
  readonly id: string;
  readImage(args: { prompt: string; bytes: Uint8Array; mediaType: string; apiKey: string }): Promise<string>;
  readText(args: { prompt: string; apiKey: string }): Promise<string>;
}

/** The model stopped because the output cap was hit. Do not parse a partial page. */
export class TruncatedReply extends Error {
  constructor() {
    super('truncated');
    this.name = 'TruncatedReply';
  }
}

/** Anthropic and xAI have no measured default. MODEL must be set. */
export class ModelRequiredError extends Error {
  constructor(provider: string) {
    super(`${provider} needs MODEL set. Only gpt-6-astra was measured. Any other model needs a holdout rerun before approval.`);
    this.name = 'ModelRequiredError';
  }
}

const OPENAI_MEASURED = 'gpt-6-astra';

/** MODEL always wins. OpenAI falls back to the measured model. Others refuse. */
export function resolveModel(provider: string, model: string | undefined): string {
  const chosen = (model || '').trim();
  if (chosen) return chosen;
  if (provider === 'openai') return OPENAI_MEASURED;
  throw new ModelRequiredError(provider);
}

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, Math.min(i + 0x8000, bytes.length)));
  }
  return btoa(binary);
}

async function readError(res: Response): Promise<string> {
  const text = await res.text();
  return text.slice(0, 180);
}

function openAi(model: string): VisionAdapter {
  return {
    id: 'openai',
    async readImage({ prompt, bytes, mediaType, apiKey }) {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: `data:${mediaType};base64,${bytesToBase64(bytes)}` } },
            ],
          }],
          max_tokens: 16000,
          response_format: { type: 'json_object' },
        }),
      });
      if (!res.ok) throw new Error(`openai ${res.status} ${await readError(res)}`);
      const json = await res.json() as { choices?: { message?: { content?: string }; finish_reason?: string }[] };
      if (json.choices?.[0]?.finish_reason === 'length') throw new TruncatedReply();
      const content = json.choices?.[0]?.message?.content;
      if (!content) throw new Error('openai empty reply');
      return content;
    },
    async readText({ prompt, apiKey }) {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          max_tokens: 16000,
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
        }),
      });
      if (!res.ok) throw new Error(`openai ${res.status}`);
      const json = await res.json() as { choices?: { message?: { content?: string }; finish_reason?: string }[] };
      if (json.choices?.[0]?.finish_reason === 'length') throw new TruncatedReply();
      return json.choices?.[0]?.message?.content || '';
    },
  };
}

function anthropic(model: string): VisionAdapter {
  const call = async (content: unknown[], apiKey: string) => {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({ model, max_tokens: 16000, messages: [{ role: 'user', content }] }),
    });
    if (!res.ok) throw new Error(`anthropic ${res.status} ${await readError(res)}`);
    const json = await res.json() as { stop_reason?: string; content?: { type: string; text?: string }[] };
    if (json.stop_reason === 'max_tokens') throw new TruncatedReply();
    const text = (json.content || []).filter((part) => part.type === 'text').map((part) => part.text || '').join('\n');
    if (!text) throw new Error('anthropic empty reply');
    return text;
  };
  return {
    id: 'anthropic',
    readImage: ({ prompt, bytes, mediaType, apiKey }) => call([
      { type: 'image', source: { type: 'base64', media_type: mediaType, data: bytesToBase64(bytes) } },
      { type: 'text', text: prompt },
    ], apiKey),
    readText: ({ prompt, apiKey }) => call([{ type: 'text', text: prompt }], apiKey),
  };
}

function xai(model: string): VisionAdapter {
  const call = async (content: unknown, apiKey: string) => {
    const res = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        max_tokens: 16000,
        messages: [{ role: 'user', content }],
      }),
    });
    if (!res.ok) throw new Error(`xai ${res.status} ${await readError(res)}`);
    const json = await res.json() as { choices?: { message?: { content?: string }; finish_reason?: string }[] };
    if (json.choices?.[0]?.finish_reason === 'length') throw new TruncatedReply();
    const text = json.choices?.[0]?.message?.content;
    if (!text) throw new Error('xai empty reply');
    return text;
  };
  return {
    id: 'xai',
    readImage: ({ prompt, bytes, mediaType, apiKey }) => call([
      { type: 'text', text: prompt },
      { type: 'image_url', image_url: { url: `data:${mediaType};base64,${bytesToBase64(bytes)}` } },
    ], apiKey),
    readText: ({ prompt, apiKey }) => call(prompt, apiKey),
  };
}

/** Production selector. `mock` throws — it is not a deployable provider. */
export function createAdapter(provider: string | undefined, model: string | undefined): VisionAdapter {
  const name = (provider || '').trim().toLowerCase();
  if (name === 'mock' || name === 'test') {
    throw new Error('mock adapter cannot be enabled');
  }
  if (name === 'openai') return openAi(resolveModel('openai', model));
  if (name === 'anthropic') return anthropic(resolveModel('anthropic', model));
  if (name === 'xai') return xai(resolveModel('xai', model));
  throw new Error('PROVIDER must be openai, anthropic, or xai');
}
