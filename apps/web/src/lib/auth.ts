import NextAuth from 'next-auth';
import { authConfig } from '../auth.config';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { getDb, type Database } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { users, accounts, sessions, verificationTokens } from '@bukoo/db';

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

// The NextAuth Drizzle adapter needs a db instance at module scope, but the D1
// binding is only available per-request on Workers. Use a lazy proxy that
// resolves getDb() on each method access. The prototype chain carries a class
// branded with drizzle's SQLite entity kind so the adapter's `is(db,
// BaseSQLiteDatabase)` construction check passes without touching a binding.
const entityKind = Symbol.for('drizzle:entityKind');
class AdapterDbBrand {}
Object.defineProperty(AdapterDbBrand, entityKind, { value: 'BaseSQLiteDatabase' });

const adapterDb = new Proxy(Object.create(AdapterDbBrand.prototype), {
  get(_target, prop) {
    // Avoid resolving the binding for structural reads at construction time.
    if (prop === 'dialect') return { name: 'sqlite' };
    const db = getDb();
    const value = Reflect.get(db, prop, db);
    return typeof value === 'function' ? value.bind(db) : value;
  },
}) as unknown as Database;

// The adapter's schema types require Auth.js's exact default shapes (e.g.
// `sessionToken` as PK) which our tables don't fully mirror structurally,
// though they work at runtime. Pin the adapter's generic to our SQLite db
// (instantiation expression) and cast the mapping through its schema type —
// no deep package imports, no `any`.
const sqliteDrizzleAdapter = DrizzleAdapter<Database>;
type SqliteAdapterSchema = NonNullable<Parameters<typeof sqliteDrizzleAdapter>[1]>;

const authSchema = {
  usersTable: users,
  accountsTable: accounts,
  sessionsTable: sessions,
  verificationTokensTable: verificationTokens,
} as unknown as SqliteAdapterSchema;

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  // @auth/drizzle-adapter handles accounts/sessions/verificationTokens tables.
  // The shared schema uses plural table names (users/accounts/sessions/
  // verification_tokens) — map them explicitly so OAuth hits the real tables.
  adapter: DrizzleAdapter(adapterDb, authSchema),
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
          const db = getDb();
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

        const db = getDb();
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
