/** Canonical subscription tier values — must match D1 schema `subscriptionRequired` column values */
export type SubscriptionTier = 'FREE' | 'PELAJAR' | 'PERSONAL' | 'PLUS' | 'FAMILY';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  /** Uppercase tier string matching SubscriptionTier */
  subscriptionTier: SubscriptionTier | string;
  onboardingCompleted: boolean;
  createdAt: string; // ISO 8601 string
}

export interface Book {
  id: string;
  title: string;
  author: string;
  /**
   * R2 object key for the cover image.
   * Callers construct the public URL from this key.
   * @example "covers/abc123.jpg"
   */
  coverKey: string | null;
  /** @deprecated Use coverKey — will be removed after R2 migration is complete */
  coverUrl?: string;
  genre: string[]; // stored as JSON text in D1; serialized/deserialized in API layer
  language: string;
  rating: number; // e.g. 4.8
  totalPages: number;
  readTimeMinutes: number;
}

export interface ReadingProgress {
  bookId: string;
  currentPage: number;
  totalPages: number;
  progressPercent: number; // e.g. 23.5 (percentage from 0 to 100)
  cfiPosition: string | null; // CFI format for EPUB positioning
  readingTimeMinutes: number;
  lastReadAt: string; // ISO 8601 string
}

export interface Subscription {
  id: string;
  planId: string;
  status: 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED' | 'PENDING_PAYMENT' | string;
  currentPeriodEnd: string; // ISO 8601 string
  cancelAtPeriodEnd: boolean;
}

/**
 * Ordered list of subscription tiers from lowest to highest access.
 * PREMIUM is kept at the end for legacy compatibility — new tiers use FAMILY as the highest.
 */
export const TIER_ORDER = ['FREE', 'PELAJAR', 'PERSONAL', 'PLUS', 'FAMILY', 'PREMIUM'];

/**
 * Determines if a user's subscription tier gives them access to a book's required tier.
 * @param userSubscriptionTier The subscription tier of the user (e.g. 'FREE', 'PERSONAL', etc.). If null or invalid, defaults to 'FREE'.
 * @param bookRequiredTier The subscription tier required by the book.
 */
export function isBookAccessible(
  userSubscriptionTier: string | null | undefined,
  bookRequiredTier: string,
): boolean {
  const userTier = (userSubscriptionTier || 'FREE').toUpperCase();
  const requiredTier = bookRequiredTier.toUpperCase();

  const userIndex = TIER_ORDER.indexOf(userTier);
  const requiredIndex = TIER_ORDER.indexOf(requiredTier);

  const userRank = userIndex === -1 ? 0 : userIndex;
  const requiredRank = requiredIndex === -1 ? 0 : requiredIndex;

  return userRank >= requiredRank;
}
