import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { deviceTokens } from '@bukoo/db';
import { createDb } from '../db/index.js';
import { createId } from '../lib/cuid.js';
import { authMiddleware } from '../middleware/auth.js';
import type { Env } from '../types/env.js';

const notifications = new Hono<{ Bindings: Env }>();
notifications.use('*', authMiddleware);

const deviceTokenSchema = z.object({
  token: z.string().min(1).max(500),
  /** 'ANDROID' | 'IOS' */
  platform: z.enum(['ANDROID', 'IOS']),
  deviceId: z.string().min(1).max(200),
});

// ---------------------------------------------------------------------------
// POST /v1/notifications/device-token — register (or re-point) a push token
// ---------------------------------------------------------------------------

notifications.post('/device-token', zValidator('json', deviceTokenSchema), async (c) => {
  const db = createDb(c.env.DB);
  const userId = c.get('userId');
  const { token, platform, deviceId } = c.req.valid('json');

  const existing = await db.query.deviceTokens.findFirst({
    where: eq(deviceTokens.deviceId, deviceId),
  });

  if (existing) {
    // Re-point the device to the current account (handles re-login on same device).
    await db
      .update(deviceTokens)
      .set({ userId, token, platform, updatedAt: new Date().toISOString() })
      .where(eq(deviceTokens.id, existing.id));
  } else {
    await db.insert(deviceTokens).values({ id: createId(), userId, token, platform, deviceId });
  }

  return c.json({ success: true });
});

// ---------------------------------------------------------------------------
// DELETE /v1/notifications/device-token — remove a registered token
// ---------------------------------------------------------------------------

notifications.delete(
  '/device-token',
  zValidator('json', z.object({ deviceId: z.string().min(1) })),
  async (c) => {
    const db = createDb(c.env.DB);
    const userId = c.get('userId');
    const { deviceId } = c.req.valid('json');

    await db
      .delete(deviceTokens)
      .where(and(eq(deviceTokens.deviceId, deviceId), eq(deviceTokens.userId, userId)));

    return c.json({ success: true });
  },
);

export default notifications;
