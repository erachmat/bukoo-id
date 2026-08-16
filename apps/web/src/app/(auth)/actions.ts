'use server';

import { signIn as nextAuthSignIn, signOut as nextAuthSignOut } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { users } from '@bukoo/db';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createId } from '@paralleldrive/cuid2';

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
// Actions
// ---------------------------------------------------------------------------

export async function signUp(formData: FormData) {
  const email = (formData.get('email') as string).toLowerCase();
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;

  const db = getDb();
  const existing = await db.query.users.findFirst({ where: eq(users.email, email) });

  if (existing) {
    return redirect(
      `/register?error=${encodeURIComponent('Email ini sudah terdaftar. Silakan masuk atau gunakan email lain.')}`,
    );
  }

  const hashedPassword = await hashPassword(password);

  await db.insert(users).values({
    id: createId(),
    email,
    password: hashedPassword,
    name,
  });

  try {
    await nextAuthSignIn('credentials', { email, password, redirectTo: '/library' });
  } catch (error: unknown) {
    const err = error as { type?: string; message?: string };
    if (err.type === 'CredentialsSignin') {
      return redirect(`/login?error=${encodeURIComponent('Pendaftaran berhasil, silakan masuk secara manual.')}`);
    }
    if (err.message === 'NEXT_REDIRECT') {
      revalidatePath('/', 'layout');
      throw error;
    }
    throw error;
  }
}

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    await nextAuthSignIn('credentials', { email, password, redirectTo: '/library' });
  } catch (error: unknown) {
    const err = error as { type?: string; message?: string };
    if (err.type === 'CredentialsSignin') {
      return redirect(`/login?error=${encodeURIComponent('Email atau password salah.')}`);
    }
    if (err.message === 'NEXT_REDIRECT') {
      revalidatePath('/', 'layout');
      throw error;
    }
    return redirect(`/login?error=${encodeURIComponent('Terjadi kesalahan. Silakan coba lagi.')}`);
  }
}

export async function signOut() {
  await nextAuthSignOut({ redirectTo: '/' });
}

export async function resetPassword(formData: FormData) {
  const email = (formData.get('email') as string).toLowerCase();
  const newPassword = formData.get('password') as string;

  const db = getDb();
  const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!existing) {
    return redirect(`/forgot-password?error=${encodeURIComponent('Email tidak ditemukan.')}`);
  }

  const hashedPassword = await hashPassword(newPassword);
  await db.update(users).set({ password: hashedPassword }).where(eq(users.email, email));

  return redirect(`/login?message=${encodeURIComponent('Kata sandi berhasil diperbarui. Silakan masuk.')}`);
}

export async function signInWithGoogle() {
  try {
    await nextAuthSignIn('google', { redirectTo: '/library' });
  } catch (error: unknown) {
    const err = error as { message?: string };
    if (err.message === 'NEXT_REDIRECT') {
      revalidatePath('/', 'layout');
      throw error;
    }
    throw error;
  }
}
