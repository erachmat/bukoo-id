export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  subscriptionTier: 'free' | 'premium' | 'vip' | string;
  onboardingCompleted: boolean;
  createdAt: string; // ISO 8601 string representation of Date
}

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  genre: string[];
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
  lastReadAt: string; // ISO 8601 string representation of Date
}

export interface Subscription {
  id: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | string;
  currentPeriodEnd: string; // ISO 8601 string representation of Date
  cancelAtPeriodEnd: boolean;
}

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
