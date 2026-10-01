import { beforeEach, describe, expect, it, vi } from 'vitest';
import { env, SELF } from 'cloudflare:test';
import { signJwt } from '../src/lib/jwt.js';
import { recordBookDiscoveryEvent } from '../../../packages/db/src/index.js';

const testEnv = env as typeof env & { DB: D1Database; JWT_SECRET: string };
const BOOK_ID = 'sync-book-a';
const OTHER_BOOK_ID = 'sync-book-b';
const USER_ID = 'sync-reader-a';
const OTHER_USER_ID = 'sync-reader-b';
const basePayload = {
  currentPage: 8,
  cfiPosition: 'epubcfi(/6/8)',
  coverageVersion: 2,
  revision: 1,
  coverageDeltas: [{ blockIndex: 0, exposureMicros: 240_000 }],
  reading_time_delta: 75,
};

function batchId(n: number): string {
  return `00000000-0000-4000-8000-${n.toString().padStart(12, '0')}`;
}

async function seed(): Promise<void> {
  await testEnv.DB.batch([
    testEnv.DB.prepare('INSERT INTO users (id, email) VALUES (?, ?)').bind(
      USER_ID,
      'reader-a@test.invalid',
    ),
    testEnv.DB.prepare('INSERT INTO users (id, email) VALUES (?, ?)').bind(
      OTHER_USER_ID,
      'reader-b@test.invalid',
    ),
    testEnv.DB.prepare(
      'INSERT INTO books (id, title, author, epub_key, total_words) VALUES (?, ?, ?, ?, 10)',
    ).bind(BOOK_ID, 'Book A', 'Author', `epubs/${BOOK_ID}.epub`),
    testEnv.DB.prepare(
      'INSERT INTO books (id, title, author, epub_key, total_words) VALUES (?, ?, ?, ?, 10)',
    ).bind(OTHER_BOOK_ID, 'Book B', 'Author', `epubs/${OTHER_BOOK_ID}.epub`),
  ]);
}

async function tokenFor(userId = USER_ID): Promise<string> {
  return signJwt(
    { sub: userId, email: `${userId}@test.invalid` },
    testEnv.JWT_SECRET,
  );
}

async function sendProgress(
  options: {
    userId?: string;
    bookId?: string;
    payload?: Record<string, unknown>;
    method?: 'POST' | 'PUT';
  } = {},
): Promise<Response> {
  const userId = options.userId ?? USER_ID;
  const bookId = options.bookId ?? BOOK_ID;
  const response = await SELF.fetch(
    `https://api.test/v1/reading/${bookId}/progress`,
    {
      method: options.method ?? 'PUT',
      headers: {
        authorization: `Bearer ${await tokenFor(userId)}`,
        'content-type': 'application/json',
        'cf-ipcountry': 'us',
      },
      body: JSON.stringify(options.payload
        ? { ...options.payload, contentVersion: options.payload.contentVersion ?? `epubs/${bookId}.epub` }
        : { ...basePayload, syncBatchId: batchId(1), contentVersion: `epubs/${bookId}.epub` }),
    },
  );
  return response;
}

async function one<T>(
  query: string,
  ...values: (string | number)[]
): Promise<T | null> {
  return testEnv.DB.prepare(query)
    .bind(...values)
    .first<T>();
}

async function metricSnapshot(bookId = BOOK_ID, userId = USER_ID) {
  return {
    progress: await one<{
      reading_time_seconds: number;
      progress_percent: number;
    }>(
      'SELECT reading_time_seconds, progress_percent FROM reading_progress WHERE user_id = ? AND book_id = ?',
      userId,
      bookId,
    ),
    readerDays: await one<{ count: number }>(
      'SELECT COUNT(*) AS count FROM publisher_book_reader_days WHERE user_id = ? AND book_id = ?',
      userId,
      bookId,
    ),
    daily: await one<{
      read_starts: number;
      completed_reads: number;
      reading_seconds: number;
    }>(
      'SELECT read_starts, completed_reads, reading_seconds FROM publisher_book_daily_metrics WHERE book_id = ?',
      bookId,
    ),
    country: await one<{ country_code: string; reader_days: number }>(
      'SELECT country_code, reader_days FROM publisher_book_country_metrics WHERE book_id = ?',
      bookId,
    ),
    book: await one<{ read_count: number; read_time_minutes: number }>(
      'SELECT read_count, read_time_minutes FROM books WHERE id = ?',
      bookId,
    ),
  };
}

