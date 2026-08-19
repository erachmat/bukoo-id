import { eq } from 'drizzle-orm';
import { subscriptions } from '@bukoo/db';
import type { createDb } from '../db/index.js';

/**
 * Resolve the user's active subscription tier from D1.
 * ACTIVE/TRIALING subscriptions grant their plan tier; anything else → FREE.
 */
export async function getUserTier(userId: string, db: ReturnType<typeof createDb>): Promise<string> {
  const sub = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.userId, userId),
  });
  if (sub && (sub.status === 'ACTIVE' || sub.status === 'TRIALING')) {
    return sub.planId.replace('plan_', '').toUpperCase();
  }
  return 'FREE';
}
