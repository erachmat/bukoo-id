'use server';

import { signIn as nextAuthSignIn, signOut as nextAuthSignOut } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { users, otpTokens } from '@bukoo/db';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { cookies, headers } from 'next/headers';
import { createId } from '@paralleldrive/cuid2';
import {
  safeCallbackUrl,
  defaultRedirectForRole,
  DEFAULT_CUSTOMER_HOME,
  DEFAULT_PUBLISHER_HOME,
} from '@/lib/auth-helpers';
import {
  d1LimiterStorage,
  checkRateLimit,
  recordFailure,
  recordSuccess,
  RATE_LIMIT_POLICIES,
  rateLimitKey,
  getRequestIp,
} from '@/lib/rate-limit';
import { generateOtpCode, otpExpiryMs, isOtpExpired } from '@/lib/otp';
import { sendOtpEmail } from '@/lib/mail';

// ---------------------------------------------------------------------------
// Password hashing — SubtleCrypto PBKDF2
// Must match apps/api/src/lib/password.ts
// ---------------------------------------------------------------------------

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 100_000 }, keyMaterial, 256,
  );
  const saltB64 = btoa(String.fromCharCode(...salt));
  const hashB64 = btoa(String.fromCharCode(...new Uint8Array(bits)));
  return `${saltB64}:${hashB64}`;
}

// ---------------------------------------------------------------------------
// Helpers (sync helpers live in @/lib/auth-helpers — NOT exportable from here)
// ---------------------------------------------------------------------------

/** Server-side mirror of the register form's client validation. */
function validateSignUp(name: string, email: string, password: string): string | null {
  if (!name) return 'NAME_REQUIRED';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'EMAIL_INVALID';
  if (password.length < 6) return 'PASSWORD_TOO_SHORT';
  return null;
}

function rethrowRedirect(error: unknown): never {
  const err = error as { message?: string };
  if (err.message === 'NEXT_REDIRECT') {
    revalidatePath('/', 'layout');
    throw error;
  }
  throw error;
}

// ---------------------------------------------------------------------------
// Rate limiting helpers (D1-backed, see @/lib/rate-limit)
// ---------------------------------------------------------------------------

const limiter = d1LimiterStorage();

/** Resolves the caller IP (headers only — testable) for IP-scoped policies. */
async function ipHeaders(): Promise<{ get(name: string): string | null }> {
  const h = await headers();
  return { get: (name: string) => h.get(name) };
}

/** Redirect to `path` with the RATE_LIMITED error key. */
function redirectRateLimited(path: string): never {
  return redirect(`${path}?error=RATE_LIMITED`);
}