async function recordLastCtaClick(
  userId: string,
  bookId: string,
  clickedAt: string,
): Promise<void> {
  await testEnv.DB.prepare(
    `INSERT INTO book_discovery_cta_last_clicks (account_id, book_id, last_clicked_at)
     VALUES (?, ?, ?)
     ON CONFLICT(account_id, book_id) DO UPDATE SET last_clicked_at = excluded.last_clicked_at`,
  )
    .bind(userId, bookId, clickedAt)
    .run();
}

async function discoverySnapshot(bookId = BOOK_ID) {
  return one<{
    anonymous_detail_views: number;
    anonymous_app_cta_clicks: number;
    signed_in_detail_views: number;
    signed_in_app_cta_clicks: number;
    attributed_reader_days: number;
    unattributed_reader_days: number;
  }>(
    `SELECT anonymous_detail_views, anonymous_app_cta_clicks,
            signed_in_detail_views, signed_in_app_cta_clicks,
            attributed_reader_days, unattributed_reader_days
       FROM book_discovery_daily_metrics
      WHERE book_id = ? AND metric_date = ?`,
    bookId,
    new Date().toISOString().slice(0, 10),
  );
}

beforeEach(seed);

describe('Phase 3 web discovery event storage', () => {
  it('stores anonymous activity only in daily counters and keeps the newest signed-in click', async () => {
    const now = new Date().toISOString();
    await testEnv.DB.prepare('UPDATE books SET is_published = 1 WHERE id = ?')
      .bind(BOOK_ID)
      .run();

    expect(
      await recordBookDiscoveryEvent(testEnv.DB, {
        bookId: BOOK_ID,
        eventType: 'detail_view',
        accountId: null,
        receivedAt: now,
      }),
    ).toBe(true);
    expect(
      await recordBookDiscoveryEvent(testEnv.DB, {
        bookId: BOOK_ID,
        eventType: 'app_cta_click',
        accountId: null,
        receivedAt: now,
      }),
    ).toBe(true);
    expect(
      await recordBookDiscoveryEvent(testEnv.DB, {
        bookId: BOOK_ID,
        eventType: 'app_cta_click',
        accountId: USER_ID,
        receivedAt: now,
      }),
    ).toBe(true);

    const day = await discoverySnapshot();
    expect(day).toMatchObject({
      anonymous_detail_views: 1,
      anonymous_app_cta_clicks: 1,
      signed_in_detail_views: 0,
      signed_in_app_cta_clicks: 1,
      attributed_reader_days: 0,
      unattributed_reader_days: 0,
    });
    expect(
      await one<{ count: number }>(
        'SELECT COUNT(*) AS count FROM book_discovery_cta_last_clicks WHERE account_id = ? AND book_id = ?',
        USER_ID,
        BOOK_ID,
      ),
    ).toEqual({ count: 1 });

    const older = new Date(Date.parse(now) - 60_000).toISOString();
    await recordBookDiscoveryEvent(testEnv.DB, {
      bookId: BOOK_ID,
      eventType: 'app_cta_click',
      accountId: USER_ID,
      receivedAt: older,
    });
    expect(
      await one<{ last_clicked_at: string }>(
        'SELECT last_clicked_at FROM book_discovery_cta_last_clicks WHERE account_id = ? AND book_id = ?',
        USER_ID,
        BOOK_ID,
      ),
    ).toEqual({ last_clicked_at: now });
  });

  it('ignores events for unpublished or unknown books', async () => {
    expect(
      await recordBookDiscoveryEvent(testEnv.DB, {
        bookId: BOOK_ID,
        eventType: 'detail_view',
        accountId: null,
        receivedAt: new Date().toISOString(),
      }),
    ).toBe(false);
    expect(
      await recordBookDiscoveryEvent(testEnv.DB, {
        bookId: 'missing-book',
        eventType: 'detail_view',
        accountId: null,
        receivedAt: new Date().toISOString(),
      }),
    ).toBe(false);
    expect(await discoverySnapshot()).toBeNull();
  });
});

