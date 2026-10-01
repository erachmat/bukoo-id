import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, and, desc, sql } from 'drizzle-orm';
import {
  readingProgress,
  highlights,
  bookmarks,
  books,
  normalizeCountryCode,
} from '@bukoo/db';
import { countEpubWords } from '@bukoo/db/reading-manifest';
import { isBookAccessible } from '@bukoo/shared-types';
import { createDb } from '../db/index.js';
import { authMiddleware } from '../middleware/auth.js';
import { createId } from '../lib/cuid.js';
import { getUserTier } from '../lib/tier.js';
import { buildCoverUrl } from '../lib/cover-url.js';
import {
  MAX_READING_WORDS,
  READING_COVERAGE_MICROS_PER_WORD,
  READING_COVERAGE_WORDS_PER_BLOCK,
  READING_PROGRESS_EPOCH,
  validateCoverageDeltas,
  type CoverageDelta,
} from '../lib/reading-coverage.js';
import type { Env } from '../types/env.js';

const reading = new Hono<{ Bindings: Env }>();
reading.use('*', authMiddleware);

// ---------------------------------------------------------------------------
// POST / PUT /v1/reading/progress or /v1/reading/:bookId/progress — upsert CFI + progress
// ---------------------------------------------------------------------------

const updateProgressSchema = z.object({
  bookId: z.string().min(1).optional(),
  syncBatchId: z
    .string()
    .regex(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      'syncBatchId must be a UUIDv4',
    )
    .optional(),
  coverageVersion: z.literal(2).optional(),
  contentVersion: z.string().min(1).max(512).optional(),
  revision: z.number().int().min(0).max(2_147_483_647).optional(),
  currentPage: z.number().int().min(0).optional(),
  cfiPosition: z.string().optional(),
  // Kept parseable only so old clients receive an explicit upgrade response.
  progressPercent: z.number().min(0).max(100).default(0),
  coverageDeltas: z.array(z.object({
    blockIndex: z.number().int().min(0),
    exposureMicros: z.number().int().positive(),
  })).max(2_000).optional(),
  reading_time_delta: z.number().int().min(0).max(86_400).default(0),
});

type CoverageSyncDto = {
  bookId?: string;
  syncBatchId: string;
  coverageVersion: 2;
  contentVersion: string;
  revision: number;
  currentPage?: number;
  cfiPosition?: string;
  coverageDeltas: CoverageDelta[];
  reading_time_delta: number;
};

async function getReadingManifest(
  c: import('hono').Context<{ Bindings: Env }>,
  book: typeof books.$inferSelect,
) {
  if (!book.epubKey) return { error: 'Book does not have an EPUB reading manifest', status: 415 as const };
  let totalWords = book.totalWords;
  if (!totalWords) {
    const object = await c.env.BUKOO_STORAGE.get(book.epubKey);
    if (!object) return { error: 'EPUB file not found', status: 404 as const };
    try {
      totalWords = await countEpubWords(await object.arrayBuffer());
    } catch {
      return { error: 'EPUB reading manifest could not be built', status: 422 as const };
    }
    if (!Number.isSafeInteger(totalWords) || totalWords > MAX_READING_WORDS) {
      return { error: 'EPUB word count exceeds the supported limit', status: 422 as const };
    }
    await c.env.DB.prepare('UPDATE books SET total_words = ? WHERE id = ? AND epub_key = ?')
      .bind(totalWords, book.id, book.epubKey)
      .run();
  }
  if (!Number.isSafeInteger(totalWords) || totalWords <= 0 || totalWords > MAX_READING_WORDS) {
    return { error: 'EPUB reading manifest has an invalid word count', status: 422 as const };
  }
  return {
    contentVersion: book.epubKey,
    totalWords,
    wordsPerBlock: READING_COVERAGE_WORDS_PER_BLOCK,
  };
}

