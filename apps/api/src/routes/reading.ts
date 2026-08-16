import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, and, desc, sql } from 'drizzle-orm';
import {
  readingProgress, highlights, bookmarks, books, subscriptions,
} from '@bukoo/db';
import { isBookAccessible } from '@bukoo/shared-types';
import { createDb } from '../db/index.js';
import { authMiddleware } from '../middleware/auth.js';
import { createId } from '../lib/cuid.js';
import type { Env } from '../types/env.js';

const reading = new Hono<{ Bindings: Env }>();
reading.use('*', authMiddleware);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getUserTier(userId: string, db: ReturnType<typeof createDb>): Promise<string> {
  const sub = await db.query.subscriptions.findFirst({ where: eq(subscriptions.userId, userId) });
  if (sub && (sub.status === 'ACTIVE' || sub.status === 'TRIALING')) {
    return sub.planId.replace('plan_', '').toUpperCase();
  }
  return 'FREE';
}

// ---------------------------------------------------------------------------
// POST / PUT /v1/reading/progress or /v1/reading/:bookId/progress — upsert CFI + progress
// ---------------------------------------------------------------------------

const updateProgressSchema = z.object({
  bookId: z.string().min(1).optional(),
  currentPage: z.number().int().min(0).optional(),
  cfiPosition: z.string().optional(),
  progressPercent: z.number().min(0).max(100),
  reading_time_delta: z.number().int().min(0).default(0), // seconds since last sync
});

async function handleUpsertProgress(
  c: import('hono').Context<{ Bindings: Env }>,
  targetBookId: string,
  dto: z.infer<typeof updateProgressSchema>
) {
  const db = createDb(c.env.DB);
  const userId = c.get('userId');

  const book = await db.query.books.findFirst({ where: eq(books.id, targetBookId) });
  if (!book) return c.json({ error: 'Book not found' }, 404);

  const userTier = await getUserTier(userId, db);
  if (!isBookAccessible(userTier, book.subscriptionRequired)) {
    return c.json({ error: 'Subscription required to access this book' }, 403);
  }

  const existing = await db.query.readingProgress.findFirst({
    where: and(eq(readingProgress.userId, userId), eq(readingProgress.bookId, targetBookId)),
  });

  const totalSeconds = (existing?.readingTimeSeconds ?? 0) + dto.reading_time_delta;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const now = new Date().toISOString();

  if (existing) {
    await db
      .update(readingProgress)
      .set({
        currentPage: dto.currentPage ?? existing.currentPage,
        cfiPosition: dto.cfiPosition ?? existing.cfiPosition,
        progressPercent: dto.progressPercent,
        readingTimeSeconds: totalSeconds,
        readingTimeMinutes: totalMinutes,
        lastReadAt: now,
        updatedAt: now,
      })
      .where(and(eq(readingProgress.userId, userId), eq(readingProgress.bookId, targetBookId)));
  } else {
    await db.insert(readingProgress).values({
      id: createId(),
      userId,
      bookId: targetBookId,
      currentPage: dto.currentPage ?? 0,
      totalPages: book.totalPages ?? 0,
      cfiPosition: dto.cfiPosition,
      progressPercent: dto.progressPercent,
      readingTimeSeconds: totalSeconds,
      readingTimeMinutes: totalMinutes,
      lastReadAt: now,
      updatedAt: now,
    });
  }

  return c.json({ success: true });
}

// POST /v1/reading/progress (bookId in body)
reading.post('/progress', zValidator('json', updateProgressSchema), async (c) => {
  const dto = c.req.valid('json');
  if (!dto.bookId) return c.json({ error: 'bookId is required' }, 400);
  return handleUpsertProgress(c, dto.bookId, dto);
});

// PUT /v1/reading/:bookId/progress (bookId in URL)
reading.put('/:bookId/progress', zValidator('json', updateProgressSchema), async (c) => {
  const bookId = c.req.param('bookId');
  const dto = c.req.valid('json');
  return handleUpsertProgress(c, bookId, dto);
});

// POST /v1/reading/:bookId/progress (bookId in URL)
reading.post('/:bookId/progress', zValidator('json', updateProgressSchema), async (c) => {
  const bookId = c.req.param('bookId');
  const dto = c.req.valid('json');
  return handleUpsertProgress(c, bookId, dto);
});

// ---------------------------------------------------------------------------
// GET /v1/reading/progress/:bookId & GET /v1/reading/:bookId/progress
// ---------------------------------------------------------------------------

async function handleGetBookProgress(
  c: import('hono').Context<{ Bindings: Env }>,
  bookId: string
) {
  const db = createDb(c.env.DB);
  const userId = c.get('userId');

  const book = await db.query.books.findFirst({ where: eq(books.id, bookId) });
  if (!book) return c.json({ error: 'Book not found' }, 404);

  const userTier = await getUserTier(userId, db);
  if (!isBookAccessible(userTier, book.subscriptionRequired)) {
    return c.json({ error: 'Subscription required' }, 403);
  }

  const progress = await db.query.readingProgress.findFirst({
    where: and(eq(readingProgress.userId, userId), eq(readingProgress.bookId, bookId)),
  });

  return c.json(progress ?? null);
}

reading.get('/progress/:bookId', async (c) => {
  return handleGetBookProgress(c, c.req.param('bookId'));
});

