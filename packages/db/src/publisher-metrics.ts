/**
 * Publisher reading-metric aggregation helpers.
 *
 * These functions keep the publisher analytics tables in sync with reading
 * progress updates in a D1-safe, idempotent way:
 *  - `publisherBookReaderDays`: one row per (book, user, date) — distinct reader-days.
 *  - `publisherBookDailyMetrics`: daily starts, completions, reading seconds.
 *  - `books.readCount` / `books.readTimeMinutes`: lifetime counters.
 *
 * IMPORTANT: never re-introduce FTS5 DELETE/UPDATE operations here. These
 * helpers only INSERT (or UPSERT scalar columns), which D1 supports.
 */

import {
  books,
  publisherBookCountryMetrics,
  publisherBookDailyMetrics,
  publisherBookReaderDays,
} from './schema.js';
import { and, eq, sql } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import type * as schema from './schema.js';
import { createId } from '@paralleldrive/cuid2';

export type Database = DrizzleD1Database<typeof schema>;

function todayDate(): string {
  // 'YYYY-MM-DD' in UTC — matches the reader-day/daily-metric key.
  return new Date().toISOString().slice(0, 10);
}

/** ISO 3166-1 alpha-2, or XX when missing/invalid. Never stores an IP. */
export function normalizeCountryCode(value: string | null | undefined): string {
  const code = value?.trim().toUpperCase() ?? '';
  if (/^[A-Z]{2}$/.test(code) && code !== 'T1') return code;
  return 'XX';
}

/**
 * Record a reading progress event for publisher analytics.
 *
 * Idempotency:
 *  - Increments readStarts only on the first reader-day for (book, user, date).
 *  - Increments completedReads only when progress crosses 100.
 *  - Adds readingSeconds to the day metric and lifetime readTimeMinutes.
 *  - Adds the delta to `books.readCount` (distinct active readers per day) lazily.
 */
export async function recordPublisherReadingMetric(
  db: Database,
  input: {
    userId: string;
    bookId: string;
    progressPercent: number;
    readingSecondsDelta?: number;
    isStart?: boolean;
    isCompletion?: boolean;
    /** Cloudflare CF-IPCountry (ISO alpha-2). Never pass an IP. */
    countryCode?: string | null;
  },
): Promise<void> {
  const {
    userId,
    bookId,
    progressPercent,
    readingSecondsDelta = 0,
    isStart = false,
    isCompletion = false,
    countryCode,
  } = input;
  const today = todayDate();
  const now = new Date().toISOString();

  // 1) Upsert reader-day (distinct reader per day). Uses INSERT ... ON CONFLICT DO NOTHING.
  await db
    .insert(publisherBookReaderDays)
    .values({
      bookId,
      userId,
      readDate: today,
      firstReadAt: now,
      lastReadAt: now,
    })
    .onConflictDoNothing();

  // 2) Check whether this (book,user,date) row is fresh (was it just inserted?).
  //    We detect "new reader-day" by re-querying whether the row's firstReadAt
  //    equals our `now` (no prior row existed).
  const day = await db.query.publisherBookReaderDays.findFirst({
    where: and(
      eq(publisherBookReaderDays.bookId, bookId),
      eq(publisherBookReaderDays.userId, userId),
      eq(publisherBookReaderDays.readDate, today),
    ),
  });

  const isNewReaderDay = !!day && day.firstReadAt === now;

  // 3) Upsert the daily metric row.
  const existingMetric = await db.query.publisherBookDailyMetrics.findFirst({
    where: and(
      eq(publisherBookDailyMetrics.bookId, bookId),
      eq(publisherBookDailyMetrics.metricDate, today),
    ),
  });

  const nextStarts =
    (existingMetric?.readStarts ?? 0) + (isStart || isNewReaderDay ? 1 : 0);
  const nextCompletions =
    (existingMetric?.completedReads ?? 0) + (isCompletion ? 1 : 0);
  const nextSeconds =
    (existingMetric?.readingSeconds ?? 0) + readingSecondsDelta;

  if (existingMetric) {
    await db
      .update(publisherBookDailyMetrics)
      .set({
        readStarts: nextStarts,
        completedReads: nextCompletions,
        readingSeconds: nextSeconds,
        updatedAt: now,
      })
      .where(eq(publisherBookDailyMetrics.id, existingMetric.id));
  } else {
    await db.insert(publisherBookDailyMetrics).values({
      id: createId(),
      bookId,
      metricDate: today,
      readStarts: nextStarts,
      completedReads: nextCompletions,
      readingSeconds: nextSeconds,
    });
  }

  // 4) Update lifetime counters on the book.
  if (readingSecondsDelta > 0 || isNewReaderDay) {
    await db
      .update(books)
      .set({
        readTimeMinutes: sql`${books.readTimeMinutes} + ${Math.floor(readingSecondsDelta / 60)}`,
        updatedAt: now,
      })
      .where(eq(books.id, bookId));
  }
  if (isNewReaderDay) {
    await db
      .update(books)
      .set({
        readCount: sql`${books.readCount} + 1`,
        updatedAt: now,
      })
      .where(eq(books.id, bookId));

    const country = normalizeCountryCode(countryCode);
    const existingCountry = await db.query.publisherBookCountryMetrics.findFirst({
      where: and(
        eq(publisherBookCountryMetrics.bookId, bookId),
        eq(publisherBookCountryMetrics.metricDate, today),
        eq(publisherBookCountryMetrics.countryCode, country),
      ),
    });
    if (existingCountry) {
      await db
        .update(publisherBookCountryMetrics)
        .set({
          readerDays: existingCountry.readerDays + 1,
          updatedAt: now,
        })
        .where(eq(publisherBookCountryMetrics.id, existingCountry.id));
    } else {
      await db.insert(publisherBookCountryMetrics).values({
        id: createId(),
        bookId,
        metricDate: today,
        countryCode: country,
        readerDays: 1,
      });
    }
  }
}