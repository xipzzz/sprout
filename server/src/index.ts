/* Cloudflare Worker entry. Images are not written to KV or to logs. */

import { handleScan, type ScanEnv } from './handler';

export default {
  fetch(request: Request, env: ScanEnv): Promise<Response> {
    return handleScan(request, env);
  },
};
