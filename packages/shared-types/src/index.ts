/**
 * @bukoo/shared-types — single source of truth for DTOs shared by the API, web,
 * and mobile apps. Every DTO mirrors the EXACT shape returned by apps/api (see
 * apps/api/src/routes/*). Keep this file in sync when the API changes.
 */

// ── Subscription tiers ────────────────────────────────────────────────────

/** Canonical subscription tier values — must match D1 `subscriptionRequired` column + web Tier. */
export type SubscriptionTier = 'FREE' | 'PELAJAR' | 'PERSONAL' | 'PLUS' | 'FAMILY' | 'PREMIUM';

/** Ordered from lowest to highest access. */
export const TIER_ORDER: SubscriptionTier[] = ['FREE', 'PELAJAR', 'PERSONAL', 'PLUS', 'FAMILY', 'PREMIUM'];

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

  const userIndex = TIER_ORDER.indexOf(userTier as SubscriptionTier);
  const requiredIndex = TIER_ORDER.indexOf(requiredTier as SubscriptionTier);

  const userRank = userIndex === -1 ? 0 : userIndex;
  const requiredRank = requiredIndex === -1 ? 0 : requiredIndex;

  return userRank >= requiredRank;
}

// ── Books ─────────────────────────────────────────────────────────────────

/** Exact shape of `formatBook()` in apps/api/src/routes/books.ts (all book routes). */
export interface BookDto {
  id: string;
  title: string;
  author: string;
  publisher: string;
  description: string;
  synopsis: string;
  /** R2 object key — the public URL is built client-side via getCoverUrl(). */
  coverKey: string | null;
  epubKey: string | null;
  genre: string[];
  tags: string[];
  language: string;
  publishedYear: number;
  totalPages: number;
  ratingAverage: number;
  ratingCount: number;
  readCount: number;
  readTimeMinutes: number;
  isPublished: boolean;
  subscriptionRequired: SubscriptionTier;
  createdAt: string;
  updatedAt: string;
  /** snake_case — part of the real payload. */
  is_accessible: boolean;
  progress_percent: number;
  shelf_status: string | null;
}

/** Shape of GET /v1/books/featured. */
export interface BookFeaturedResponse {
  continue_reading: BookDto[];
  editors_choice: BookDto[];
  trending: BookDto[];
  new_releases: BookDto[];
}

/** Shape of GET /v1/books/recommendations items. */
export interface BookRecommendationDto extends BookDto {
  matchPercent: number;
  isGenreMatch: boolean;
  aiReason: string;
}

// ── Users ─────────────────────────────────────────────────────────────────

/** Shape of the user object in /v1/auth/* responses (toUserPublic). */
export interface AuthUserDto {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: string;
  onboardingCompleted: boolean;
  createdAt: string;
}

/** Nested subscription object returned by /v1/users/me. */
export interface UserSubscriptionDto {
  active: boolean;
  tier: string;
  planId: string;
  expiresAt: string | null;
  status: string;
  paymentGateway: string | null;
}

/** Shape of GET/PATCH /v1/users/me (serializeUser). */
export interface UserDto extends AuthUserDto {
  favoriteGenres: string[];
  subscription: UserSubscriptionDto | null;
}

// ── Reading ───────────────────────────────────────────────────────────────

/** Flat recent-progress item from GET /v1/reading/recent (+ GET /v1/reading/progress). */
export interface ReadingProgressRecentDto {
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  /** Resolved URL (buildCoverUrl). */
  bookCoverUrl: string | null;
  progressPercent: number;
  currentPage: number;
  totalPages: number;
  lastReadAt: string;
}

/** Raw reading_progress row (GET /v1/reading/progress/:bookId). */
export interface ReadingProgressRowDto {
  id: string;
  userId: string;
  bookId: string;
  progressPercent: number;
  currentPage: number;
  totalPages: number;
  cfiPosition: string | null;
  readingTimeMinutes: number;
  readingTimeSeconds: number;
  lastReadAt: string;
  updatedAt: string;
}

/** Raw highlights row. */
export interface HighlightDto {
  id: string;
  userId: string;
  bookId: string;
  cfiRange: string;
  text: string;
  color: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Raw bookmarks row. */
export interface BookmarkDto {
  id: string;
  userId: string;
  bookId: string;
  cfi: string;
  chapterTitle: string | null;
  progress: number | null;
  createdAt: string;
}

// ── Goals ─────────────────────────────────────────────────────────────────

/** Raw reading_goals row (GET/PUT /v1/goals). */
export interface GoalDto {
  id: string;
  userId: string;
  dailyGoalMinutes: number;
}

/** Raw reading_streaks row (GET /v1/goals/streaks). */
export interface StreakRowDto {
  id: string;
  userId: string;
  date: string;
  minutesRead: number;
  goalMet: boolean;
}

/** POST /v1/goals/record response. */
export interface RecordGoalResponseDto {
  date: string;
  minutesRead: number;
  goalMet: boolean;
}

/** GET /v1/goals/streak/current response. */
export interface CurrentStreakDto {
  currentStreak: number;
}

/** GET /v1/goals/books-this-year response. */
export interface BooksThisYearDto {
  booksReadThisYear: number;
}

// ── Community ─────────────────────────────────────────────────────────────

export type CommunityPostType = 'REVIEW' | 'QUOTE' | 'DISCUSSION' | 'RECOMMENDATION';

export interface CommunityUserDto {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface CommunityBookDto {
  id: string;
  title: string;
  author: string;
  coverUrl: string | null;
}

export interface CommunityPostDto {
  id: string;
  type: CommunityPostType;
  content: string;
  bookId: string | null;
  likeCount: number;
  commentCount: number;
  bookmarkCount: number;
  likedByMe: boolean;
  bookmarkedByMe: boolean;
  createdAt: string;
  user: CommunityUserDto;
  book: CommunityBookDto | null;
}

export interface CommunityPostsPageDto {
  items: CommunityPostDto[];
  nextCursor: string | null;
}

export interface CommunityCommentDto {
  id: string;
  content: string;
  createdAt: string;
  user: CommunityUserDto;
}

export interface CommunityEventDto {
  id: string;
  title: string;
  description: string | null;
  bookId: string | null;
  startDate: string;
  endDate: string;
  targetProgressPercent: number;
  joinCount: number;
  joinedByMe: boolean;
  book: CommunityBookDto | null;
}
