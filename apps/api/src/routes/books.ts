import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, desc, and, sql } from 'drizzle-orm';
import { books, readingProgress, subscriptions, shelfBooks, libraryShelves, users } from '@bukoo/db';
import { isBookAccessible } from '@bukoo/shared-types';
import { createDb } from '../db/index.js';
import { authMiddleware } from '../middleware/auth.js';
import type { Env } from '../types/env.js';

const booksRouter = new Hono<{ Bindings: Env }>();

// Apply auth to all book routes
booksRouter.use('*', authMiddleware);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parse JSON array column safely */
function parseJsonArray(value: string | null): string[] {
  if (!value) return [];
  try { return JSON.parse(value); } catch { return []; }
}

/** Resolves the user's active subscription tier from D1 */
async function getUserTier(userId: string, db: ReturnType<typeof createDb>): Promise<string> {
  const sub = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.userId, userId),
  });
  if (sub && (sub.status === 'ACTIVE' || sub.status === 'TRIALING')) {
    return sub.planId.replace('plan_', '').toUpperCase();
  }
  return 'FREE';
}

function formatBook(book: typeof books.$inferSelect, userTier: string, progress?: number | null, shelfSlug?: string | null) {
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    publisher: book.publisher ?? '',
    description: book.description ?? '',
    synopsis: book.synopsis ?? '',
    coverKey: book.coverKey,
    epubKey: book.epubKey,
    genre: parseJsonArray(book.genre),
    tags: parseJsonArray(book.tags),
    language: book.language,
    publishedYear: book.publishedYear ?? 0,
    totalPages: book.totalPages ?? 0,
    ratingAverage: book.ratingAverage,
    ratingCount: book.ratingCount,
    readCount: book.readCount,
    readTimeMinutes: book.readTimeMinutes,
    isPublished: book.isPublished,
    subscriptionRequired: book.subscriptionRequired,
    createdAt: book.createdAt,
    updatedAt: book.updatedAt,
    is_accessible: isBookAccessible(userTier, book.subscriptionRequired),
    progress_percent: progress ?? 0,
    shelf_status: shelfSlug ?? null,
  };
}

/**
 * Aliased projection mapping raw `books` snake_case columns → the camelCase
 * shape formatBook()/isBookAccessible() expect. Drizzle does this mapping for
 * us, but raw `SELECT b.*` does NOT — `b.subscriptionRequired` would be
 * undefined and isBookAccessible() throws on `bookRequiredTier.toUpperCase()`.
 * Use this in any hand-written SQL that feeds formatBook().
 */
const bookColumns = `
       b.id, b.title, b.author, b.publisher, b.description, b.synopsis, b.isbn,
       b.cover_key AS coverKey, b.epub_key AS epubKey,
       b.genre, b.tags, b.language,
       b.published_year AS publishedYear, b.total_pages AS totalPages,
       b.read_count AS readCount, b.rating_average AS ratingAverage,
       b.rating_count AS ratingCount, b.read_time_minutes AS readTimeMinutes,
       b.is_published AS isPublished, b.is_available_offline AS isAvailableOffline,
       b.subscription_required AS subscriptionRequired,
       b.created_at AS createdAt, b.updated_at AS updatedAt`;

// ---------------------------------------------------------------------------
// GET /v1/books
// ---------------------------------------------------------------------------

const querySchema = z.object({
  genre:    z.string().optional(),
  language: z.string().optional(),
  sort:     z.enum(['popular', 'newest', 'rating', 'default']).optional(),
  limit:    z.coerce.number().int().min(1).max(100).default(20),
  offset:   z.coerce.number().int().min(0).default(0),
});

booksRouter.get('/', zValidator('query', querySchema), async (c) => {
  const db = createDb(c.env.DB);
  const userId = c.get('userId');
  const { genre, language, sort, limit, offset } = c.req.valid('query');

  const userTier = await getUserTier(userId, db);

  // Build WHERE clause fragments as raw SQL
  const conditions: string[] = ['is_published = 1'];
  const params: unknown[] = [];

  if (genre) {
    conditions.push(`json_each.value = ?`);
    params.push(genre);
  }
  if (language) {
    conditions.push(`language = ?`);
    params.push(language.toUpperCase());
  }

  let orderBy = 'id ASC';
  if (sort === 'popular') orderBy = 'rating_count DESC';
  else if (sort === 'newest') orderBy = 'created_at DESC';
  else if (sort === 'rating') orderBy = 'rating_average DESC';

  // Simple query — Drizzle doesn't yet support json_each in WHERE natively
  let results: typeof books.$inferSelect[];
  if (genre) {
    const stmt = c.env.DB.prepare(
      `SELECT ${bookColumns} FROM books b, json_each(b.genre)
       WHERE b.is_published = 1 AND json_each.value = ?
       ${language ? 'AND b.language = ?' : ''}
       ORDER BY b.${orderBy.replace(' ', ' ')}
       LIMIT ? OFFSET ?`
    );
    const args: unknown[] = [genre];
    if (language) args.push(language.toUpperCase());
    args.push(limit, offset);
    const raw = await stmt.bind(...args).all<typeof books.$inferSelect>();
    results = raw.results ?? [];
  } else {
    results = await db
      .select()
      .from(books)
      .where(
        and(
          eq(books.isPublished, true),
          language ? eq(books.language, language.toUpperCase()) : undefined,
        )
      )
      .orderBy(
        sort === 'popular' ? desc(books.ratingCount) :
        sort === 'newest'  ? desc(books.createdAt) :
        sort === 'rating'  ? desc(books.ratingAverage) :
        books.id
      )
      .limit(limit)
      .offset(offset);
  }

  return c.json(results.map((b) => formatBook(b, userTier)));
});