describe('POST /v1/reading/:bookId/progress retry-safe sync', () => {
  it('returns the canonical word manifest for the authenticated reader', async () => {
    const response = await SELF.fetch(
      `https://api.test/v1/reading/manifest/${BOOK_ID}`,
      { headers: { authorization: `Bearer ${await tokenFor(USER_ID)}` } },
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      contentVersion: `epubs/${BOOK_ID}.epub`,
      totalWords: 10,
      wordsPerBlock: 5,
    });
  });

  it('applies a new delivery once and exposes no reader identity', async () => {
    const response = await sendProgress({ method: 'POST' });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject({ success: true, progressPercent: 50 });
    expect(JSON.stringify(body)).not.toContain(USER_ID);

    expect(await metricSnapshot()).toEqual({
      progress: { reading_time_seconds: 75, progress_percent: 50 },
      readerDays: { count: 1 },
      daily: { read_starts: 1, completed_reads: 0, reading_seconds: 75 },
      country: { country_code: 'US', reader_days: 1 },
      book: { read_count: 1, read_time_minutes: 1 },
    });
  });

  it('treats a replay after a lost response as a successful no-op', async () => {
    const payload = { ...basePayload, syncBatchId: batchId(2) };
    expect((await sendProgress({ payload })).status).toBe(200);
    const afterFirstDelivery = await metricSnapshot(); // The first response is intentionally ignored.

    expect((await sendProgress({ payload })).status).toBe(200);
    expect(await metricSnapshot()).toEqual(afterFirstDelivery);

    const caseVariant = {
      ...payload,
      syncBatchId: String(payload.syncBatchId).toUpperCase(),
    };
    expect((await sendProgress({ payload: caseVariant })).status).toBe(200);
    expect(await metricSnapshot()).toEqual(afterFirstDelivery);
  });

  it('counts different IDs as distinct deltas without creating another reader-day', async () => {
    expect(
      (
        await sendProgress({
          payload: { ...basePayload, syncBatchId: batchId(3) },
        })
      ).status,
    ).toBe(200);
    expect(
      (
        await sendProgress({
          payload: {
            ...basePayload,
            syncBatchId: batchId(4),
            reading_time_delta: 125,
          },
        })
      ).status,
    ).toBe(200);

    expect(await metricSnapshot()).toEqual({
      progress: { reading_time_seconds: 200, progress_percent: 50 },
      readerDays: { count: 1 },
      daily: { read_starts: 1, completed_reads: 0, reading_seconds: 200 },
      country: { country_code: 'US', reader_days: 1 },
      book: { read_count: 1, read_time_minutes: 3 },
    });
  });

  it('does not mark the book finished when a reader only exposes the last block', async () => {
    const response = await sendProgress({ payload: {
      ...basePayload,
      coverageDeltas: [{ blockIndex: 1, exposureMicros: 240_000 }],
      syncBatchId: batchId(21),
    } });
    expect(response.status).toBe(200);
    expect((await metricSnapshot()).progress?.progress_percent).toBe(50);
    expect((await metricSnapshot(BOOK_ID, OTHER_USER_ID)).progress).toBeNull();

    expect((await sendProgress({ payload: {
      ...basePayload,
      coverageDeltas: [{ blockIndex: 0, exposureMicros: 240_000 }],
      syncBatchId: batchId(22),
      revision: 2,
    } })).status).toBe(200);
    expect((await metricSnapshot()).progress?.progress_percent).toBe(100);
    expect((await metricSnapshot(BOOK_ID, OTHER_USER_ID)).progress).toBeNull();
  });

  it('rejects block indexes and dwell deltas outside the EPUB manifest', async () => {
    const oversized = await sendProgress({ payload: {
      ...basePayload,
      coverageDeltas: [{ blockIndex: 0, exposureMicros: 240_001 }],
      syncBatchId: batchId(23),
    } });
    expect(oversized.status).toBe(400);
    const outsideManifest = await sendProgress({ payload: {
      ...basePayload,
      coverageDeltas: [{ blockIndex: 2, exposureMicros: 240_000 }],
      syncBatchId: batchId(24),
    } });
    expect(outsideManifest.status).toBe(400);
    expect((await metricSnapshot()).progress).toBeNull();
  });

  it('rejects a stale EPUB content version without updating progress', async () => {
    const response = await sendProgress({ payload: {
      ...basePayload,
      contentVersion: 'epubs/previous-release.epub',
      syncBatchId: batchId(26),
    } });
    expect(response.status).toBe(409);
    expect((await metricSnapshot()).progress).toBeNull();
  });

  it('keeps a delayed old-ID replay from replacing a newer progress snapshot', async () => {
    const older = { ...basePayload, syncBatchId: batchId(30) };
    const newer = {
      ...basePayload,
      currentPage: 15,
      revision: 2,
      reading_time_delta: 30,
      syncBatchId: batchId(31),
    };
    expect((await sendProgress({ payload: older })).status).toBe(200);
    expect((await sendProgress({ payload: newer })).status).toBe(200);
    const afterNewerBatch = await metricSnapshot();

    expect((await sendProgress({ payload: older })).status).toBe(200);
    expect(await metricSnapshot()).toEqual(afterNewerBatch);
    expect(await one<{ current_page: number }>(
      'SELECT current_page FROM reading_progress WHERE user_id = ? AND book_id = ?',
      USER_ID,
      BOOK_ID,
    )).toEqual({ current_page: 15 });
    expect(afterNewerBatch.progress).toEqual({
      reading_time_seconds: 105,
      progress_percent: 50,
    });
  });

  it('counts only the first transition to 100 percent as a completion', async () => {
    expect(
      (
        await sendProgress({
          payload: {
            ...basePayload,
            coverageDeltas: [{ blockIndex: 0, exposureMicros: 240_000 }],
            reading_time_delta: 59,
            syncBatchId: batchId(40),
          },
        })
      ).status,
    ).toBe(200);
    const completion = {
      ...basePayload,
      coverageDeltas: [{ blockIndex: 1, exposureMicros: 240_000 }],
      reading_time_delta: 61,
      syncBatchId: batchId(41),
    };
    expect((await sendProgress({ payload: completion })).status).toBe(200);
    const afterCompletion = await metricSnapshot();
    expect((await sendProgress({ payload: completion })).status).toBe(200);
    expect(await metricSnapshot()).toEqual(afterCompletion);
    expect(afterCompletion.progress).toEqual({
      reading_time_seconds: 120,
      progress_percent: 100,
    });
    expect(afterCompletion.daily).toEqual({
      read_starts: 1,
      completed_reads: 1,
      reading_seconds: 120,
    });
    // Lifetime book minutes keep the existing per-batch floor: floor(59/60)+floor(61/60).
    expect(afterCompletion.book).toEqual({
      read_count: 1,
      read_time_minutes: 1,
    });
  });

  it('rejects a reused ID when the payload changes', async () => {
    expect(
      (
        await sendProgress({
          payload: { ...basePayload, syncBatchId: batchId(5) },
        })
      ).status,
    ).toBe(200);
    const replay = await sendProgress({
      payload: { ...basePayload, currentPage: 9, syncBatchId: batchId(5) },
    });

    expect(replay.status).toBe(409);
    expect(await metricSnapshot()).toEqual({
      progress: { reading_time_seconds: 75, progress_percent: 50 },
      readerDays: { count: 1 },
      daily: { read_starts: 1, completed_reads: 0, reading_seconds: 75 },
      country: { country_code: 'US', reader_days: 1 },
      book: { read_count: 1, read_time_minutes: 1 },
    });
  });

  it('binds an ID to the authenticated account and book', async () => {
    const payload = { ...basePayload, syncBatchId: batchId(6) };
    expect((await sendProgress({ payload })).status).toBe(200);
    expect(
      (await sendProgress({ userId: OTHER_USER_ID, payload })).status,
    ).toBe(409);
    expect((await metricSnapshot(BOOK_ID, OTHER_USER_ID)).progress).toBeNull();

    const secondPayload = { ...basePayload, syncBatchId: batchId(7) };
    expect((await sendProgress({ payload: secondPayload })).status).toBe(200);
    expect(
      (await sendProgress({ bookId: OTHER_BOOK_ID, payload: secondPayload }))
        .status,
    ).toBe(409);
    expect((await metricSnapshot(OTHER_BOOK_ID)).progress).toBeNull();
  });

  it('rejects malformed IDs and requires old clients to upgrade', async () => {
    const malformed = await sendProgress({
      payload: { ...basePayload, syncBatchId: 'not-a-uuid' },
    });
    expect(malformed.status).toBe(400);
    expect(await metricSnapshot()).toEqual({
      progress: null,
      readerDays: { count: 0 },
      daily: null,
      country: null,
      book: { read_count: 0, read_time_minutes: 0 },
    });

    const legacy = await sendProgress({ payload: {
      currentPage: 8,
      cfiPosition: 'epubcfi(/6/8)',
      progressPercent: 100,
      reading_time_delta: 75,
    } });
    expect(legacy.status).toBe(426);
    expect(await legacy.json()).toMatchObject({ code: 'CLIENT_UPGRADE_REQUIRED' });
    expect((await metricSnapshot()).progress).toBeNull();
  });

  it('hides legacy progress and starts the coverage epoch with fresh account progress', async () => {
    const now = new Date().toISOString();
    const readDate = now.slice(0, 10);
    await testEnv.DB.prepare(
      `INSERT INTO reading_progress (
         id, user_id, book_id, progress_percent, progress_epoch, current_page,
         total_pages, cfi_position, reading_time_minutes, reading_time_seconds
       ) VALUES (?, ?, ?, 100, 1, 99, 100, 'epubcfi(/6/198)', 240, 14_400)`,
    ).bind('legacy-progress', USER_ID, BOOK_ID).run();
    await testEnv.DB.prepare(
      `INSERT INTO publisher_book_reader_days (book_id, user_id, read_date, first_read_at, last_read_at)
       VALUES (?, ?, ?, ?, ?)`,
    ).bind(BOOK_ID, USER_ID, readDate, now, now).run();
    await testEnv.DB.prepare(
      `INSERT INTO publisher_book_daily_metrics (
         id, book_id, metric_date, read_starts, completed_reads, reading_seconds, created_at, updated_at
       ) VALUES (?, ?, ?, 1, 1, 1200, ?, ?)`,
    ).bind('legacy-metric', BOOK_ID, readDate, now, now).run();
    await testEnv.DB.prepare('UPDATE books SET read_count = 7, read_time_minutes = 120 WHERE id = ?')
      .bind(BOOK_ID).run();

    const hiddenLegacyProgress = await SELF.fetch(
      `https://api.test/v1/reading/${BOOK_ID}/progress`,
      { headers: { authorization: `Bearer ${await tokenFor(USER_ID)}` } },
    );
    expect(await hiddenLegacyProgress.json()).toBeNull();
    const bookDetails = await SELF.fetch(`https://api.test/v1/books/${BOOK_ID}`, {
      headers: { authorization: `Bearer ${await tokenFor(USER_ID)}` },
    });
    expect(await bookDetails.json()).toMatchObject({ progress_percent: 0 });
    const booksRead = await SELF.fetch('https://api.test/v1/goals/books-this-year', {
      headers: { authorization: `Bearer ${await tokenFor(USER_ID)}` },
    });
    expect(await booksRead.json()).toEqual({ booksReadThisYear: 0 });

    const response = await sendProgress({ payload: { ...basePayload, syncBatchId: batchId(25) } });
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ success: true, progressPercent: 50 });
    expect(await one<{
      progress_percent: number;
      progress_epoch: number;
      current_page: number;
      cfi_position: string;
      reading_time_seconds: number;
    }>(
      `SELECT progress_percent, progress_epoch, current_page, cfi_position, reading_time_seconds
         FROM reading_progress WHERE user_id = ? AND book_id = ?`,
      USER_ID,
      BOOK_ID,
    )).toEqual({
      progress_percent: 50,
      progress_epoch: 2,
      current_page: 8,
      cfi_position: 'epubcfi(/6/8)',
      reading_time_seconds: 75,
    });
    expect((await metricSnapshot()).daily).toEqual({
      read_starts: 2,
      completed_reads: 1,
      reading_seconds: 1275,
    });
    expect((await metricSnapshot()).book).toEqual({ read_count: 7, read_time_minutes: 121 });
  });

  it('applies concurrent duplicate deliveries once', async () => {
    const payload = { ...basePayload, syncBatchId: batchId(8) };
    const responses = await Promise.all([
      sendProgress({ payload }),
      sendProgress({ payload }),
    ]);
    expect(responses.map((response) => response.status)).toEqual([200, 200]);
    expect(await metricSnapshot()).toEqual({
      progress: { reading_time_seconds: 75, progress_percent: 50 },
      readerDays: { count: 1 },
      daily: { read_starts: 1, completed_reads: 0, reading_seconds: 75 },
      country: { country_code: 'US', reader_days: 1 },
      book: { read_count: 1, read_time_minutes: 1 },
    });
  });

  it('rolls back a partial batch so the same ID can retry successfully', async () => {
    await testEnv.DB.prepare(
      `CREATE TRIGGER reject_daily_metric BEFORE INSERT ON publisher_book_daily_metrics
       BEGIN SELECT RAISE(ABORT, 'injected metric failure'); END`,
    ).run();
    const payload = { ...basePayload, syncBatchId: batchId(9) };
    expect((await sendProgress({ payload })).status).toBe(500);
    expect(await metricSnapshot()).toEqual({
      progress: null,
      readerDays: { count: 0 },
      daily: null,
      country: null,
      book: { read_count: 0, read_time_minutes: 0 },
    });

    await testEnv.DB.prepare('DROP TRIGGER reject_daily_metric').run();
    expect((await sendProgress({ payload })).status).toBe(200);
    expect((await metricSnapshot()).progress?.reading_time_seconds).toBe(75);
  });
});

