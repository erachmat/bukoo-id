/**
 * Password hashing using the Web Crypto SubtleCrypto API (PBKDF2).
 *
 * WHY NOT bcryptjs:
 *   bcryptjs relies on Node.js crypto internals that fail inside Cloudflare Workers
 *   even with nodejs_compat enabled. SubtleCrypto is natively available in all
 *   Workers runtimes and produces cryptographically sound results.
 *
 * Algorithm: PBKDF2-SHA256 with 100,000 iterations + 16-byte random salt.
 * Cost: ~3–5ms per operation in Workers — acceptable and under the 50ms CPU limit.
 *
 * Hash format: base64(salt):base64(derivedKey)
 */

const ITERATIONS = 100_000;
const HASH_ALGO  = 'SHA-256';
const KEY_LENGTH = 256; // bits

/**
 * Hashes a plaintext password. Returns a storable string.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const bits = await derive(password, salt);
  return `${uint8ToBase64(salt)}:${uint8ToBase64(new Uint8Array(bits))}`;
}

/**
 * Verifies a plaintext password against a stored hash produced by hashPassword().
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltB64, hashB64] = stored.split(':');
  if (!saltB64 || !hashB64) return false;
  const salt = base64ToUint8(saltB64);
  const bits = await derive(password, salt);
  return uint8ToBase64(new Uint8Array(bits)) === hashB64;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function derive(password: string, salt: Uint8Array): Promise<ArrayBuffer> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  return crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: HASH_ALGO, salt, iterations: ITERATIONS },
    keyMaterial,
    KEY_LENGTH,
  );
}

function uint8ToBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

function base64ToUint8(b64: string): Uint8Array {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}
