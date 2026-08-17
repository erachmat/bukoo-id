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

  return c.json({
    id: user.id,
    name: user.name ?? '',
    email: user.email,
    avatarUrl: user.avatar,
    role: user.role,
    onboardingCompleted: user.onboardingCompleted,
    createdAt: user.createdAt,
    subscription,
  });
});

// ---------------------------------------------------------------------------
// PATCH /v1/users/me
// ---------------------------------------------------------------------------

const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatar: z.string().url().optional().nullable(),
  onboardingCompleted: z.boolean().optional(),
});

usersRouter.patch('/me', zValidator('json', updateUserSchema), async (c) => {
  const db = createDb(c.env.DB);
  const userId = c.get('userId');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0) {
    return c.json({ error: 'No fields to update' }, 400);
  }

  await db.update(users).set(updates).where(eq(users.id, userId));

  const updated = await db.query.users.findFirst({ where: eq(users.id, userId) });
  const sub = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.userId, userId),
  });
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

  return c.json({
    id: updated!.id,
    name: updated!.name ?? '',
    email: updated!.email,
    avatarUrl: updated!.avatar,
    role: updated!.role,
    onboardingCompleted: updated!.onboardingCompleted,
    createdAt: updated!.createdAt,
    subscription,
  });
});

export default usersRouter;