// ---------------------------------------------------------------------------
// GET /v1/books/featured
// ---------------------------------------------------------------------------

booksRouter.get('/featured', async (c) => {
  const db = createDb(c.env.DB);
  const userId = c.get('userId');
  const userTier = await getUserTier(userId, db);

  const cacheKey = new Request(new URL('/featured-books-global', c.req.url));
  const cache = caches.default;
  const cached = await cache.match(cacheKey);
  if (cached) {
    const global = await cached.json<{ editors_choice: typeof books.$inferSelect[]; trending: typeof books.$inferSelect[]; new_releases: typeof books.$inferSelect[] }>();
    const continueReading = await db
      .select({ book: books })
      .from(readingProgress)
      .innerJoin(books, eq(readingProgress.bookId, books.id))
      .where(and(eq(readingProgress.userId, userId), sql`${readingProgress.progressPercent} < 100`))
      .orderBy(desc(readingProgress.lastReadAt))
      .limit(10);

    return c.json({
      continue_reading: continueReading.map(({ book: b }) => formatBook(b, userTier)),
      editors_choice: global.editors_choice.map((b) => formatBook(b, userTier)),
      trending: global.trending.map((b) => formatBook(b, userTier)),
      new_releases: global.new_releases.map((b) => formatBook(b, userTier)),
    });
  }

  const [editorsChoice, trending, newReleases, continueReading] = await Promise.all([
    db.select().from(books).where(eq(books.isPublished, true)).orderBy(desc(books.ratingAverage)).limit(10),
    db.select().from(books).where(eq(books.isPublished, true)).orderBy(desc(books.ratingCount)).limit(10),
    db.select().from(books).where(eq(books.isPublished, true)).orderBy(desc(books.createdAt)).limit(10),
    db
      .select({ book: books })
      .from(readingProgress)
      .innerJoin(books, eq(readingProgress.bookId, books.id))
      .where(and(eq(readingProgress.userId, userId), sql`${readingProgress.progressPercent} < 100`))
      .orderBy(desc(readingProgress.lastReadAt))
      .limit(10),
  ]);

  const globalData = { editors_choice: editorsChoice, trending, new_releases: newReleases };
  const globalResponse = new Response(JSON.stringify(globalData), {
    headers: { 'Cache-Control': 'public, max-age=300', 'Content-Type': 'application/json' },
  });
  c.executionCtx.waitUntil(cache.put(cacheKey, globalResponse));

  return c.json({
    continue_reading: continueReading.map(({ book: b }) => formatBook(b, userTier)),
    editors_choice: editorsChoice.map((b) => formatBook(b, userTier)),
    trending: trending.map((b) => formatBook(b, userTier)),
    new_releases: newReleases.map((b) => formatBook(b, userTier)),
  });
});

// ---------------------------------------------------------------------------
// GET /v1/books/search — SQLite FTS5
// ---------------------------------------------------------------------------

/**
 * Builds a tolerant, injection-safe FTS5 MATCH query from a raw user string.
 *
 * FTS5 parses a bare multi-word string as a PHRASE (adjacent, in-order tokens)
 * and the `unicode61` tokenizer does NO stemming — so "dead smoker" would never
 * match "Dead Smokers Club". We therefore split on whitespace and turn every
 * token into a quoted prefix term (`"<token>"*`) joined with AND, which matches
 * partial/plural forms ("smoker*" hits "smokers") in any order. Quoting each
 * token also neutralizes FTS5 operator characters (quotes, `*`, `AND`/`OR`/`NOT`,
 * parens, `:`, `^`, `+`, `-`) so user input cannot alter match semantics.
 *
 * Returns '' when no usable tokens remain (caller should short-circuit).
 */