/** Read-only lock check — returns true when the key is currently locked out. */
async function isBlockedFor(key: string): Promise<boolean> {
  return !(await checkRateLimit(limiter, Date.now(), key)).allowed;
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export async function signUp(formData: FormData) {
  const email = ((formData.get('email') as string) ?? '').toLowerCase().trim();
  const password = (formData.get('password') as string) ?? '';
  const name = ((formData.get('name') as string) ?? '').trim();
  const callbackUrl = safeCallbackUrl(formData.get('callbackUrl'), DEFAULT_CUSTOMER_HOME);

  const validationError = validateSignUp(name, email, password);
  if (validationError) {
    return redirect(`/register?error=${validationError}&email=${encodeURIComponent(email)}`);
  }

  // Per-IP register throttle: 5 registrations/hour/IP → 1h lockout.
  const ip = await getRequestIp(await ipHeaders());
  const ipKey = rateLimitKey('registerIp', 'ip', ip);
  if (await isBlockedFor(ipKey)) {
    return redirectRateLimited('/register');
  }

  const db = getDb();
  const existing = await db.query.users.findFirst({ where: eq(users.email, email) });

  if (existing) {
    return redirect(`/register?error=EMAIL_TAKEN&email=${encodeURIComponent(email)}`);
  }

  const hashedPassword = await hashPassword(password);

  await db.insert(users).values({
    id: createId(),
    email,
    password: hashedPassword,
    name,
  });
  // New account created from this IP — count it.
  await recordFailure(limiter, Date.now(), RATE_LIMIT_POLICIES.registerIp, ipKey);

  try {
    await nextAuthSignIn('credentials', { email, password, redirectTo: callbackUrl });
  } catch (error: unknown) {
    const err = error as { type?: string };
    if (err.type === 'CredentialsSignin') {
      return redirect('/login?error=SIGNUP_SIGNIN_FAILED');
    }
    rethrowRedirect(error);
  }
}

export async function signIn(formData: FormData) {
  const email = ((formData.get('email') as string) ?? '').toLowerCase().trim();
  const password = (formData.get('password') as string) ?? '';

  // Login lockout: 5 fails/15min per email → 15min lock; 10 fails/15min per IP
  // → 1h lock. Checked BEFORE the role lookup + signIn so locked accounts/IPs
  // never even reach PBKDF2.
  const now = Date.now();
  const ip = await getRequestIp(await ipHeaders());
  const emailKey = rateLimitKey('loginEmail', 'email', email);
  const ipKey = rateLimitKey('loginIp', 'ip', ip);
  if (await isBlockedFor(emailKey)) return redirectRateLimited('/login');
  if (await isBlockedFor(ipKey)) return redirectRateLimited('/login');

  // Role-aware default so PUBLISHER/ADMIN land on their dashboards without a
  // middleware double-hop (credentials sign-in knows the email up front).
  let defaultRedirect = DEFAULT_CUSTOMER_HOME;
  try {
    const db = getDb();
    const user = await db.query.users.findFirst({ where: eq(users.email, email) });
    defaultRedirect = user ? defaultRedirectForRole(user.role) : DEFAULT_CUSTOMER_HOME;
  } catch {
    defaultRedirect = DEFAULT_CUSTOMER_HOME;
  }
  const redirectTo = safeCallbackUrl(formData.get('callbackUrl'), defaultRedirect);

  try {
    await nextAuthSignIn('credentials', { email, password, redirectTo });
    // Successful credentials sign-in — clear the email counter so a future
    // streak of wrong-password attempts starts clean.
    await recordSuccess(limiter, now, emailKey);
  } catch (error: unknown) {
    const err = error as { type?: string };
    if (err.type === 'CredentialsSignin') {
      // Failed credentials attempt — count against email + IP.
      await recordFailure(limiter, now, RATE_LIMIT_POLICIES.loginEmail, emailKey);
      await recordFailure(limiter, now, RATE_LIMIT_POLICIES.loginIp, ipKey);

      // Distinguish Google-only (passwordless) accounts for clearer UX copy.
      try {
        const db = getDb();
        const user = await db.query.users.findFirst({ where: eq(users.email, email) });
        if (user && !user.password) {
          return redirect('/login?error=PASSWORDLESS');
        }
      } catch {
        // fall through to the generic credentials error
      }
      return redirect('/login?error=CredentialsSignin');
    }
    rethrowRedirect(error);
  }
}

export async function signInWithGoogle(formData: FormData) {
  // Per-IP throttle on the Google handoff too (same as login-ip policy).
  const now = Date.now();
  const ip = await getRequestIp(await ipHeaders());
  const ipKey = rateLimitKey('loginIp', 'ip', ip);
  if (await isBlockedFor(ipKey)) return redirectRateLimited('/login');

  const redirectTo = safeCallbackUrl(formData.get('callbackUrl'), DEFAULT_CUSTOMER_HOME);
  try {
    await nextAuthSignIn('google', { redirectTo });
  } catch (error: unknown) {
    rethrowRedirect(error);
  }
}

export async function signOut(options?: { redirectTo?: string }) {
  // Hardening: NextAuth's own cookie clearing can be unreliable on Cloudflare
  // Workers, leaving the JWT session cookie behind (see AGENTS.md). Explicitly
  // expire the session/CSRF cookies here. This must run BEFORE nextAuthSignOut,
  // which throws the redirect; the mutations are flushed onto its 303 response.
  const cookieStore = await cookies();
  const clearCookies: Array<[name: string, secure: boolean]> = [
    // Secure variant (HTTPS hosts like publisher.bukoo.id). A bare delete()
    // would omit the `Secure` attribute, so browsers reject clearing a
    // `__Secure-`-prefixed cookie.
    ['__Secure-authjs.session-token', true],
    ['__Secure-authjs.csrf-token', true],
    // Non-secure fallback.
    ['authjs.session-token', false],
    ['authjs.csrf-token', false],
  ];
  for (const [name, secure] of clearCookies) {
    cookieStore.set(name, '', {
      path: '/',
      maxAge: 0,
      httpOnly: true,
      secure,
      sameSite: 'lax',
    });
  }

  // Defense-in-depth: if the NextAuth sign-out itself fails on Workers
  // (anything other than its expected NEXT_REDIRECT), fall back to a plain
  // redirect so the caller still navigates away. Publisher sign-out buttons
  // no longer use this action — they hit /api/logout, which builds its own
  // Set-Cookie headers deterministically (see lib/logout-cookies.ts).
  try {
    await nextAuthSignOut({ redirectTo: options?.redirectTo ?? '/' });
  } catch (error: unknown) {
    const err = error as { digest?: string; message?: string };
    const isRedirect =
      err?.digest?.startsWith('NEXT_REDIRECT') ||
      err?.message === 'NEXT_REDIRECT';
    if (!isRedirect) {
      revalidatePath('/', 'layout');
      redirect(options?.redirectTo ?? '/');
    }
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Forgot-password — two-step OTP flow (2026-08-29)
// Replaces the previous unauthenticated reset which allowed account takeover
// (any email + new password ⇒ password changed with zero verification).
// Mirrors apps/api /v1/auth/forgot-password + /reset-password using the shared
// `otp_tokens` table and MailChannels email.
// ---------------------------------------------------------------------------

export async function requestPasswordReset(formData: FormData) {
  const email = ((formData.get('email') as string) ?? '').toLowerCase().trim();

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return redirect('/forgot-password?error=EMAIL_INVALID');
  }

  // OTP request throttle: 3/15min per email, 5/1h per IP.
  const now = Date.now();
  const ip = await getRequestIp(await ipHeaders());
  const emailKey = rateLimitKey('otpRequestEmail', 'email', email);
  const ipKey = rateLimitKey('otpRequestIp', 'ip', ip);
  if (await isBlockedFor(emailKey)) return redirectRateLimited('/forgot-password');
  if (await isBlockedFor(ipKey)) return redirectRateLimited('/forgot-password');
  // Count the request (even for unknown emails) so the anti-enumeration
  // response path is also throttled.
  await recordFailure(limiter, now, RATE_LIMIT_POLICIES.otpRequestEmail, emailKey);
  await recordFailure(limiter, now, RATE_LIMIT_POLICIES.otpRequestIp, ipKey);

  const db = getDb();
  const existing = await db.query.users.findFirst({ where: eq(users.email, email) });

  if (existing) {
    const code = generateOtpCode();
    const expiresAt = otpExpiryMs(now);

    // One active OTP per email — replace any previous code.
    await db.delete(otpTokens).where(eq(otpTokens.email, email));
    await db.insert(otpTokens).values({
      id: createId(),
      email,
      code,
      expiresAt,
    });

    // Fire-and-forget: a mail failure must never fail the generic response.
    sendOtpEmail(email, code).catch((err) =>
      console.error('[requestPasswordReset] Email send failed:', err),
    );
  }

  // ALWAYS the same generic success (anti-enumeration — matches the API).
  return redirect(
    `/forgot-password?step=code&email=${encodeURIComponent(email)}&message=OTP_SENT`,
  );
}

export async function verifyPasswordReset(formData: FormData) {
  const email = ((formData.get('email') as string) ?? '').toLowerCase().trim();
  const code = ((formData.get('code') as string) ?? '').trim();
  const newPassword = (formData.get('password') as string) ?? '';

  if (newPassword.length < 6) {
    return redirect(
      `/forgot-password?step=code&email=${encodeURIComponent(email)}&error=PASSWORD_TOO_SHORT`,
    );
  }

  // OTP verify throttle: 5 tries/15min per email → 15min lock.
  const now = Date.now();
  const emailKey = rateLimitKey('otpVerifyEmail', 'email', email);
  if (await isBlockedFor(emailKey)) return redirectRateLimited('/forgot-password');

  const db = getDb();
  const record = await db.query.otpTokens.findFirst({ where: eq(otpTokens.email, email) });

  if (!record || record.code !== code) {
    await recordFailure(limiter, now, RATE_LIMIT_POLICIES.otpVerifyEmail, emailKey);
    return redirect(
      `/forgot-password?step=code&email=${encodeURIComponent(email)}&error=OTP_INVALID`,
    );
  }
  if (isOtpExpired(record.expiresAt, now)) {
    await db.delete(otpTokens).where(eq(otpTokens.id, record.id));
    await recordFailure(limiter, now, RATE_LIMIT_POLICIES.otpVerifyEmail, emailKey);
    return redirect(
      `/forgot-password?step=code&email=${encodeURIComponent(email)}&error=OTP_EXPIRED`,
    );
  }

  const hashedPassword = await hashPassword(newPassword);
  await db.update(users).set({ password: hashedPassword }).where(eq(users.email, email));
  await db.delete(otpTokens).where(eq(otpTokens.id, record.id));
  await recordSuccess(limiter, now, emailKey);

  return redirect('/login?message=RESET_DONE');
}

// ---------------------------------------------------------------------------
// Publisher sign-up — creates the account with the PUBLISHER role immediately
// (user decision 2026-08-20). Same validation as customer signUp.
// ---------------------------------------------------------------------------

export async function signUpPublisher(formData: FormData) {
  const email = ((formData.get('email') as string) ?? '').toLowerCase().trim();
  const password = (formData.get('password') as string) ?? '';
  const name = ((formData.get('name') as string) ?? '').trim();
  const callbackUrl = safeCallbackUrl(formData.get('callbackUrl'), DEFAULT_PUBLISHER_HOME);

  const validationError = validateSignUp(name, email, password);
  if (validationError) {
    return redirect(`/publisher/register?error=${validationError}&email=${encodeURIComponent(email)}`);
  }

  // Same per-IP register throttle as customer signUp.
  const ip = await getRequestIp(await ipHeaders());
  const ipKey = rateLimitKey('registerIp', 'ip', ip);
  if (await isBlockedFor(ipKey)) {
    return redirectRateLimited('/publisher/register');
  }

  const db = getDb();
  const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (existing) {
    return redirect(`/publisher/register?error=EMAIL_TAKEN&email=${encodeURIComponent(email)}`);
  }

  const hashedPassword = await hashPassword(password);

  await db.insert(users).values({
    id: createId(),
    email,
    password: hashedPassword,
    name,
    role: 'PUBLISHER',
  });
  await recordFailure(limiter, Date.now(), RATE_LIMIT_POLICIES.registerIp, ipKey);

  try {
    await nextAuthSignIn('credentials', { email, password, redirectTo: callbackUrl });
  } catch (error: unknown) {
    const err = error as { type?: string };
    if (err.type === 'CredentialsSignin') {
      return redirect('/publisher/login?error=SIGNUP_SIGNIN_FAILED');
    }
    rethrowRedirect(error);
  }
}
