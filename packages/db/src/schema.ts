/**
 * @bukoo/db — Drizzle SQLite schema for Cloudflare D1
 *
 * This is the single source of truth for all Bukoo database tables.
 * Both apps/api (Workers) and apps/web (Vercel Node via D1 HTTP) import from here.
 *
 * SQLite notes:
 *  - No native enums  → text columns with TypeScript union types
 *  - No native arrays → JSON text columns (genre, tags, features)
 *  - No native Date   → text ISO-8601 strings or integer unix timestamps
 *  - No native Float  → real()
 *  - No native Bool   → integer() 0/1
 *  - cuid() IDs       → generated in application layer via @paralleldrive/cuid2
 */

import {
  sqliteTable,
  text,
  integer,
  real,
  index,
  uniqueIndex,
  primaryKey,
} from 'drizzle-orm/sqlite-core';
import { sql, relations } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns the current UTC timestamp as an ISO-8601 string for SQLite defaults */
const now = () => sql<string>`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`;

// ---------------------------------------------------------------------------
// users
// ---------------------------------------------------------------------------

export const users = sqliteTable('users', {
  id:                  text('id').primaryKey(),
  email:               text('email').notNull().unique(),
  password:            text('password'),
  avatar:              text('avatar'),
  /** NextAuth field — maps to the adapter's `image` property. */
  image:               text('image'),
  /** NextAuth field — timestamp of verified email (nullable). */
  emailVerified:       integer('email_verified', { mode: 'timestamp_ms' }),
  name:                text('name'),
  /** 'USER' | 'ADMIN' | 'CONTENT_MANAGER' | 'PUBLISHER' */
  role:                text('role').notNull().default('USER'),
  onboardingCompleted: integer('onboarding_completed', { mode: 'boolean' }).notNull().default(false),
  /** Favorite reading genres — JSON text array e.g. '["Fiksi","Agama"]' */
  favoriteGenres:      text('favorite_genres').notNull().default('[]'),
  createdAt:           text('created_at').notNull().default(now()),
  updatedAt:           text('updated_at').notNull().default(now()),
});

// ---------------------------------------------------------------------------
// NextAuth tables (required by @auth/drizzle-adapter)
// ---------------------------------------------------------------------------

export const accounts = sqliteTable(
  'accounts',
  {
    // $defaultFn (client-side) so the @auth/drizzle-adapter's linkAccount()
    // insert (which omits `id`) succeeds on D1 — a bare TEXT PRIMARY KEY with
    // no default fails with NOT NULL constraint (SQLITE_CONSTRAINT 7500).
    id:                text('id').primaryKey().$defaultFn(() => createId()),
    userId:            text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    type:              text('type').notNull(),
    provider:          text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    refresh_token:     text('refresh_token'),
    access_token:      text('access_token'),
    expires_at:        integer('expires_at'),
    token_type:        text('token_type'),
    scope:             text('scope'),
    id_token:          text('id_token'),
    session_state:     text('session_state'),
  },
  (t) => [
    uniqueIndex('accounts_provider_provider_account_id_idx').on(t.provider, t.providerAccountId),
  ],
);

export const sessions = sqliteTable('sessions', {
  // $defaultFn (client-side) so the adapter's createSession() insert (which
  // omits `id`) succeeds on D1, mirroring the accounts.id fix above.
  id:           text('id').primaryKey().$defaultFn(() => createId()),
  sessionToken: text('session_token').notNull().unique(),
  userId:       text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires:      integer('expires').notNull(), // Unix ms timestamp
});

export const verificationTokens = sqliteTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token:      text('token').notNull().unique(),
    expires:    integer('expires').notNull(), // Unix ms timestamp
  },
  (t) => [
    uniqueIndex('verification_tokens_identifier_token_idx').on(t.identifier, t.token),
  ],
);

// ---------------------------------------------------------------------------
// books
// ---------------------------------------------------------------------------

