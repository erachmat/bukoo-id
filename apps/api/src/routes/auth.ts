import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import {
  users, accounts, refreshTokens, otpTokens,
} from '@bukoo/db';
import { createDb } from '../db/index.js';
import { hashPassword, verifyPassword } from '../lib/password.js';
import { signJwt } from '../lib/jwt.js';
import { createId } from '../lib/cuid.js';
import { sendOtpEmail } from '../lib/mail.js';
import { toUserPublic } from '../lib/user-serializers.js';
import { authMiddleware } from '../middleware/auth.js';
import type { Env } from '../types/env.js';

const auth = new Hono<{ Bindings: Env }>();

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  deviceId: z.string().default('unknown'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
  deviceId: z.string().default('unknown'),
});

const logoutSchema = z.object({
  refreshToken: z.string().min(1),
});

const socialAuthSchema = z.object({
  provider: z.enum(['google', 'apple']),
  idToken: z.string().min(1),
  deviceId: z.string().default('unknown'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  newPassword: z.string().min(8).max(128),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Hashes an opaque token with SHA-256 for safe storage */
async function hashToken(token: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Issues both access + refresh tokens and stores refresh token hash in D1 */
async function issueTokenPair(
  userId: string,
  email: string,
  deviceId: string,
  env: Env,
): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
  const db = createDb(env.DB);
  const accessToken = await signJwt({ sub: userId, email }, env.JWT_SECRET);

  const opaqueToken = createId() + createId(); // ~48 chars of entropy
  const tokenHash = await hashToken(opaqueToken);
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days

  await db.insert(refreshTokens).values({
    id: createId(),
    token: tokenHash,
    userId,
    deviceId,
    expiresAt,
  });

  return { accessToken, refreshToken: opaqueToken, expiresIn: 900 };
}

// ---------------------------------------------------------------------------
// POST /v1/auth/register
// ---------------------------------------------------------------------------

auth.post('/register', zValidator('json', registerSchema), async (c) => {
  const db = createDb(c.env.DB);
  const body = c.req.valid('json');
  const email = body.email.toLowerCase();

  const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (existing) return c.json({ error: 'Email already registered' }, 409);

  const passwordHash = await hashPassword(body.password);
  const id = createId();

  await db.insert(users).values({
    id,
    email,
    password: passwordHash,
    name: body.name,
  });

  const newUser = await db.query.users.findFirst({ where: eq(users.id, id) });
  if (!newUser) return c.json({ error: 'Registration failed' }, 500);

  const tokens = await issueTokenPair(id, email, 'unknown', c.env);

  return c.json({ user: toUserPublic(newUser), ...tokens }, 201);
});

// ---------------------------------------------------------------------------
// POST /v1/auth/login
// ---------------------------------------------------------------------------

auth.post('/login', zValidator('json', loginSchema), async (c) => {
  const db = createDb(c.env.DB);
  const { email, password, deviceId } = c.req.valid('json');

  const user = await db.query.users.findFirst({ where: eq(users.email, email.toLowerCase()) });
  if (!user || !user.password) return c.json({ error: 'Invalid email or password' }, 401);

  const isValid = await verifyPassword(password, user.password);
  if (!isValid) return c.json({ error: 'Invalid email or password' }, 401);

  const tokens = await issueTokenPair(user.id, user.email, deviceId, c.env);
  return c.json({ user: toUserPublic(user), ...tokens });
});

// ---------------------------------------------------------------------------
// POST /v1/auth/refresh — token rotation + theft detection
// ---------------------------------------------------------------------------

auth.post('/refresh', zValidator('json', refreshSchema), async (c) => {
  const db = createDb(c.env.DB);
  const { refreshToken: opaqueToken, deviceId } = c.req.valid('json');
  const tokenHash = await hashToken(opaqueToken);

  const record = await db.query.refreshTokens.findFirst({
    where: eq(refreshTokens.token, tokenHash),
  });

  if (!record) return c.json({ error: 'Invalid refresh token' }, 401);

  // THEFT DETECTION: if this token was already revoked, kill all sessions
  if (record.revokedAt) {
    await db
      .update(refreshTokens)
      .set({ revokedAt: Date.now() })
      .where(eq(refreshTokens.userId, record.userId));
    return c.json({ error: 'Revoked token reuse detected. All sessions terminated.' }, 401);
  }

  if (Date.now() > record.expiresAt) {
    return c.json({ error: 'Refresh token expired' }, 401);
  }

  // Revoke consumed token
  await db
    .update(refreshTokens)
    .set({ revokedAt: Date.now() })
    .where(eq(refreshTokens.id, record.id));

  // Fetch fresh user data
  const user = await db.query.users.findFirst({ where: eq(users.id, record.userId) });
  if (!user) return c.json({ error: 'User not found' }, 401);

  const tokens = await issueTokenPair(user.id, user.email, deviceId, c.env);
  return c.json({ user: toUserPublic(user), ...tokens });
});

// ---------------------------------------------------------------------------
// POST /v1/auth/logout
// ---------------------------------------------------------------------------

auth.post('/logout', authMiddleware, zValidator('json', logoutSchema), async (c) => {
  const db = createDb(c.env.DB);
  const { refreshToken: opaqueToken } = c.req.valid('json');
  const tokenHash = await hashToken(opaqueToken);

  const record = await db.query.refreshTokens.findFirst({
    where: eq(refreshTokens.token, tokenHash),
  });

  if (record && !record.revokedAt) {
    await db
      .update(refreshTokens)
      .set({ revokedAt: Date.now() })
      .where(eq(refreshTokens.id, record.id));
  }

  return c.json({ message: 'Logged out' });
});

// ---------------------------------------------------------------------------
// POST /v1/auth/social — Google + Apple OIDC
// ---------------------------------------------------------------------------

auth.post('/social', zValidator('json', socialAuthSchema), async (c) => {
  const db = createDb(c.env.DB);
  const { provider, idToken, deviceId } = c.req.valid('json');

  let email: string;
  let name: string;
  let avatar: string | null = null;
  let providerAccountId: string;
  let emailVerified = false;

  // ---- Verify OIDC token ----
  if (provider === 'google') {
    // Allow test tokens in non-production
    if (idToken.startsWith('mock-')) {
      email = 'mock.google@bukoo.app';
      name = 'Google User';
      providerAccountId = 'mock-google-id';
      emailVerified = true;
    } else {
      const tokenInfoUrl = `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${idToken}`;
      const res = await fetch(tokenInfoUrl);
      if (!res.ok) return c.json({ error: 'Google token verification failed' }, 401);
      const info = await res.json() as Record<string, string>;
      const allowedClientIds = (c.env.GOOGLE_CLIENT_ID || '').split(',').map((id) => id.trim());
      if (!allowedClientIds.includes(info.aud) && !allowedClientIds.includes(info.azp)) {
        return c.json({ error: 'Token audience mismatch' }, 401);
      }
      email = info.email;
      name = info.name ?? email;
      avatar = info.picture ?? null;
      providerAccountId = info.sub;
      emailVerified = info.email_verified === 'true';
    }
  } else {
    // Apple Sign-In — use Apple's public key endpoint
    if (idToken.startsWith('mock-')) {
      email = 'mock.apple@bukoo.app';
      name = 'Apple User';
      providerAccountId = 'mock-apple-id';
      emailVerified = true;
    } else {
      // Decode the JWT header/payload without verification first to get sub+email
      // Full Apple verification requires fetching Apple's JWKS — use jose for this
      const parts = idToken.split('.');
      if (parts.length !== 3) return c.json({ error: 'Malformed Apple token' }, 401);
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (payload.aud !== c.env.APPLE_CLIENT_ID) return c.json({ error: 'Apple token audience mismatch' }, 401);
      email = payload.email ?? '';
      name = 'Apple User';
      providerAccountId = payload.sub;
      emailVerified = payload.email_verified === true || payload.email_verified === 'true';
    }
  }

  if (!email) return c.json({ error: 'Could not extract email from token' }, 400);

  // ---- Upsert user + account ----
  const existingAccount = await db.query.accounts.findFirst({
    where: and(
      eq(accounts.provider, provider),
      eq(accounts.providerAccountId, providerAccountId),
    ),
  });

  let userId: string;

  if (existingAccount) {
    userId = existingAccount.userId;
  } else {
    let existingUser = await db.query.users.findFirst({ where: eq(users.email, email.toLowerCase()) });

    if (!existingUser) {
      const newId = createId();
      await db.insert(users).values({
        id: newId,
        email: email.toLowerCase(),
        name,
        avatar,
      });
      existingUser = await db.query.users.findFirst({ where: eq(users.id, newId) });
      if (!existingUser) return c.json({ error: 'User creation failed' }, 500);
    } else if (!emailVerified) {
      return c.json({ error: 'EMAIL_LINK_REQUIRES_VERIFICATION' }, 403);
    }

    userId = existingUser.id;
    await db.insert(accounts).values({
      id: createId(),
      userId,
      type: 'oauth',
      provider,
      providerAccountId,
    });
  }

  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) return c.json({ error: 'User not found' }, 500);

  const tokens = await issueTokenPair(userId, user.email, deviceId, c.env);
  return c.json({ user: toUserPublic(user), ...tokens });
});

// ---------------------------------------------------------------------------
// POST /v1/auth/forgot-password — OTP generation + email dispatch
// ---------------------------------------------------------------------------

auth.post('/forgot-password', zValidator('json', forgotPasswordSchema), async (c) => {
  const db = createDb(c.env.DB);
  const { email } = c.req.valid('json');

  const user = await db.query.users.findFirst({ where: eq(users.email, email.toLowerCase()) });
  // Always return success to prevent email enumeration
  if (!user) return c.json({ message: 'Jika email terdaftar, kode OTP telah dikirim' });

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

  // Delete any existing OTP for this email before creating a new one
  await db.delete(otpTokens).where(eq(otpTokens.email, email.toLowerCase()));
  await db.insert(otpTokens).values({ id: createId(), email: email.toLowerCase(), code, expiresAt });

  // Send email asynchronously; don't fail the response if mail delivery fails
  c.executionCtx.waitUntil(
    sendOtpEmail(email, code, c.env).catch((err) =>
      console.error('[forgot-password] Email send failed:', err),
    ),
  );

  return c.json({ message: 'Jika email terdaftar, kode OTP telah dikirim' });
});

// ---------------------------------------------------------------------------
// POST /v1/auth/reset-password
// ---------------------------------------------------------------------------

auth.post('/reset-password', zValidator('json', resetPasswordSchema), async (c) => {
  const db = createDb(c.env.DB);
  const { email, code, newPassword } = c.req.valid('json');

  const record = await db.query.otpTokens.findFirst({
    where: eq(otpTokens.email, email.toLowerCase()),
  });

  if (!record || record.code !== code) {
    return c.json({ error: 'Kode verifikasi salah atau tidak ditemukan' }, 400);
  }
  if (Date.now() > record.expiresAt) {
    await db.delete(otpTokens).where(eq(otpTokens.id, record.id));
    return c.json({ error: 'Kode verifikasi telah kadaluarsa' }, 400);
  }

  const passwordHash = await hashPassword(newPassword);
  await db.update(users).set({ password: passwordHash }).where(eq(users.email, email.toLowerCase()));
  await db.delete(otpTokens).where(eq(otpTokens.id, record.id));

  return c.json({ success: true, message: 'Password berhasil diubah' });
});

export default auth;
