/**
 * Guard used by `apps/web/src/middleware.ts` to decide whether an authenticated
 * PUBLISHER hitting a public landing page on the publisher host should be
 * bounced to the dashboard.
 *
 * The sign-out flow redirects to `/publisher/daftar?logout=1`. Because JWT
 * session-cookie clearing can be unreliable on Cloudflare Workers (see
 * AGENTS.md), the `logout` marker must bypass the bounce so the user actually
 * lands on the landing page even if the session cookie hasn't been fully
 * cleared yet. The marker only relaxes a cosmetic UX rule (the landing page is
 * public), so it is intentionally forgeable with no security impact.
 */
export function shouldBouncePublisherFromLanding(opts: {
  isPublisherHost: boolean;
  userRole?: string;
  pathname: string;
  isLogoutLanding: boolean;
}): boolean {
  const { isPublisherHost, userRole, pathname, isLogoutLanding } = opts;

  // The bounce is scoped to the publisher host (publisher.bukoo.id).
  if (!isPublisherHost) return false;

  // Sign-out redirect: land on the (public) landing page even if the session
  // cookie wasn't cleared yet.
  if (pathname === "/publisher/daftar" && isLogoutLanding) return false;

  return (
    userRole === "PUBLISHER" &&
    (pathname === "/" || pathname === "/daftar" || pathname === "/publisher/daftar")
  );
}