export const books = sqliteTable('books', {
  id:                  text('id').primaryKey(),
  title:               text('title').notNull(),
  author:              text('author').notNull(),
  publisher:           text('publisher'),
  description:         text('description'),
  synopsis:            text('synopsis'),
  isbn:                text('isbn').unique(),
  /**
   * R2 object key for the cover image (e.g. "covers/abc123.jpg").
   * Construct the full URL from the R2 public domain + this key.
   */
  coverKey:            text('cover_key'),
  /**
   * R2 object key for the EPUB file (e.g. "epubs/abc123.epub").
   * Used by GET /v1/books/:id/download to stream from BUKOO_STORAGE binding.
   */
  epubKey:             text('epub_key'),
  /** JSON-serialized string[] — parse with JSON.parse() */
  genre:               text('genre').notNull().default('[]'),
  /** JSON-serialized string[] */
  tags:                text('tags').notNull().default('[]'),
  /** 'ID' | 'EN' */
  language:            text('language').notNull().default('ID'),
  publishedYear:       integer('published_year'),
  totalPages:          integer('total_pages'),
  readCount:           integer('read_count').notNull().default(0),
  ratingAverage:       real('rating_average').notNull().default(0),
  ratingCount:         integer('rating_count').notNull().default(0),
  readTimeMinutes:     integer('read_time_minutes').notNull().default(0),
  isPublished:         integer('is_published', { mode: 'boolean' }).notNull().default(false),
  /**
   * Publication workflow status.
   * 'DRAFT' | 'IN_REVIEW' | 'PUBLISHED' | 'UNPUBLISHED' | 'REJECTED'
   * `isPublished` remains the public-read compatibility flag; public queries
   * continue to require `is_published = 1` until all callers migrate.
   */
  publicationStatus:   text('publication_status').notNull().default('DRAFT'),
  isAvailableOffline:  integer('is_available_offline', { mode: 'boolean' }).notNull().default(false),
  /**
   * Minimum subscription tier required to access this book.
   * 'FREE' | 'PELAJAR' | 'PERSONAL' | 'PLUS' | 'FAMILY'
   * Used with isBookAccessible() from @bukoo/shared-types.
   */
  subscriptionRequired: text('subscription_required').notNull().default('FREE'),
  publisherUserId:     text('publisher_user_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt:           text('created_at').notNull().default(now()),
  updatedAt:           text('updated_at').notNull().default(now()),
});

// ---------------------------------------------------------------------------
// readingProgress
// ---------------------------------------------------------------------------

export const readingProgress = sqliteTable(
  'reading_progress',
  {
    id:                 text('id').primaryKey(),
    userId:             text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    bookId:             text('book_id').notNull().references(() => books.id, { onDelete: 'cascade' }),
    progressPercent:    real('progress_percent').notNull().default(0),
    currentPage:        integer('current_page').notNull().default(0),
    totalPages:         integer('total_pages').notNull().default(0),
    cfiPosition:        text('cfi_position'),
    readingTimeMinutes: integer('reading_time_minutes').notNull().default(0),
    readingTimeSeconds: integer('reading_time_seconds').notNull().default(0),
    lastReadAt:         text('last_read_at').notNull().default(now()),
    updatedAt:          text('updated_at').notNull().default(now()),
  },
  (t) => [
    uniqueIndex('reading_progress_user_book_idx').on(t.userId, t.bookId),
  ],
);

// ---------------------------------------------------------------------------
// highlights
// ---------------------------------------------------------------------------

export const highlights = sqliteTable(
  'highlights',
  {
    id:        text('id').primaryKey(),
    userId:    text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    bookId:    text('book_id').notNull().references(() => books.id, { onDelete: 'cascade' }),
    cfiRange:  text('cfi_range').notNull(),
    text:      text('text').notNull(),
    color:     text('color').notNull().default('rgba(250,204,21,0.4)'),
    note:      text('note'),
    createdAt: text('created_at').notNull().default(now()),
    updatedAt: text('updated_at').notNull().default(now()),
  },
  (t) => [
    index('highlights_user_book_idx').on(t.userId, t.bookId),
  ],
);

// ---------------------------------------------------------------------------
// bookmarks
// ---------------------------------------------------------------------------

export const bookmarks = sqliteTable(
  'bookmarks',
  {
    id:           text('id').primaryKey(),
    userId:       text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    bookId:       text('book_id').notNull().references(() => books.id, { onDelete: 'cascade' }),
    cfi:          text('cfi').notNull(),
    chapterTitle: text('chapter_title'),
    progress:     real('progress').notNull().default(0),
    createdAt:    text('created_at').notNull().default(now()),
  },
  (t) => [
    index('bookmarks_user_book_idx').on(t.userId, t.bookId),
  ],
);

// ---------------------------------------------------------------------------
// libraryShelves + shelfBooks
// ---------------------------------------------------------------------------

export const libraryShelves = sqliteTable('library_shelves', {
  id:        text('id').primaryKey(),
  userId:    text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name:      text('name').notNull(),
  /** 'SYSTEM' | 'CUSTOM' */
  type:      text('type').notNull().default('CUSTOM'),
  slug:      text('slug').notNull(),
  createdAt: text('created_at').notNull().default(now()),
});

export const shelfBooks = sqliteTable(
  'shelf_books',
  {
    shelfId: text('shelf_id').notNull().references(() => libraryShelves.id, { onDelete: 'cascade' }),
    bookId:  text('book_id').notNull().references(() => books.id, { onDelete: 'cascade' }),
    addedAt: text('added_at').notNull().default(now()),
  },
  (t) => [
    primaryKey({ columns: [t.shelfId, t.bookId] }),
  ],
);

// ---------------------------------------------------------------------------
// subscriptionPlans + subscriptions
// ---------------------------------------------------------------------------

export const subscriptionPlans = sqliteTable('subscription_plans', {
  id:           text('id').primaryKey(),
  name:         text('name').notNull(),
  priceMonthly: real('price_monthly').notNull(),
  /** Annual price in IDR (nullable until set for a plan). */
  priceYearly:  real('price_yearly'),
  currency:     text('currency').notNull().default('IDR'),
  trialDays:    integer('trial_days').notNull().default(7),
  /** JSON-serialized string[] of feature descriptions */
  features:     text('features').notNull().default('[]'),
  isPopular:    integer('is_popular', { mode: 'boolean' }).notNull().default(false),
  isActive:     integer('is_active', { mode: 'boolean' }).notNull().default(true),
});

export const subscriptions = sqliteTable('subscriptions', {
  id:                     text('id').primaryKey(),
  userId:                 text('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  planId:                 text('plan_id').notNull().references(() => subscriptionPlans.id),
  /** 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED' | 'PENDING_PAYMENT' */
  status:                 text('status').notNull(),
  trialEndsAt:            text('trial_ends_at'),
  currentPeriodStart:     text('current_period_start').notNull(),
  currentPeriodEnd:       text('current_period_end').notNull(),
  cancelAtPeriodEnd:      integer('cancel_at_period_end', { mode: 'boolean' }).notNull().default(false),
  /** 'MIDTRANS' | 'XENDIT' */
  paymentGateway:         text('payment_gateway'),
  externalSubscriptionId: text('external_subscription_id'),
  createdAt:              text('created_at').notNull().default(now()),
  updatedAt:              text('updated_at').notNull().default(now()),
});

// ---------------------------------------------------------------------------
// refreshTokens (mobile JWT rotation + theft detection)
// ---------------------------------------------------------------------------

export const refreshTokens = sqliteTable('refresh_tokens', {
  id:        text('id').primaryKey(),
  /** SHA-256 hex hash of the opaque token string */
  token:     text('token').notNull().unique(),
  userId:    text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  deviceId:  text('device_id').notNull(),
  expiresAt: integer('expires_at').notNull(), // Unix ms timestamp
  revokedAt: integer('revoked_at'),           // Unix ms timestamp; null = still valid
});

// ---------------------------------------------------------------------------
// deviceTokens (push notifications)
// ---------------------------------------------------------------------------

export const deviceTokens = sqliteTable('device_tokens', {
  id:        text('id').primaryKey(),
  userId:    text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token:     text('token').notNull(),
  /** 'ANDROID' | 'IOS' */
  platform:  text('platform').notNull(),
  deviceId:  text('device_id').notNull().unique(),
  updatedAt: text('updated_at').notNull().default(now()),
});

// ---------------------------------------------------------------------------
// readingGoals
// ---------------------------------------------------------------------------

export const readingGoals = sqliteTable('reading_goals', {
  id:               text('id').primaryKey(),
  userId:           text('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  dailyGoalMinutes: integer('daily_goal_minutes').notNull().default(5),
});

// ---------------------------------------------------------------------------
// readingStreaks (day-granularity — preserved for calendar view)
// ---------------------------------------------------------------------------

export const readingStreaks = sqliteTable(
  'reading_streaks',
  {
    id:          text('id').primaryKey(),
    userId:      text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    /** ISO date string 'YYYY-MM-DD' — one row per user per calendar day */
    date:        text('date').notNull(),
    minutesRead: integer('minutes_read').notNull(),
    goalMet:     integer('goal_met', { mode: 'boolean' }).notNull().default(false),
  },
  (t) => [
    uniqueIndex('reading_streaks_user_date_idx').on(t.userId, t.date),
  ],
);

// ---------------------------------------------------------------------------
// otpTokens (password reset OTPs — replaces in-memory Map<> from NestJS)
// Workers isolates are stateless; in-memory state does NOT survive between requests.
// ---------------------------------------------------------------------------

export const otpTokens = sqliteTable('otp_tokens', {
  id:        text('id').primaryKey(),
  email:     text('email').notNull(),
  code:      text('code').notNull(),
  expiresAt: integer('expires_at').notNull(), // Unix ms timestamp
});

// ---------------------------------------------------------------------------
// Community (posts, comments, likes, bookmarks, reading clubs)
// ---------------------------------------------------------------------------

export const communityPosts = sqliteTable(
  'community_posts',
  {
    id:            text('id').primaryKey(),
    userId:        text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    /** 'REVIEW' | 'QUOTE' | 'DISCUSSION' | 'RECOMMENDATION' */
    type:          text('type').notNull(),
    content:       text('content').notNull(),
    bookId:        text('book_id').references(() => books.id, { onDelete: 'set null' }),
    likeCount:     integer('like_count').notNull().default(0),
    commentCount:  integer('comment_count').notNull().default(0),
    bookmarkCount: integer('bookmark_count').notNull().default(0),
    createdAt:     text('created_at').notNull().default(now()),
    updatedAt:     text('updated_at').notNull().default(now()),
  },
  (t) => [
    index('community_posts_user_idx').on(t.userId),
    index('community_posts_book_idx').on(t.bookId),
    index('community_posts_created_at_idx').on(t.createdAt),
  ],
);

export const communityComments = sqliteTable(
  'community_comments',
  {
    id:        text('id').primaryKey(),
    postId:    text('post_id').notNull().references(() => communityPosts.id, { onDelete: 'cascade' }),
    userId:    text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    content:   text('content').notNull(),
    createdAt: text('created_at').notNull().default(now()),
  },
  (t) => [
    index('community_comments_post_idx').on(t.postId),
  ],
);

export const communityLikes = sqliteTable(
  'community_likes',
  {
    postId:    text('post_id').notNull().references(() => communityPosts.id, { onDelete: 'cascade' }),
    userId:    text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    createdAt: text('created_at').notNull().default(now()),
  },
  (t) => [
    primaryKey({ columns: [t.postId, t.userId] }),
  ],
);

export const communityBookmarks = sqliteTable(
  'community_bookmarks',
  {
    postId:    text('post_id').notNull().references(() => communityPosts.id, { onDelete: 'cascade' }),
    userId:    text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    createdAt: text('created_at').notNull().default(now()),
  },
  (t) => [
    primaryKey({ columns: [t.postId, t.userId] }),
  ],
);

export const communityEvents = sqliteTable(
  'community_events',
  {
    id:                    text('id').primaryKey(),
    title:                 text('title').notNull(),
    description:           text('description'),
    bookId:                text('book_id').references(() => books.id, { onDelete: 'set null' }),
    /** ISO date 'YYYY-MM-DD' */
    startDate:             text('start_date').notNull(),
    endDate:               text('end_date').notNull(),
    targetProgressPercent: integer('target_progress_percent').notNull().default(100),
    createdBy:             text('created_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
    createdAt:             text('created_at').notNull().default(now()),
  },
  (t) => [
    index('community_events_book_idx').on(t.bookId),
  ],
);

export const communityEventJoins = sqliteTable(
  'community_event_joins',
  {
    eventId:  text('event_id').notNull().references(() => communityEvents.id, { onDelete: 'cascade' }),
    userId:   text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    joinedAt: text('joined_at').notNull().default(now()),
  },
  (t) => [
    primaryKey({ columns: [t.eventId, t.userId] }),
  ],
);

// ---------------------------------------------------------------------------
// Publisher portal
// ---------------------------------------------------------------------------

// One row per publisher user — display/legal/contact identity.
export const publisherProfiles = sqliteTable(
  'publisher_profiles',
  {
    id:           text('id').primaryKey(),
    userId:       text('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
    displayName:  text('display_name'),
    legalName:    text('legal_name'),
    contactEmail: text('contact_email'),
    contactPhone: text('contact_phone'),
    website:      text('website'),
    createdAt:    text('created_at').notNull().default(now()),
    updatedAt:    text('updated_at').notNull().default(now()),
  },
  (t) => [
    index('publisher_profiles_user_idx').on(t.userId),
  ],
);

// Payout account — masked/reference-only. NEVER store raw bank numbers here.
export const publisherPayoutAccounts = sqliteTable(
  'publisher_payout_accounts',
  {
    id:               text('id').primaryKey(),
    publisherUserId:  text('publisher_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    /** 'BANK' | 'EWALLET' */
    method:           text('method').notNull().default('BANK'),
    bankCode:         text('bank_code'),
    accountHolderName: text('account_holder_name'),
    /** Masked account, e.g. "••••4821" */
    maskedAccount:    text('masked_account'),
    /** External provider reference (never the raw number). */
    externalAccountRef: text('external_account_ref'),
    /** 'PENDING' | 'ACTIVE' | 'FAILED' */
    status:           text('status').notNull().default('PENDING'),
    createdAt:        text('created_at').notNull().default(now()),
    updatedAt:        text('updated_at').notNull().default(now()),
  },
  (t) => [
    index('publisher_payout_accounts_user_idx').on(t.publisherUserId),
  ],
);

// Publisher content submission — review-before-publish workflow.
export const publisherSubmissions = sqliteTable(
  'publisher_submissions',
  {
    id:               text('id').primaryKey(),
    publisherUserId:  text('publisher_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    /** Linked catalog book once approved/created. */
    bookId:           text('book_id').references(() => books.id, { onDelete: 'set null' }),
    title:            text('title').notNull(),
    author:           text('author').notNull(),
    isbn:             text('isbn'),
    synopsis:         text('synopsis'),
    genre:            text('genre').notNull().default('[]'),
    language:         text('language').notNull().default('ID'),
    publishedYear:    integer('published_year'),
    totalPages:       integer('total_pages'),
    subscriptionRequired: text('subscription_required').notNull().default('FREE'),
    /** R2 keys for the submitted assets. */
    epubKey:          text('epub_key'),
    coverKey:         text('cover_key'),
    /** Release window / positioning text. */
    releaseWindow:    text('release_window'),
    positioning:      text('positioning'),
    storeUrl:         text('store_url'),
    /**
     * 'DRAFT' | 'SUBMITTED' | 'IN_REVIEW' | 'CHANGES_REQUESTED' |
     * 'APPROVED' | 'REJECTED' | 'PUBLISHED'
     */
    status:           text('status').notNull().default('DRAFT'),
    reviewerUserId:   text('reviewer_user_id').references(() => users.id, { onDelete: 'set null' }),
    reviewNote:       text('review_note'),
    submittedAt:      text('submitted_at'),
    reviewedAt:       text('reviewed_at'),
    createdAt:        text('created_at').notNull().default(now()),
    updatedAt:        text('updated_at').notNull().default(now()),
  },
  (t) => [
    index('publisher_submissions_user_created_idx').on(t.publisherUserId, t.createdAt),
    index('publisher_submissions_status_updated_idx').on(t.status, t.updatedAt),
  ],
);

// Distinct authenticated reader-days per book. Composite PK (bookId, userId, readDate).
export const publisherBookReaderDays = sqliteTable(
  'publisher_book_reader_days',
  {
    bookId:       text('book_id').notNull().references(() => books.id, { onDelete: 'cascade' }),
    userId:       text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    /** ISO date 'YYYY-MM-DD' */
    readDate:     text('read_date').notNull(),
    firstReadAt:  text('first_read_at').notNull().default(now()),
    lastReadAt:   text('last_read_at').notNull().default(now()),
  },
  (t) => [
    primaryKey({ columns: [t.bookId, t.userId, t.readDate] }),
    index('publisher_book_reader_days_date_idx').on(t.readDate),
  ],
);

// Daily aggregate metrics per book. Unique (bookId, metricDate).
export const publisherBookDailyMetrics = sqliteTable(
  'publisher_book_daily_metrics',
  {
    id:             text('id').primaryKey(),
    bookId:         text('book_id').notNull().references(() => books.id, { onDelete: 'cascade' }),
    /** ISO date 'YYYY-MM-DD' */
    metricDate:     text('metric_date').notNull(),
    readStarts:     integer('read_starts').notNull().default(0),
    completedReads: integer('completed_reads').notNull().default(0),
    readingSeconds: integer('reading_seconds').notNull().default(0),
    createdAt:      text('created_at').notNull().default(now()),
    updatedAt:      text('updated_at').notNull().default(now()),
  },
  (t) => [
    uniqueIndex('publisher_book_daily_metrics_book_date_idx').on(t.bookId, t.metricDate),
  ],
);

// In-app notification inbox (web publisher). Separate from deviceTokens (push).
export const notifications = sqliteTable(
  'notifications',
  {
    id:         text('id').primaryKey(),
    userId:     text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    kind:       text('kind').notNull(),
    title:      text('title').notNull(),
    body:       text('body'),
    entityType: text('entity_type'),
    entityId:   text('entity_id'),
    /** JSON metadata */
    data:       text('data'),
    readAt:     text('read_at'),
    createdAt:  text('created_at').notNull().default(now()),
  },
  (t) => [
    index('notifications_user_created_idx').on(t.userId, t.createdAt),
    index('notifications_user_read_created_idx').on(t.userId, t.readAt, t.createdAt),
  ],
);

// Estimated royalty period (read-model). Money in integer IDR minor units.
export const publisherRoyaltyPeriods = sqliteTable(
  'publisher_royalty_periods',
  {
    id:               text('id').primaryKey(),
    publisherUserId:  text('publisher_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    periodStart:      text('period_start').notNull(),
    periodEnd:        text('period_end').notNull(),
    /** 'OPEN' | 'CALCULATED' | 'APPROVED' | 'PAID' | 'VOID' */
    status:           text('status').notNull().default('OPEN'),
    currency:         text('currency').notNull().default('IDR'),
    /** Gross revenue pool (minor units). */
    revenuePool:      integer('revenue_pool').notNull().default(0),
    /** Publisher share total (minor units). */
    publisherShare:   integer('publisher_share').notNull().default(0),
    /** Formula version used for the estimate. */
    calcVersion:      text('calc_version'),
    finalizedAt:      text('finalized_at'),
    paidAt:           text('paid_at'),
    createdAt:        text('created_at').notNull().default(now()),
    updatedAt:        text('updated_at').notNull().default(now()),
  },
  (t) => [
    index('publisher_royalty_periods_user_idx').on(t.publisherUserId),
  ],
);

export const publisherRoyaltyLines = sqliteTable(
  'publisher_royalty_lines',
  {
    id:               text('id').primaryKey(),
    periodId:         text('period_id').notNull().references(() => publisherRoyaltyPeriods.id, { onDelete: 'cascade' }),
    publisherUserId:  text('publisher_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    bookId:           text('book_id').references(() => books.id, { onDelete: 'set null' }),
    readSeconds:      integer('read_seconds').notNull().default(0),
    /** Rate in basis points (e.g. 6500 = 65%). */
    rateBps:          integer('rate_bps').notNull().default(0),
    grossAmount:      integer('gross_amount').notNull().default(0),
    netAmount:        integer('net_amount').notNull().default(0),
    /** JSON calculation metadata. */
    calcMeta:         text('calc_meta'),
    createdAt:        text('created_at').notNull().default(now()),
  },
  (t) => [
    uniqueIndex('publisher_royalty_lines_period_book_idx').on(t.periodId, t.bookId),
    index('publisher_royalty_lines_user_idx').on(t.publisherUserId),
  ],
);

export const publisherPayouts = sqliteTable(
  'publisher_payouts',
  {
    id:               text('id').primaryKey(),
    publisherUserId:  text('publisher_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    royaltyPeriodId:  text('royalty_period_id').references(() => publisherRoyaltyPeriods.id, { onDelete: 'set null' }),
    payoutAccountId:  text('payout_account_id').references(() => publisherPayoutAccounts.id, { onDelete: 'set null' }),
    amount:           integer('amount').notNull().default(0),
    currency:         text('currency').notNull().default('IDR'),
    /** 'SCHEDULED' | 'PROCESSING' | 'PAID' | 'FAILED' | 'CANCELED' */
    status:           text('status').notNull().default('SCHEDULED'),
    scheduledAt:      text('scheduled_at'),
    processedAt:      text('processed_at'),
    externalRef:      text('external_ref'),
    failureReason:    text('failure_reason'),
    createdAt:        text('created_at').notNull().default(now()),
    updatedAt:        text('updated_at').notNull().default(now()),
  },
  (t) => [
    index('publisher_payouts_user_idx').on(t.publisherUserId),
  ],
);

// ---------------------------------------------------------------------------
// Relations (for Drizzle relational query API)
// ---------------------------------------------------------------------------

export const usersRelations = relations(users, ({ one, many }) => ({
  accounts:            many(accounts),
  sessions:            many(sessions),
  readingProgress:     many(readingProgress),
  highlights:          many(highlights),
  bookmarks:           many(bookmarks),
  libraryShelves:      many(libraryShelves),
  refreshTokens:       many(refreshTokens),
  deviceTokens:        many(deviceTokens),
  readingGoal:         one(readingGoals, { fields: [users.id], references: [readingGoals.userId] }),
  readingStreaks:      many(readingStreaks),
  subscription:        one(subscriptions, { fields: [users.id], references: [subscriptions.userId] }),
  publishedBooks:      many(books),
  communityPosts:      many(communityPosts),
  communityComments:   many(communityComments),
  communityLikes:      many(communityLikes),
  communityBookmarks:  many(communityBookmarks),
  communityEvents:     many(communityEvents),
  communityEventJoins: many(communityEventJoins),
  publisherProfile:    one(publisherProfiles, { fields: [users.id], references: [publisherProfiles.userId] }),
  payoutAccounts:      many(publisherPayoutAccounts),
  submissions:         many(publisherSubmissions),
  reviewedSubmissions: many(publisherSubmissions, { relationName: 'reviewer' }),
  notifications:       many(notifications),
  royaltyPeriods:      many(publisherRoyaltyPeriods),
  royaltyLines:        many(publisherRoyaltyLines),
  payouts:             many(publisherPayouts),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const booksRelations = relations(books, ({ one, many }) => ({
  publisher:       one(users, { fields: [books.publisherUserId], references: [users.id] }),
  readingProgress: many(readingProgress),
  highlights:      many(highlights),
  bookmarks:       many(bookmarks),
  shelfBooks:      many(shelfBooks),
  communityPosts:  many(communityPosts),
  communityEvents: many(communityEvents),
  submissions:     many(publisherSubmissions),
  readerDays:      many(publisherBookReaderDays),
  dailyMetrics:    many(publisherBookDailyMetrics),
  royaltyLines:    many(publisherRoyaltyLines),
}));

export const readingProgressRelations = relations(readingProgress, ({ one }) => ({
  user: one(users, { fields: [readingProgress.userId], references: [users.id] }),
  book: one(books, { fields: [readingProgress.bookId], references: [books.id] }),
}));

export const highlightsRelations = relations(highlights, ({ one }) => ({
  user: one(users, { fields: [highlights.userId], references: [users.id] }),
  book: one(books, { fields: [highlights.bookId], references: [books.id] }),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(users, { fields: [bookmarks.userId], references: [users.id] }),
  book: one(books, { fields: [bookmarks.bookId], references: [books.id] }),
}));

export const libraryShelvesRelations = relations(libraryShelves, ({ one, many }) => ({
  user:      one(users, { fields: [libraryShelves.userId], references: [users.id] }),
  shelfBooks: many(shelfBooks),
}));

export const shelfBooksRelations = relations(shelfBooks, ({ one }) => ({
  shelf: one(libraryShelves, { fields: [shelfBooks.shelfId], references: [libraryShelves.id] }),
  book:  one(books, { fields: [shelfBooks.bookId], references: [books.id] }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, { fields: [subscriptions.userId], references: [users.id] }),
  plan: one(subscriptionPlans, { fields: [subscriptions.planId], references: [subscriptionPlans.id] }),
}));

export const subscriptionPlansRelations = relations(subscriptionPlans, ({ many }) => ({
  subscriptions: many(subscriptions),
}));

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, { fields: [refreshTokens.userId], references: [users.id] }),
}));

export const deviceTokensRelations = relations(deviceTokens, ({ one }) => ({
  user: one(users, { fields: [deviceTokens.userId], references: [users.id] }),
}));

export const readingGoalsRelations = relations(readingGoals, ({ one }) => ({
  user: one(users, { fields: [readingGoals.userId], references: [users.id] }),
}));

export const readingStreaksRelations = relations(readingStreaks, ({ one }) => ({
  user: one(users, { fields: [readingStreaks.userId], references: [users.id] }),
}));

export const communityPostsRelations = relations(communityPosts, ({ one, many }) => ({
  user:      one(users, { fields: [communityPosts.userId], references: [users.id] }),
  book:      one(books, { fields: [communityPosts.bookId], references: [books.id] }),
  comments:  many(communityComments),
  likes:     many(communityLikes),
  bookmarks: many(communityBookmarks),
}));

export const communityCommentsRelations = relations(communityComments, ({ one }) => ({
  post: one(communityPosts, { fields: [communityComments.postId], references: [communityPosts.id] }),
  user: one(users, { fields: [communityComments.userId], references: [users.id] }),
}));

export const communityLikesRelations = relations(communityLikes, ({ one }) => ({
  post: one(communityPosts, { fields: [communityLikes.postId], references: [communityPosts.id] }),
  user: one(users, { fields: [communityLikes.userId], references: [users.id] }),
}));

export const communityBookmarksRelations = relations(communityBookmarks, ({ one }) => ({
  post: one(communityPosts, { fields: [communityBookmarks.postId], references: [communityPosts.id] }),
  user: one(users, { fields: [communityBookmarks.userId], references: [users.id] }),
}));

export const communityEventsRelations = relations(communityEvents, ({ one, many }) => ({
  book:      one(books, { fields: [communityEvents.bookId], references: [books.id] }),
  createdBy: one(users, { fields: [communityEvents.createdBy], references: [users.id] }),
  joins:     many(communityEventJoins),
}));

export const communityEventJoinsRelations = relations(communityEventJoins, ({ one }) => ({
  event: one(communityEvents, { fields: [communityEventJoins.eventId], references: [communityEvents.id] }),
  user:  one(users, { fields: [communityEventJoins.userId], references: [users.id] }),
}));

export const publisherProfilesRelations = relations(publisherProfiles, ({ one }) => ({
  user: one(users, { fields: [publisherProfiles.userId], references: [users.id] }),
}));

export const publisherPayoutAccountsRelations = relations(publisherPayoutAccounts, ({ one }) => ({
  publisher: one(users, { fields: [publisherPayoutAccounts.publisherUserId], references: [users.id] }),
}));

export const publisherSubmissionsRelations = relations(publisherSubmissions, ({ one }) => ({
  publisher: one(users, { fields: [publisherSubmissions.publisherUserId], references: [users.id] }),
  book:      one(books, { fields: [publisherSubmissions.bookId], references: [books.id] }),
  reviewer:  one(users, { fields: [publisherSubmissions.reviewerUserId], references: [users.id] }),
}));

export const publisherBookReaderDaysRelations = relations(publisherBookReaderDays, ({ one }) => ({
  book: one(books, { fields: [publisherBookReaderDays.bookId], references: [books.id] }),
  user: one(users, { fields: [publisherBookReaderDays.userId], references: [users.id] }),
}));

export const publisherBookDailyMetricsRelations = relations(publisherBookDailyMetrics, ({ one }) => ({
  book: one(books, { fields: [publisherBookDailyMetrics.bookId], references: [books.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

export const publisherRoyaltyPeriodsRelations = relations(publisherRoyaltyPeriods, ({ one, many }) => ({
  publisher: one(users, { fields: [publisherRoyaltyPeriods.publisherUserId], references: [users.id] }),
  lines:     many(publisherRoyaltyLines),
  payouts:   many(publisherPayouts),
}));

export const publisherRoyaltyLinesRelations = relations(publisherRoyaltyLines, ({ one }) => ({
  period:    one(publisherRoyaltyPeriods, { fields: [publisherRoyaltyLines.periodId], references: [publisherRoyaltyPeriods.id] }),
  publisher: one(users, { fields: [publisherRoyaltyLines.publisherUserId], references: [users.id] }),
  book:      one(books, { fields: [publisherRoyaltyLines.bookId], references: [books.id] }),
}));

export const publisherPayoutsRelations = relations(publisherPayouts, ({ one }) => ({
  publisher:     one(users, { fields: [publisherPayouts.publisherUserId], references: [users.id] }),
  royaltyPeriod: one(publisherRoyaltyPeriods, { fields: [publisherPayouts.royaltyPeriodId], references: [publisherRoyaltyPeriods.id] }),
  payoutAccount: one(publisherPayoutAccounts, { fields: [publisherPayouts.payoutAccountId], references: [publisherPayoutAccounts.id] }),
}));
