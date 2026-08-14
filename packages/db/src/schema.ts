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
  name:                text('name'),
  /** 'USER' | 'ADMIN' | 'CONTENT_MANAGER' | 'PUBLISHER' */
  role:                text('role').notNull().default('USER'),
  onboardingCompleted: integer('onboarding_completed', { mode: 'boolean' }).notNull().default(false),
  createdAt:           text('created_at').notNull().default(now()),
  updatedAt:           text('updated_at').notNull().default(now()),
});

// ---------------------------------------------------------------------------
// NextAuth tables (required by @auth/drizzle-adapter)
// ---------------------------------------------------------------------------

export const accounts = sqliteTable(
  'accounts',
  {
    id:                text('id').primaryKey(),
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
  id:           text('id').primaryKey(),
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
// Relations (for Drizzle relational query API)
// ---------------------------------------------------------------------------

export const usersRelations = relations(users, ({ one, many }) => ({
  accounts:        many(accounts),
  sessions:        many(sessions),
  readingProgress: many(readingProgress),
  highlights:      many(highlights),
  bookmarks:       many(bookmarks),
  libraryShelves:  many(libraryShelves),
  refreshTokens:   many(refreshTokens),
  deviceTokens:    many(deviceTokens),
  readingGoal:     one(readingGoals, { fields: [users.id], references: [readingGoals.userId] }),
  readingStreaks:  many(readingStreaks),
  subscription:    one(subscriptions, { fields: [users.id], references: [subscriptions.userId] }),
  publishedBooks:  many(books),
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