reading.get('/:bookId/progress', async (c) => {
  return handleGetBookProgress(c, c.req.param('bookId'));
});

// ---------------------------------------------------------------------------
// GET /v1/reading/recent & GET /v1/reading/progress — last 10 in-progress books
// ---------------------------------------------------------------------------

async function handleGetRecentProgress(c: import('hono').Context<{ Bindings: Env }>) {
  const db = createDb(c.env.DB);
  const userId = c.get('userId');

  const results = await db
    .select({
      progress: readingProgress,
      book: {
        id: books.id,
        title: books.title,
        author: books.author,
        coverKey: books.coverKey,
      },
    })
    .from(readingProgress)
    .innerJoin(books, eq(readingProgress.bookId, books.id))
    .where(and(eq(readingProgress.userId, userId), sql`${readingProgress.progressPercent} < 100`))
    .orderBy(desc(readingProgress.lastReadAt))
    .limit(10);

  return c.json(results);
}

reading.get('/recent', async (c) => {
  return handleGetRecentProgress(c);
});

reading.get('/progress', async (c) => {
  return handleGetRecentProgress(c);
});

// ---------------------------------------------------------------------------
// Highlights
// ---------------------------------------------------------------------------

reading.get('/highlights/:bookId', async (c) => {
  const db = createDb(c.env.DB);
  const userId = c.get('userId');
  const bookId = c.req.param('bookId');

  const result = await db
    .select()
    .from(highlights)
    .where(and(eq(highlights.userId, userId), eq(highlights.bookId, bookId)))
    .orderBy(desc(highlights.createdAt));

  return c.json(result);
});

const highlightSchema = z.object({
  cfiRange: z.string().min(1),
  text: z.string().min(1),
  color: z.string().optional(),
  note: z.string().optional(),
});

reading.post('/highlights/:bookId', zValidator('json', highlightSchema), async (c) => {
  const db = createDb(c.env.DB);
  const userId = c.get('userId');
  const bookId = c.req.param('bookId');
  const dto = c.req.valid('json');

  const id = createId();
  await db.insert(highlights).values({
    id,
    userId,
    bookId,
    cfiRange: dto.cfiRange,
    text: dto.text,
    color: dto.color ?? 'rgba(250,204,21,0.4)',
    note: dto.note,
  });

  const created = await db.query.highlights.findFirst({ where: eq(highlights.id, id) });
  return c.json(created, 201);
});

reading.delete('/highlights/:id', async (c) => {
  const db = createDb(c.env.DB);
  const userId = c.get('userId');
  const hlId = c.req.param('id');

  const hl = await db.query.highlights.findFirst({ where: eq(highlights.id, hlId) });
  if (!hl || hl.userId !== userId) return c.json({ error: 'Highlight not found' }, 404);

  await db.delete(highlights).where(eq(highlights.id, hlId));
  return c.json({ success: true });
});

reading.patch('/highlights/:id', zValidator('json', z.object({ note: z.string().optional() })), async (c) => {
  const db = createDb(c.env.DB);
  const userId = c.get('userId');
  const hlId = c.req.param('id');
  const dto = c.req.valid('json');

  const hl = await db.query.highlights.findFirst({ where: eq(highlights.id, hlId) });
  if (!hl || hl.userId !== userId) return c.json({ error: 'Highlight not found' }, 404);

  await db
    .update(highlights)
    .set({ note: dto.note ?? hl.note ?? null, updatedAt: new Date().toISOString() })
    .where(eq(highlights.id, hlId));

  const updated = await db.query.highlights.findFirst({ where: eq(highlights.id, hlId) });
  return c.json(updated);
});

// ---------------------------------------------------------------------------
// Bookmarks
// ---------------------------------------------------------------------------

reading.get('/bookmarks/:bookId', async (c) => {
  const db = createDb(c.env.DB);
  const userId = c.get('userId');
  const bookId = c.req.param('bookId');

  const result = await db
    .select()
    .from(bookmarks)
    .where(and(eq(bookmarks.userId, userId), eq(bookmarks.bookId, bookId)))
    .orderBy(desc(bookmarks.createdAt));

  return c.json(result);
});

const bookmarkSchema = z.object({
  cfi: z.string().min(1),
  chapterTitle: z.string().optional(),
  progress: z.number().min(0).max(100).optional(),
});

reading.post('/bookmarks/:bookId', zValidator('json', bookmarkSchema), async (c) => {
  const db = createDb(c.env.DB);
  const userId = c.get('userId');
  const bookId = c.req.param('bookId');
  const dto = c.req.valid('json');

  const id = createId();
  await db.insert(bookmarks).values({
    id,
    userId,
    bookId,
    cfi: dto.cfi,
    chapterTitle: dto.chapterTitle,
    progress: dto.progress ?? 0,
  });

  const created = await db.query.bookmarks.findFirst({ where: eq(bookmarks.id, id) });
  return c.json(created, 201);
});

reading.delete('/bookmarks/:id', async (c) => {
  const db = createDb(c.env.DB);
  const userId = c.get('userId');
  const bmId = c.req.param('id');

  const bm = await db.query.bookmarks.findFirst({ where: eq(bookmarks.id, bmId) });
  if (!bm || bm.userId !== userId) return c.json({ error: 'Bookmark not found' }, 404);

  await db.delete(bookmarks).where(eq(bookmarks.id, bmId));
  return c.json({ success: true });
});

export default reading;
