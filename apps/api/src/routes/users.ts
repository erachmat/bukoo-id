import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { users, subscriptions } from '@bukoo/db';
import { createDb } from '../db/index.js';
import { authMiddleware } from '../middleware/auth.js';
import type { Env } from '../types/env.js';

const usersRouter = new Hono<{ Bindings: Env }>();
usersRouter.use('*', authMiddleware);

/** Favorite genres are stored as a JSON text column; parse defensively on read. */
function parseFavoriteGenres(raw: string | null): string[] {
  try {
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((g): g is string => typeof g === 'string') : [];
  } catch {
    return [];
  }
}

function serializeUser(
  user: {
    id: string;
    name: string | null;
    email: string;
    avatar: string | null;
    role: string;
    onboardingCompleted: boolean;
    favoriteGenres: string | null;
    createdAt: string;
  },
  sub: {
    planId: string;
    currentPeriodEnd: string | null;
    status: string;
    paymentGateway: string | null;
  } | null,
) {
  const active = !!sub && (sub.status === 'ACTIVE' || sub.status === 'TRIALING');
  const subscription = sub
    ? {
        active,
        tier: active ? sub.planId.replace('plan_', '').toUpperCase() : 'FREE',
        planId: sub.planId,
        expiresAt: sub.currentPeriodEnd ?? null,
        status: sub.status,
        paymentGateway: sub.paymentGateway ?? null,
      }
    : null;

  return {
    id: user.id,
    name: user.name ?? '',
    email: user.email,
    avatarUrl: user.avatar,
    role: user.role,
    onboardingCompleted: user.onboardingCompleted,
    favoriteGenres: parseFavoriteGenres(user.favoriteGenres),
    createdAt: user.createdAt,
    subscription,
  };
}

// ---------------------------------------------------------------------------
// GET /v1/users/me
// ---------------------------------------------------------------------------

usersRouter.get('/me', async (c) => {
  const db = createDb(c.env.DB);
  const userId = c.get('userId');

  const [user, sub] = await Promise.all([
    db.query.users.findFirst({ where: eq(users.id, userId) }),
    db.query.subscriptions.findFirst({ where: eq(subscriptions.userId, userId) }),
  ]);
  if (!user) return c.json({ error: 'User not found' }, 404);

  return c.json(serializeUser(user, sub ?? null));
});

// ---------------------------------------------------------------------------
// PATCH /v1/users/me
// ---------------------------------------------------------------------------

const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatar: z.string().url().optional().nullable(),
  /** Alias for `avatar` — matches the mobile client's payload field name. */
  avatarUrl: z.string().url().optional().nullable(),
  onboardingCompleted: z.boolean().optional(),
  favoriteGenres: z.array(z.string().min(1).max(50)).max(10).optional(),
});

usersRouter.patch('/me', zValidator('json', updateUserSchema), async (c) => {
  const db = createDb(c.env.DB);
  const userId = c.get('userId');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0) {
    return c.json({ error: 'No fields to update' }, 400);
  }

  const set: Record<string, unknown> = {};
  if (updates.name !== undefined) set.name = updates.name;
  if (updates.avatar !== undefined) set.avatar = updates.avatar;
  if (updates.avatarUrl !== undefined) set.avatar = updates.avatarUrl;
  if (updates.onboardingCompleted !== undefined) set.onboardingCompleted = updates.onboardingCompleted;
  if (updates.favoriteGenres !== undefined) set.favoriteGenres = JSON.stringify(updates.favoriteGenres);

  await db.update(users).set(set).where(eq(users.id, userId));

  const updated = await db.query.users.findFirst({ where: eq(users.id, userId) });
  const sub = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.userId, userId),
  });
  if (!updated) return c.json({ error: 'User not found' }, 404);

  return c.json(serializeUser(updated, sub ?? null));
});

export default usersRouter;
