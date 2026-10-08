/* Sprout has no server-verifiable account token today (progress is
   localStorage; the old account screen was a local button). Until Google
   parent sign-in is configured, every scan is refused. */

import { verifyGoogleIdToken, type GoogleEnv } from './googleJwt';

export type AuthResult =
  | { status: 'ok'; accountId: string }
  | { status: 'rejected' }
  | { status: 'not_configured' };

export async function authenticate(
  request: Request,
  env: GoogleEnv,
  verifyToken: (token: string, env: GoogleEnv) => Promise<string | null> = verifyGoogleIdToken,
): Promise<AuthResult> {
  if (!env.GOOGLE_CLIENT_ID?.trim() || !env.ALLOWED_EMAILS?.trim()) {
    return { status: 'not_configured' };
  }
  const header = request.headers.get('Authorization') || '';
  const match = header.match(/^Bearer\s+(\S+)$/i);
  if (!match) return { status: 'rejected' };
  const email = await verifyToken(match[1], env);
  if (!email) return { status: 'rejected' };
  return { status: 'ok', accountId: email.toLowerCase() };
}