async function handleCoverageUpsertProgress(
  c: import('hono').Context<{ Bindings: Env }>,
  targetBookId: string,
  dto: CoverageSyncDto,
) {
  const db = createDb(c.env.DB);
  const userId = c.get('userId');
  if (dto.bookId && dto.bookId !== targetBookId) {
    return c.json({ error: 'bookId does not match the progress route' }, 400);
  }
  const book = await db.query.books.findFirst({ where: eq(books.id, targetBookId) });
  if (!book) return c.json({ error: 'Book not found' }, 404);
  const userTier = await getUserTier(userId, db);
  if (!isBookAccessible(userTier, book.subscriptionRequired)) {
    return c.json({ error: 'Subscription required to access this book' }, 403);
  }
  const manifest = await getReadingManifest(c, book);
  if ('error' in manifest) return c.json({ error: manifest.error }, manifest.status);
  if (dto.contentVersion !== manifest.contentVersion) {
    return c.json({ error: 'Book content changed; reload the reading manifest' }, 409);
  }
  let deltas: CoverageDelta[];
  try {
    deltas = validateCoverageDeltas(dto.coverageDeltas, manifest.totalWords);
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Invalid coverage deltas' }, 400);
  }

  const syncBatchId = dto.syncBatchId.toLowerCase();
  const canonicalPayload = JSON.stringify({
    bookId: targetBookId,
    coverageVersion: dto.coverageVersion,
    contentVersion: dto.contentVersion,
    revision: dto.revision,
    currentPage: dto.currentPage ?? null,
    cfiPosition: dto.cfiPosition ?? null,
    coverageDeltas: deltas,
    reading_time_delta: dto.reading_time_delta,
  });
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonicalPayload));
  const payloadHash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
  const existingReceipt = await c.env.DB.prepare(
    'SELECT user_id, book_id, payload_hash FROM reading_sync_batches WHERE sync_batch_id = ?',
  ).bind(syncBatchId).first<{ user_id: string; book_id: string; payload_hash: string }>();
  if (existingReceipt) {
    if (existingReceipt.user_id !== userId || existingReceipt.book_id !== targetBookId || existingReceipt.payload_hash !== payloadHash) {
      return c.json({ error: 'syncBatchId is already bound to another progress update' }, 409);
    }
    return c.json({ success: true });
  }

  const now = new Date().toISOString();
  const metricDate = now.slice(0, 10);
  const attemptId = createId();
  const countryCode = normalizeCountryCode(c.req.header('cf-ipcountry'));
  const latestCtaClick = await c.env.DB.prepare(
    'SELECT last_clicked_at FROM book_discovery_cta_last_clicks WHERE account_id = ? AND book_id = ?',
  ).bind(userId, targetBookId).first<{ last_clicked_at: string }>();
  const clickedAtMs = latestCtaClick ? Date.parse(latestCtaClick.last_clicked_at) : Number.NaN;
  const receivedAtMs = Date.parse(now);
  const isDiscoveryAttributed = Number.isFinite(clickedAtMs) && clickedAtMs < receivedAtMs && clickedAtMs >= receivedAtMs - 7 * 24 * 60 * 60 * 1000;
  const receiptGuard = `EXISTS (SELECT 1 FROM reading_sync_batches WHERE sync_batch_id = ? AND attempt_id = ?)`;
  const statements: D1PreparedStatement[] = [
    c.env.DB.prepare(
      `INSERT INTO reading_sync_batches (
         sync_batch_id, user_id, book_id, payload_hash, attempt_id, metric_date,
         is_start, is_completion, is_new_reader_day, is_discovery_attributed, created_at
       ) VALUES (?, ?, ?, ?, ?, ?,
         CASE WHEN NOT EXISTS (SELECT 1 FROM reading_progress WHERE user_id = ? AND book_id = ? AND progress_epoch = ?) THEN 1 ELSE 0 END,
         0, 0, ?, ?)
       ON CONFLICT(sync_batch_id) DO NOTHING`,
    ).bind(syncBatchId, userId, targetBookId, payloadHash, attemptId, metricDate, userId, targetBookId, READING_PROGRESS_EPOCH, isDiscoveryAttributed ? 1 : 0, now),
  ];
  statements.push(c.env.DB.prepare(
    `INSERT INTO reading_coverage_blocks (user_id, book_id, content_version, block_index, exposure_micros, updated_at)
     SELECT ?, ?, ?, CAST(json_extract(value, '$.blockIndex') AS INTEGER),
            CAST(json_extract(value, '$.exposureMicros') AS INTEGER), ?
       FROM json_each(?) WHERE ${receiptGuard}
     ON CONFLICT(user_id, book_id, content_version, block_index) DO UPDATE SET
       exposure_micros = MIN(?, reading_coverage_blocks.exposure_micros + excluded.exposure_micros),
       updated_at = excluded.updated_at`,
  ).bind(userId, targetBookId, manifest.contentVersion, now, JSON.stringify(deltas), syncBatchId, attemptId, READING_COVERAGE_MICROS_PER_WORD));
  statements.push(
    c.env.DB.prepare(
      `UPDATE reading_sync_batches
          SET is_completion = CASE WHEN
            (SELECT COALESCE(SUM(MIN(?, ? - block_index * ?)), 0) FROM reading_coverage_blocks
              WHERE user_id = ? AND book_id = ? AND content_version = ? AND exposure_micros >= ?) >= ?
            AND COALESCE((SELECT progress_percent FROM reading_progress
              WHERE user_id = ? AND book_id = ? AND progress_epoch = ? AND content_version = ?), 0) < 100
            THEN 1 ELSE 0 END
        WHERE sync_batch_id = ? AND attempt_id = ?`,
    ).bind(READING_COVERAGE_WORDS_PER_BLOCK, manifest.totalWords, READING_COVERAGE_WORDS_PER_BLOCK, userId, targetBookId, manifest.contentVersion, READING_COVERAGE_MICROS_PER_WORD, manifest.totalWords, userId, targetBookId, READING_PROGRESS_EPOCH, manifest.contentVersion, syncBatchId, attemptId),
    c.env.DB.prepare(
      `INSERT INTO reading_progress (
       id, user_id, book_id, progress_percent, progress_epoch, content_version,
         revision, current_page, total_pages, cfi_position, reading_time_minutes, reading_time_seconds, last_read_at, updated_at
       ) SELECT ?, ?, ?, CASE WHEN coverage.covered_words >= ? THEN 100 ELSE MIN(99, CAST(coverage.covered_words * 100 / ? AS INTEGER)) END,
         ?, ?, ?, COALESCE(?, 0), ?, ?, CAST(? / 60 AS INTEGER), ?, ?, ?
         FROM (SELECT COALESCE(SUM(MIN(?, ? - block_index * ?)), 0) AS covered_words
           FROM reading_coverage_blocks WHERE user_id = ? AND book_id = ? AND content_version = ? AND exposure_micros >= ?) coverage
         WHERE ${receiptGuard}
       ON CONFLICT(user_id, book_id) DO UPDATE SET
         progress_percent = CASE WHEN excluded.progress_percent >= 100 THEN 100 ELSE excluded.progress_percent END,
         progress_epoch = excluded.progress_epoch,
         content_version = excluded.content_version,
         revision = MAX(reading_progress.revision, excluded.revision),
         current_page = CASE WHEN excluded.revision >= reading_progress.revision AND ? = 1 THEN excluded.current_page ELSE reading_progress.current_page END,
         cfi_position = CASE WHEN excluded.revision >= reading_progress.revision AND ? = 1 THEN excluded.cfi_position ELSE reading_progress.cfi_position END,
         reading_time_seconds = CASE WHEN reading_progress.progress_epoch != ? OR reading_progress.content_version != excluded.content_version
           THEN excluded.reading_time_seconds ELSE reading_progress.reading_time_seconds + excluded.reading_time_seconds END,
         reading_time_minutes = CAST((CASE WHEN reading_progress.progress_epoch != ? OR reading_progress.content_version != excluded.content_version
           THEN excluded.reading_time_seconds ELSE reading_progress.reading_time_seconds + excluded.reading_time_seconds END) / 60 AS INTEGER),
         last_read_at = excluded.last_read_at, updated_at = excluded.updated_at`,
    ).bind(
      createId(), userId, targetBookId, manifest.totalWords, manifest.totalWords, READING_PROGRESS_EPOCH,
      manifest.contentVersion, dto.revision, dto.currentPage ?? 0, book.totalPages ?? 0, dto.cfiPosition ?? null,
      dto.reading_time_delta, dto.reading_time_delta, now, now,
      READING_COVERAGE_WORDS_PER_BLOCK, manifest.totalWords, READING_COVERAGE_WORDS_PER_BLOCK, userId, targetBookId, manifest.contentVersion, READING_COVERAGE_MICROS_PER_WORD,
      syncBatchId, attemptId,
      dto.currentPage === undefined ? 0 : 1, dto.cfiPosition === undefined ? 0 : 1,
      READING_PROGRESS_EPOCH, READING_PROGRESS_EPOCH,
    ),
    c.env.DB.prepare(
      `INSERT INTO publisher_book_reader_days (book_id, user_id, read_date, first_read_at, last_read_at)
       SELECT ?, ?, ?, ?, ? WHERE ${receiptGuard}
       ON CONFLICT(book_id, user_id, read_date) DO NOTHING`,
    ).bind(targetBookId, userId, metricDate, now, now, syncBatchId, attemptId),
    c.env.DB.prepare('UPDATE reading_sync_batches SET is_new_reader_day = changes() WHERE sync_batch_id = ? AND attempt_id = ?').bind(syncBatchId, attemptId),
    c.env.DB.prepare(
      `INSERT INTO publisher_book_daily_metrics (id, book_id, metric_date, read_starts, completed_reads, reading_seconds, created_at, updated_at)
       SELECT ?, ?, ?, CASE WHEN is_start = 1 OR is_new_reader_day = 1 THEN 1 ELSE 0 END, is_completion, ?, ?, ?
         FROM reading_sync_batches WHERE sync_batch_id = ? AND attempt_id = ?
       ON CONFLICT(book_id, metric_date) DO UPDATE SET
         read_starts = publisher_book_daily_metrics.read_starts + excluded.read_starts,
         completed_reads = publisher_book_daily_metrics.completed_reads + excluded.completed_reads,
         reading_seconds = publisher_book_daily_metrics.reading_seconds + excluded.reading_seconds,
         updated_at = excluded.updated_at`,
    ).bind(createId(), targetBookId, metricDate, dto.reading_time_delta, now, now, syncBatchId, attemptId),
    c.env.DB.prepare(
      `UPDATE books SET read_time_minutes = read_time_minutes + CAST(? / 60 AS INTEGER),
         read_count = read_count + COALESCE((SELECT is_new_reader_day FROM reading_sync_batches WHERE sync_batch_id = ? AND attempt_id = ?), 0),
         updated_at = ? WHERE id = ? AND ${receiptGuard} AND (? > 0 OR (SELECT is_new_reader_day FROM reading_sync_batches WHERE sync_batch_id = ? AND attempt_id = ?) = 1)`,
    ).bind(dto.reading_time_delta, syncBatchId, attemptId, now, targetBookId, syncBatchId, attemptId, dto.reading_time_delta, syncBatchId, attemptId),
    c.env.DB.prepare(
      `INSERT INTO publisher_book_country_metrics (id, book_id, metric_date, country_code, reader_days, created_at, updated_at)
       SELECT ?, ?, ?, ?, 1, ?, ? FROM reading_sync_batches WHERE sync_batch_id = ? AND attempt_id = ? AND is_new_reader_day = 1
       ON CONFLICT(book_id, metric_date, country_code) DO UPDATE SET reader_days = publisher_book_country_metrics.reader_days + 1, updated_at = excluded.updated_at`,
    ).bind(createId(), targetBookId, metricDate, countryCode, now, now, syncBatchId, attemptId),
    c.env.DB.prepare(
      `INSERT INTO book_discovery_daily_metrics (book_id, metric_date, attributed_reader_days, unattributed_reader_days, created_at, updated_at)
       SELECT ?, metric_date, CASE WHEN is_discovery_attributed = 1 THEN 1 ELSE 0 END, CASE WHEN is_discovery_attributed = 1 THEN 0 ELSE 1 END, ?, ?
         FROM reading_sync_batches WHERE sync_batch_id = ? AND attempt_id = ? AND is_new_reader_day = 1
       ON CONFLICT(book_id, metric_date) DO UPDATE SET
         attributed_reader_days = book_discovery_daily_metrics.attributed_reader_days + excluded.attributed_reader_days,
         unattributed_reader_days = book_discovery_daily_metrics.unattributed_reader_days + excluded.unattributed_reader_days,
         updated_at = excluded.updated_at`,
    ).bind(targetBookId, now, now, syncBatchId, attemptId),
  );
  await c.env.DB.batch(statements);
  const receipt = await c.env.DB.prepare('SELECT user_id, book_id, payload_hash FROM reading_sync_batches WHERE sync_batch_id = ?')
    .bind(syncBatchId).first<{ user_id: string; book_id: string; payload_hash: string }>();
  if (!receipt || receipt.user_id !== userId || receipt.book_id !== targetBookId || receipt.payload_hash !== payloadHash) {
    return c.json({ error: 'syncBatchId is already bound to another progress update' }, 409);
  }
  const progress = await c.env.DB.prepare('SELECT progress_percent FROM reading_progress WHERE user_id = ? AND book_id = ?')
    .bind(userId, targetBookId).first<{ progress_percent: number }>();
  return c.json({ success: true, progressPercent: progress?.progress_percent ?? 0 });
}

