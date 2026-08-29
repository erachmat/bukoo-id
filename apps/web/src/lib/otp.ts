/**
 * OTP helpers for the web password-reset flow.
 * Kept pure (no D1) so the 6-digit format and expiry boundary are unit-tested.
 */

export const OTP_TTL_MS = 15 * 60_000; // 15 minutes, mirrors apps/api

/** Generates a cryptographically-random 6-digit code (padded, e.g. "004827"). */
export function generateOtpCode(): string {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return (buf[0] % 1_000_000).toString().padStart(6, '0');
}

/** True when the OTP expiry timestamp (Unix ms) is in the past. */
export function isOtpExpired(expiresAtMs: number, nowMs: number): boolean {
  return nowMs > expiresAtMs;
}

/** Resolves the default 15-minute expiry timestamp from a "now" seed. */
export function otpExpiryMs(nowMs: number): number {
  return nowMs + OTP_TTL_MS;
}