describe('Phase 3 mobile reading attribution', () => {
  it('includes a click exactly seven days before first server receipt', async () => {
    const receivedAt = new Date('2026-09-29T12:00:00.000Z');
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(receivedAt);
    try {
      await recordLastCtaClick(
        USER_ID,
        BOOK_ID,
        new Date(receivedAt.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      );
      expect(
        (
          await sendProgress({
            payload: { ...basePayload, syncBatchId: batchId(50) },
          })
        ).status,
      ).toBe(200);
      expect((await discoverySnapshot())?.attributed_reader_days).toBe(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('does not treat a click at the same server timestamp as preceding the sync', async () => {
    const receivedAt = new Date('2026-09-29T12:00:00.000Z');
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(receivedAt);
    try {
      await recordLastCtaClick(USER_ID, BOOK_ID, receivedAt.toISOString());
      expect(
        (
          await sendProgress({
            payload: { ...basePayload, syncBatchId: batchId(56) },
          })
        ).status,
      ).toBe(200);
      expect((await discoverySnapshot())?.attributed_reader_days).toBe(0);
      expect((await discoverySnapshot())?.unattributed_reader_days).toBe(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('attributes the first distinct reader-day to the latest same-account, same-book click and deduplicates replay', async () => {
    const now = Date.now();
    await recordLastCtaClick(
      USER_ID,
      BOOK_ID,
      new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString(),
    );
    await recordLastCtaClick(
      USER_ID,
      BOOK_ID,
      new Date(now - 60 * 1000).toISOString(),
    );

    const first = { ...basePayload, syncBatchId: batchId(51) };
    expect((await sendProgress({ payload: first })).status).toBe(200);
    const afterFirst = await discoverySnapshot();
    expect(afterFirst?.attributed_reader_days).toBe(1);
    expect(afterFirst?.unattributed_reader_days).toBe(0);

    expect((await sendProgress({ payload: first })).status).toBe(200);
    expect(await discoverySnapshot()).toEqual(afterFirst);

    expect(
      (
        await sendProgress({
          payload: { ...basePayload, syncBatchId: batchId(52) },
        })
      ).status,
    ).toBe(200);
    expect((await discoverySnapshot())?.attributed_reader_days).toBe(1);
    expect((await metricSnapshot()).daily?.read_starts).toBe(1);
  });

  it('counts an expired click as an unattributed reader-day', async () => {
    const expiredAt = Date.now() - 7 * 24 * 60 * 60 * 1000 - 2_000;
    await recordLastCtaClick(USER_ID, BOOK_ID, new Date(expiredAt).toISOString());

    expect(
      (
        await sendProgress({
          payload: { ...basePayload, syncBatchId: batchId(53) },
        })
      ).status,
    ).toBe(200);
    expect((await discoverySnapshot())?.unattributed_reader_days).toBe(1);
    expect((await discoverySnapshot())?.attributed_reader_days).toBe(0);
  });

  it('does not attribute a click from another book or account', async () => {
    await recordLastCtaClick(
      USER_ID,
      OTHER_BOOK_ID,
      new Date().toISOString(),
    );
    await recordLastCtaClick(
      OTHER_USER_ID,
      BOOK_ID,
      new Date().toISOString(),
    );

    expect(
      (
        await sendProgress({
          payload: { ...basePayload, syncBatchId: batchId(54) },
        })
      ).status,
    ).toBe(200);
    expect((await discoverySnapshot())?.unattributed_reader_days).toBe(1);
    expect((await discoverySnapshot())?.attributed_reader_days).toBe(0);
  });

  it('counts a signed-in reader-day without any click as unattributed', async () => {
    expect(
      (
        await sendProgress({
          payload: { ...basePayload, syncBatchId: batchId(55) },
        })
      ).status,
    ).toBe(200);
    expect((await discoverySnapshot())?.unattributed_reader_days).toBe(1);
  });

  it('rejects legacy syncs without changing progress or publisher aggregates', async () => {
    const legacy = { currentPage: 8, progressPercent: 100, reading_time_delta: 75 };
    expect((await sendProgress({ payload: legacy })).status).toBe(426);
    expect((await sendProgress({ payload: legacy })).status).toBe(426);
    expect((await metricSnapshot()).daily).toBeNull();
    expect((await metricSnapshot()).progress).toBeNull();
    expect(await discoverySnapshot()).toBeNull();
  });
});
