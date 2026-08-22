'use server';

import { signIn as nextAuthSignIn, signOut as nextAuthSignOut } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { users } from '@bukoo/db';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createId } from '@paralleldrive/cuid2';
import {
  safeCallbackUrl,
  defaultRedirectForRole,
  DEFAULT_CUSTOMER_HOME,
  DEFAULT_PUBLISHER_HOME,
} from '@/lib/auth-helpers';

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
  } catch (error: unknown) {
    const err = error as { type?: string };
    if (err.type === 'CredentialsSignin') {
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
  const redirectTo = safeCallbackUrl(formData.get('callbackUrl'), DEFAULT_CUSTOMER_HOME);
  try {
    await nextAuthSignIn('google', { redirectTo });
  } catch (error: unknown) {
    rethrowRedirect(error);
  }
}

export async function signOut(options?: { redirectTo?: string }) {
  await nextAuthSignOut({ redirectTo: options?.redirectTo ?? '/' });
}

export async function resetPassword(formData: FormData) {
  const email = ((formData.get('email') as string) ?? '').toLowerCase().trim();
  const newPassword = (formData.get('password') as string) ?? '';

  if (newPassword.length < 6) {
    return redirect('/forgot-password?error=PASSWORD_TOO_SHORT');
  }

  const db = getDb();
  const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!existing) {
    // Generic (anti-enumeration): do not reveal whether the email is registered.
    return redirect('/forgot-password?error=RESET_FAILED');
  }

  const hashedPassword = await hashPassword(newPassword);
  await db.update(users).set({ password: hashedPassword }).where(eq(users.email, email));

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
