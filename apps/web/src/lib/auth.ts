import NextAuth from 'next-auth';
import { authConfig } from '../auth.config';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { users } from '@bukoo/db';

/**
 * Password verification using SubtleCrypto PBKDF2.
 * Must match the algorithm used in apps/api/src/lib/password.ts.
 *
 * Hash format: base64(salt):base64(derivedKey)
 */
async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltB64, hashB64] = stored.split(':');
  if (!saltB64 || !hashB64) return false;

  const salt = Uint8Array.from(atob(saltB64), (c) => c.charCodeAt(0));
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 100_000 },
    keyMaterial,
    256,
  );
  const derived = btoa(String.fromCharCode(...new Uint8Array(bits)));
  return derived === hashB64;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  // @auth/drizzle-adapter handles accounts/sessions/verificationTokens tables
  adapter: DrizzleAdapter(db),
  callbacks: {
    ...authConfig.callbacks,
    // Role is a custom field on the users table. On a fresh sign-in (user is
    // present), read the current role straight from the DB so OAuth logins
    // (whose adapter user object may not carry custom fields) get the correct
    // role instead of silently defaulting to "USER". Only queries when a
    // sign-in occurs (Node runtime) — the edge middleware never triggers it.
    async jwt(params) {
      const { token, user } = params;
      if (user) {
        try {
          const dbUser = await db.query.users.findFirst({
            where: eq(users.id, (user as { id?: string }).id ?? ''),
          });
          token.role = dbUser?.role || "USER";
        } catch {
          token.role = (user as { role?: string }).role || "USER";
        }
      }
      return token;
    },
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.query.users.findFirst({
          where: eq(users.email, (credentials.email as string).toLowerCase()),
        });

        if (!user || !user.password) return null;

        const isValid = await verifyPassword(credentials.password as string, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
});
