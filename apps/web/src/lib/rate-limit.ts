/**
 * D1-backed rate limiting + lockout for web auth actions.
 *
 * Why D1 and not the Cloudflare Rate Limiting binding: the binding only exists
 * on deployed Workers, and this repo develops locally via `wrangler dev`
 * (no binding). A small `auth_attempts` table in the shared D1 database works
 * everywhere and survives Workers isolate restarts (unlike in-memory state).
 *
 * Design notes:
 *  - Increments happen in the server actions (`recordFailure`), and
 *    `authorize()` (NextAuth) only *reads* (`isBlocked`) — this avoids
 *    double-counting a single bad login attempt via both paths.
 *  - IPs are stored as a SHA-256 hash prefix, not raw, for privacy.
 */

import { eq, sql } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { getDb } from '@/lib/db';
import { authAttempts } from '@bukoo/db';

// ---------------------------------------------------------------------------
// Core (pure, injectable — unit-testable without D1)
// ---------------------------------------------------------------------------

/** In-memory shape mirroring a row of `auth_attempts`. */
export interface AuthAttemptRow {
  attempts: number;
  /** Unix ms — start of the current attempt window. */
  windowStart: number;
  /** Unix ms — non-null while locked out. */
  lockedUntil: number | null;
}

/** Storage abstraction so tests can run with an in-memory map. */
export interface LimiterStorage {
  get(key: string): Promise<AuthAttemptRow | undefined>;
  write(key: string, row: AuthAttemptRow): Promise<void>;
}

export interface RateLimitPolicy {
  /** Failed attempts allowed per window before locking. */
  maxAttempts: number;
  /** Sliding window length in ms. */
  windowMs: number;
  /** Lockout duration in ms once maxAttempts is exceeded. */
  lockMs: number;
}

/**
 * All auth rate-limit policies in one place (tunable constants).
 * Key format helpers: `rateLimitKey('loginEmail', 'email', 'a@b.c')`.
 */
export const RATE_LIMIT_POLICIES = {
  loginEmail: { maxAttempts: 5, windowMs: 15 * 60_000, lockMs: 15 * 60_000 },
  loginIp: { maxAttempts: 10, windowMs: 15 * 60_000, lockMs: 60 * 60_000 },
  registerIp: { maxAttempts: 5, windowMs: 60 * 60_000, lockMs: 60 * 60_000 },
  otpRequestEmail: { maxAttempts: 3, windowMs: 15 * 60_000, lockMs: 15 * 60_000 },
  otpRequestIp: { maxAttempts: 5, windowMs: 60 * 60_000, lockMs: 60 * 60_000 },
  otpVerifyEmail: { maxAttempts: 5, windowMs: 15 * 60_000, lockMs: 15 * 60_000 },
} as const satisfies Record<string, RateLimitPolicy>;

export type RateLimitPolicyName = keyof typeof RATE_LIMIT_POLICIES;

/** Builds a deterministic storage key: `<policy>:<scope>:<identifier>`. */
export function rateLimitKey(
  policy: RateLimitPolicyName,
  scope: 'email' | 'ip',
  identifier: string,
): string {
  return `${policy}:${scope}:${identifier.toLowerCase()}`;
}

export interface RateLimitResult {
  allowed: boolean;
  /** 0 when allowed; ms until the lock lifts when blocked. */
  retryAfterMs: number;
}

/** Read-only check — does NOT mutate counters. Used pre-action and by authorize(). */
export async function checkRateLimit(
  storage: LimiterStorage,
  now: number,
  key: string,
): Promise<RateLimitResult> {
  const row = await storage.get(key);
  if (!row) return { allowed: true, retryAfterMs: 0 };
  if (row.lockedUntil !== null && now < row.lockedUntil) {
    return { allowed: false, retryAfterMs: row.lockedUntil - now };
  }
  // Lock expired (or absent) — allowed; recordFailure will open a new window.
  return { allowed: true, retryAfterMs: 0 };
}

/** Convenience bool wrapper over checkRateLimit. */
export async function isBlocked(storage: LimiterStorage, now: number, key: string): Promise<boolean> {
  return !(await checkRateLimit(storage, now, key)).allowed;
}

/** Record a failed attempt, respecting the sliding window, and lock when exceeded. */
export async function recordFailure(
  storage: LimiterStorage,
  now: number,
  policy: RateLimitPolicy,
  key: string,
): Promise<void> {
  const row = await storage.get(key);
  if (!row) {
    await storage.write(key, {
      attempts: 1,
      windowStart: now,
      lockedUntil: policy.maxAttempts <= 1 ? now + policy.lockMs : null,
    });
    return;
  }
  // Already locked — keep the original lock (do not extend).
  if (row.lockedUntil !== null && now < row.lockedUntil) return;
  // Window expired — start a fresh window rather than keep growing.
  if (now >= row.windowStart + policy.windowMs) {
    await storage.write(key, {
      attempts: 1,
      windowStart: now,
      lockedUntil: policy.maxAttempts <= 1 ? now + policy.lockMs : null,
    });
    return;
  }
  const attempts = row.attempts + 1;
  await storage.write(key, {
    attempts,
    windowStart: row.windowStart,
    lockedUntil: attempts >= policy.maxAttempts ? now + policy.lockMs : null,
  });
}

/** Clear the counter after a successful auth (e.g. correct login/reset). */
export async function recordSuccess(storage: LimiterStorage, now: number, key: string): Promise<void> {
  await storage.write(key, { attempts: 0, windowStart: now, lockedUntil: null });
}

// ---------------------------------------------------------------------------
// D1 adapter
// ---------------------------------------------------------------------------

/** Upserts `auth_attempts` via the request-scoped D1 handle from getDb(). */
export function d1LimiterStorage(): LimiterStorage {
  return {
    async get(key) {
      const db = getDb();
      const row = await db.query.authAttempts.findFirst({ where: eq(authAttempts.key, key) });
      if (!row) return undefined;
      return {
        attempts: row.attempts,
        windowStart: row.windowStart,
        lockedUntil: row.lockedUntil,
      };
    },
    async write(key, row) {
      const db = getDb();
      await db
        .insert(authAttempts)
        .values({
          id: createId(),
          key,
          attempts: row.attempts,
          windowStart: row.windowStart,
          lockedUntil: row.lockedUntil,
        })
        .onConflictDoUpdate({
          target: authAttempts.key,
          set: {
            attempts: row.attempts,
            windowStart: row.windowStart,
            lockedUntil: row.lockedUntil,
            updatedAt: sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`,
          },
        });
    },
  };
}

// ---------------------------------------------------------------------------
// Request IP helper
// ---------------------------------------------------------------------------

/** Minimal header reader so this stays testable outside a request scope. */
export interface HeaderReader {
  get(name: string): string | null;
}

/**
 * Resolves the client IP from Cloudflare/proxy headers and returns a
 * deterministic SHA-256 hex prefix (first 32 hex chars) so raw IPs are not
 * stored in D1.
 */
export async function getRequestIp(headers: HeaderReader): Promise<string> {
  const cf = headers.get('cf-connecting-ip');
  const fwd = headers.get('x-forwarded-for');
  const raw = (cf ?? fwd?.split(',')[0]?.trim() ?? 'unknown').toLowerCase();
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(`bukoo-auth:${raw}`),
  );
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 32);
}