function buildFtsQuery(raw: string): string {
  const tokens = raw
    .split(/\s+/)
    .map((t) => t.replace(/["*^():+-]/g, '').trim())
    .filter((t) => t.length > 0 && !/^(AND|OR|NOT|NEAR)$/i.test(t))
    .map((t) => `"${t}"*`);
  return tokens.join(' AND ');
}

booksRouter.get('/search', zValidator('query', z.object({ q: z.string().min(2) })), async (c) => {
  const userId = c.get('userId');
  const db = createDb(c.env.DB);
  const { q } = c.req.valid('query');
  const userTier = await getUserTier(userId, db);

  const matchQuery = buildFtsQuery(q);
  if (!matchQuery) return c.json([]);

  const results = await c.env.DB.prepare(
    `SELECT ${bookColumns} FROM books b
     INNER JOIN books_fts f ON b.id = f.id
     WHERE books_fts MATCH ? AND b.is_published = 1
     ORDER BY rank
     LIMIT 20`
  ).bind(matchQuery).all<typeof books.$inferSelect>();

  return c.json((results.results ?? []).map((b) => formatBook(b, userTier)));
});

// ---------------------------------------------------------------------------
// GET /v1/books/recommendations — Option C (D1 SQL genre overlap + AI match scoring)
// ---------------------------------------------------------------------------

booksRouter.get('/recommendations', async (c) => {
  const db = createDb(c.env.DB);
  const userId = c.get('userId');
  const userTier = await getUserTier(userId, db);

  const userRecord = await db.query.users.findFirst({ where: eq(users.id, userId) });
  const favoriteGenres = parseJsonArray(userRecord?.favoriteGenres ?? null);

  const allBooks = await db.select().from(books).where(eq(books.isPublished, true)).limit(20);

  const recommendations = allBooks.map((book) => {
    const bookGenres = parseJsonArray(book.genre);
    const overlapping = favoriteGenres.filter((g) => bookGenres.includes(g));
    const hasOverlap = overlapping.length > 0;
    const baseScore = hasOverlap ? 85 + overlapping.length * 3 : 75;
    const matchPercent = Math.min(99, baseScore + Math.floor((book.ratingAverage || 4.5) * 2));
    return {
      ...formatBook(book, userTier),
      matchPercent,
      isGenreMatch: hasOverlap,
      aiReason: hasOverlap
        ? `Sesuai minat genre (${overlapping.join(', ')})`
        : 'Rekomendasi populer di BUKOO',
    };
  });

  recommendations.sort((a, b) => b.matchPercent - a.matchPercent);
  return c.json(recommendations.slice(0, 10));
});

// ---------------------------------------------------------------------------
// GET /v1/books/:id
// ---------------------------------------------------------------------------

booksRouter.get('/:id', async (c) => {
  const db = createDb(c.env.DB);
  const userId = c.get('userId');
  const bookId = c.req.param('id');

  const book = await db.query.books.findFirst({ where: eq(books.id, bookId) });
  if (!book) return c.json({ error: 'Book not found' }, 404);

  const [userTier, progress, shelfBook] = await Promise.all([
    getUserTier(userId, db),
    db.query.readingProgress.findFirst({
      where: and(eq(readingProgress.userId, userId), eq(readingProgress.bookId, bookId)),
    }),
    db
      .select({ slug: libraryShelves.slug })
      .from(shelfBooks)
      .innerJoin(libraryShelves, eq(shelfBooks.shelfId, libraryShelves.id))
      .where(and(eq(shelfBooks.bookId, bookId), eq(libraryShelves.userId, userId)))
      .limit(1)
      .then((r) => r[0] ?? null),
  ]);

  return c.json(formatBook(book, userTier, progress?.progressPercent, shelfBook?.slug));
});

// ---------------------------------------------------------------------------
// GET /v1/books/:id/download — stream EPUB from R2
// ---------------------------------------------------------------------------

booksRouter.get('/:id/download', async (c) => {
  const db = createDb(c.env.DB);
  const userId = c.get('userId');
  const bookId = c.req.param('id');

  const book = await db.query.books.findFirst({ where: eq(books.id, bookId) });
  if (!book) return c.json({ error: 'Book not found' }, 404);
  if (!book.epubKey) return c.json({ error: 'No EPUB available for this book' }, 404);

  const userTier = await getUserTier(userId, db);
  if (!isBookAccessible(userTier, book.subscriptionRequired)) {
    return c.json({ error: 'Subscription required to download this book' }, 403);
  }

  const object = await c.env.BUKOO_STORAGE.get(book.epubKey);
  if (!object) return c.json({ error: 'File not found in storage' }, 404);

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('Content-Type', 'application/epub+zip');
  headers.set('Content-Disposition', `attachment; filename="${book.title.replace(/[^a-z0-9]/gi, '_')}.epub"`);

  return new Response(object.body, { headers });
});

export default booksRouter;
