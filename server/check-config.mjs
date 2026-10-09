/* Refuse wrangler deploy and wrangler dev until SCAN_LIMITS is a real id.
   A placeholder would boot a worker that cannot count scans. */

import fs from 'node:fs';

const text = fs.readFileSync(new URL('./wrangler.toml', import.meta.url), 'utf8');
const match = text.match(/\[\[kv_namespaces\]\][\s\S]*?\bid\s*=\s*"([^"]*)"/);
const id = (match?.[1] ?? '').trim();
const missing = !id || /replace/i.test(id) || /^0+$/.test(id) || !/^[a-f0-9]{32}$/i.test(id);

if (missing) {
  console.error(`
SCAN_LIMITS is not configured, so this Worker will not start.

  1. npx wrangler kv namespace create SCAN_LIMITS
  2. Replace the id under [[kv_namespaces]] in server/wrangler.toml
     with the id that command prints.

Deploy and local dev both stop here until that id is real.
`);
  process.exit(1);
}
