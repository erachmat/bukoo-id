/**
 * Deterministic logout cookie/redirect helpers.
 *
 * Why this exists: the NextAuth server-action sign-out path (303 redirect from
 * a Server Action) delivers its `Set-Cookie` expiry headers unreliably on
 * Cloudflare Workers, leaving the session JWT cookie alive — a publisher could
 * click "Keluar", land on the public landing page, then click "Masuk" and be
 * bounced straight back to the dashboard without re-authenticating (JWT
 * strategy has no server-side session to revoke; cookie expiry is the only
 * lever). The `/api/logout` route handler builds its own response with full
 * header control; the header-building logic lives here as pure functions so
 * vitest can cover it without a worker.
 */

/** Cookie names that may hold the NextAuth JWT session + CSRF tokens. The
 * `__Secure-` prefix variants are set on HTTPS hosts (publisher.bukoo.id,
 * bukoo.id); the plain variants are the non-secure fallback (localhost). */
export const LOGOUT_COOKIE_NAMES = [
  "__Secure-authjs.session-token",
  "__Secure-authjs.csrf-token",
  "authjs.session-token",
  "authjs.csrf-token",
] as const;

/** Where a publisher sign-out lands: the public landing page with the
 * `logout=1` marker consumed by middleware (bypasses the logged-in-publisher
 * bounce — see `publisher-landing-guard.ts`). */
export const DEFAULT_LOGOUT_REDIRECT = "/publisher/daftar?logout=1";

/** Same-site relative-path check — mirrors `safeCallbackUrl` semantics
 * (auth-helpers.ts is framework-free too, but duplicating the two-line rule
 * here keeps this module dependency-free for edge + tests). */
function isSafeRelativePath(raw: string): boolean {
  return (
    raw.startsWith("/") &&
    !raw.startsWith("//") &&
    !raw.includes("\\") &&
    !raw.includes(":")
  );
}

/**
 * `Set-Cookie` header strings that expire every NextAuth auth cookie.
 * `Secure` is emitted only for the `__Secure-` variants (browsers reject
 * clearing a `__Secure-` cookie without the attribute, and reject `Secure`
 * on plain hosts like localhost, so the two pairs stay symmetric).
 */
export function clearAuthCookieHeaders(): string[] {
  return LOGOUT_COOKIE_NAMES.map((name) => {
    const parts = [
      `${name}=`,
      "Path=/",
      "Max-Age=0",
      "HttpOnly",
      "SameSite=Lax",
    ];
    if (name.startsWith("__Secure-")) parts.push("Secure");
    return parts.join("; ");
  });
}

/**
 * Resolve the `Location` target for the logout response. Accepts only
 * same-site relative paths (no open redirect); anything else — including
 * `null`/empty — falls back to the publisher landing default.
 *
 * @param rawRedirect value of the `redirectTo` query param (may be null)
 * @param origin request origin, e.g. `https://publisher.bukoo.id`
 */
export function logoutRedirectUrl(
  rawRedirect: string | null,
  origin: string,
): string {
  const target =
    rawRedirect && isSafeRelativePath(rawRedirect)
      ? rawRedirect
      : DEFAULT_LOGOUT_REDIRECT;
  return new URL(target, origin).toString();
}