async function handleUpsertProgress(
  c: import('hono').Context<{ Bindings: Env }>,
  targetBookId: string,
  dto: z.infer<typeof updateProgressSchema>,
) {
  if (dto.coverageVersion !== 2) {
    return c.json({
      error: 'Reading progress format is no longer supported. Update BUKOO to continue reading.',
      code: 'CLIENT_UPGRADE_REQUIRED',
      minimumClientVersion: '2.0.0',
    }, 426);
  }
  if (!dto.syncBatchId || !dto.contentVersion || dto.revision === undefined || !dto.coverageDeltas) {
    return c.json({ error: 'Incomplete reading coverage payload' }, 400);
  }
  return handleCoverageUpsertProgress(c, targetBookId, {
    bookId: dto.bookId,
    syncBatchId: dto.syncBatchId,
    coverageVersion: 2,
    contentVersion: dto.contentVersion,
    revision: dto.revision,
    currentPage: dto.currentPage,
    cfiPosition: dto.cfiPosition,
    coverageDeltas: dto.coverageDeltas,
    reading_time_delta: dto.reading_time_delta,
  });
}

reading.get('/manifest/:bookId', async (c) => {
  const db = createDb(c.env.DB);
  const userId = c.get('userId');
  const bookId = c.req.param('bookId');
  const book = await db.query.books.findFirst({ where: eq(books.id, bookId) });
  if (!book) return c.json({ error: 'Book not found' }, 404);
  const userTier = await getUserTier(userId, db);
  if (!isBookAccessible(userTier, book.subscriptionRequired)) {
    return c.json({ error: 'Subscription required to access this book' }, 403);
  }
  const manifest = await getReadingManifest(c, book);
  if ('error' in manifest) return c.json({ error: manifest.error }, manifest.status);
  return c.json(manifest);
});

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
    where: and(
      eq(readingProgress.userId, userId),
      eq(readingProgress.bookId, bookId),
      eq(readingProgress.progressEpoch, READING_PROGRESS_EPOCH),
    ),
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
        totalPages: books.totalPages,
      },
    })
    .from(readingProgress)
    .innerJoin(books, eq(readingProgress.bookId, books.id))
    .where(and(
      eq(readingProgress.userId, userId),
      eq(readingProgress.progressEpoch, READING_PROGRESS_EPOCH),
      sql`${readingProgress.progressPercent} < 100`,
    ))
    .orderBy(desc(readingProgress.lastReadAt))
    .limit(10);

  return c.json(
    results.map(({ progress, book }) => ({
      bookId: book.id,
      bookTitle: book.title,
      bookAuthor: book.author,
      bookCoverUrl: buildCoverUrl(book.coverKey),
      progressPercent: progress.progressPercent,
      currentPage: progress.currentPage,
      totalPages: book.totalPages ?? progress.totalPages,
      lastReadAt: progress.lastReadAt,
    })),
  );
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
