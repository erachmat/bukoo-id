import { eq } from 'drizzle-orm';
import { subscriptions } from '@bukoo/db';
import { isBookAccessible, type SubscriptionTier } from '@bukoo/shared-types';
import type { Database } from '@/lib/db';

/**
 * Shared subscription-tier helpers for the web app.
 *
 * Consolidates the (previously copy-pasted) subscription lookup + tier
 * derivation used by the book detail page, the reader page, and the
 * EPUB download route — all must agree on what "premium" means.
 *
 * NOTE: imports `Database` as a type-only symbol so this module stays
 * side-effect free (no runtime import of @opennextjs/cloudflare).
 */
export type SubscriptionRow = {
  status: string;
  planId: string;
  currentPeriodEnd: string | null;
};

/** Canonical tier — from @bukoo/shared-types (matches TIER_ORDER + D1 tiers). */
export type Tier = SubscriptionTier;

const ACTIVE_STATUSES = new Set(['ACTIVE', 'TRIALING']);

/**
 * Derive the user's effective subscription tier from their `subscriptions` row.
 * Only ACTIVE/TRIALING subscriptions grant entitlement; anything else → FREE.
 */
export function tierFromSubscription(
  sub: { status: string; planId: string } | null | undefined,
): Tier {
  if (!sub || !ACTIVE_STATUSES.has(sub.status)) return 'FREE';
  const tier = sub.planId.replace('plan_', '').toUpperCase() as Tier;
  return tier === 'FREE' ? 'FREE' : tier;
}

/**
 * Fetch a user's subscription row from D1 and derive their effective tier.
 * Convenience for route handlers that already have `db`.
 */
export async function getUserTierFromDb(
  userId: string,
  db: Database,
): Promise<Tier> {
  const sub = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.userId, userId),
  });
  return tierFromSubscription(sub);
}

/**
 * True if the user (given their subscription row) may read a book requiring
 * `requiredTier`. Free books are always readable when authenticated.
 */
export function canReadBook(
  sub: { status: string; planId: string } | null | undefined,
  requiredTier: string,
): boolean {
  return isBookAccessible(tierFromSubscription(sub), requiredTier);
}