import { NextResponse, type NextRequest } from "next/server";
import {
  clearAuthCookieHeaders,
  logoutRedirectUrl,
} from "@/lib/logout-cookies";

/**
 * Deterministic sign-out endpoint (see `lib/logout-cookies.ts` for the
 * rationale — the NextAuth server-action path drops Set-Cookie headers on
 * Cloudflare Workers, so logout didn't actually clear the session cookie).
 *
 * Builds the 303 response by hand: unconditional cookie expiry + redirect.
 * GET is safe here because JWT strategy has no server-side session to revoke.
 * `Cache-Control: no-store` ensures no intermediary ever caches the redirect.
 *
 * The middleware matcher excludes `/api`, so this handler runs outside the
 * auth middleware entirely.
 */
function handle(req: NextRequest): NextResponse {
  const redirectTo = req.nextUrl.searchParams.get("redirectTo");
  const res = NextResponse.redirect(
    logoutRedirectUrl(redirectTo, req.nextUrl.origin),
    303,
  );
  res.headers.set("Cache-Control", "no-store");
  for (const cookie of clearAuthCookieHeaders()) {
    res.headers.append("Set-Cookie", cookie);
  }
  return res;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  return handle(req);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  return handle(req);
}
