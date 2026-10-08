/* Verify a Google ID token with Google's public keys.
   This is the smallest real parent sign-in that a static Pages app can use:
   the token is signed by Google, and the Worker checks the audience and an
   email allow-list. A shared secret in the app would not be a sign-in. */

export interface GoogleEnv {
  GOOGLE_CLIENT_ID?: string;
  ALLOWED_EMAILS?: string;
}

interface CertCache {
  at: number;
  keys: JsonWebKey & { kid?: string }[];
}

let certs: CertCache | null = null;

function bytesToString(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

function b64urlToBytes(segment: string): Uint8Array<ArrayBuffer> {
  const pad = segment.length % 4 === 0 ? '' : '='.repeat(4 - (segment.length % 4));
  const b64 = segment.replace(/-/g, '+').replace(/_/g, '/') + pad;
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function googleCerts(): Promise<CertCache['keys']> {
  if (certs && Date.now() - certs.at < 60 * 60 * 1000) return certs.keys;
  const res = await fetch('https://www.googleapis.com/oauth2/v3/certs');
  if (!res.ok) throw new Error('google certs');
  const json = await res.json() as { keys?: CertCache['keys'] };
  certs = { at: Date.now(), keys: json.keys || [] };
  return certs.keys;
}

export function allowedEmails(raw: string | undefined): string[] {
  return (raw || '').split(',').map((email) => email.trim().toLowerCase()).filter(Boolean);
}

/** Returns the verified email, or null. Never throws to the caller. */
export async function verifyGoogleIdToken(token: string, env: GoogleEnv): Promise<string | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const header = JSON.parse(bytesToString(b64urlToBytes(parts[0]))) as { alg?: string; kid?: string };
    if (header.alg !== 'RS256' || !header.kid) return null;
    const keys = await googleCerts();
    const jwk = keys.find((key) => key.kid === header.kid);
    if (!jwk) return null;
    const key = await crypto.subtle.importKey(
      'jwk',
      jwk as JsonWebKey,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify'],
    );
    const signed = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
    const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64urlToBytes(parts[2]), signed);
    if (!ok) return null;
    const payload = JSON.parse(bytesToString(b64urlToBytes(parts[1]))) as {
      iss?: string;
      aud?: string | string[];
      exp?: number;
      email?: string;
      email_verified?: boolean;
    };
    const now = Math.floor(Date.now() / 1000);
    if (!payload.exp || payload.exp < now) return null;
    if (payload.iss !== 'accounts.google.com' && payload.iss !== 'https://accounts.google.com') return null;
    const aud = payload.aud;
    const clientId = env.GOOGLE_CLIENT_ID || '';
    const audOk = aud === clientId || (Array.isArray(aud) && aud.includes(clientId));
    if (!audOk) return null;
    if (payload.email_verified !== true || !payload.email) return null;
    const email = payload.email.toLowerCase();
    if (!allowedEmails(env.ALLOWED_EMAILS).includes(email)) return null;
    return email;
  } catch {
    return null;
  }
}
