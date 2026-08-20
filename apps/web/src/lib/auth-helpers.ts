// Auth helpers shared by server actions and auth pages.
// NOTE: this is a plain module (NOT 'use server') — sync helper functions
// cannot be exported from a 'use server' file (all exports must be async).

export const DEFAULT_CUSTOMER_HOME = '/library';
export const DEFAULT_PUBLISHER_HOME = '/publisher/dashboard';
export const DEFAULT_ADMIN_HOME = '/admin';

/** Post-login default per role (explicit callbackUrl always wins in the actions). */
export function defaultRedirectForRole(role: string | null | undefined): string {
  if (role === 'PUBLISHER') return DEFAULT_PUBLISHER_HOME;
  if (role === 'ADMIN') return DEFAULT_ADMIN_HOME;
  return DEFAULT_CUSTOMER_HOME;
}

/**
 * Sanitize a callbackUrl from form data. Only same-site relative paths are
 * allowed (must start with a single "/", no protocol-relative "//", no scheme
 * colon, no backslash). Anything else falls back to `fallback` — prevents
 * open-redirect via the sign-in redirectTo.
 */
export function safeCallbackUrl(raw: unknown, fallback: string): string {
  if (typeof raw !== 'string' || raw.length === 0) return fallback;
  if (!raw.startsWith('/') || raw.startsWith('//')) return fallback;
  if (raw.includes('\\') || raw.includes(':')) return fallback;
  return raw;
}
