import { getDb } from '@/lib/db';
import { getPlatformSetting } from '@/lib/platform-settings';
import {
  books as booksTable,
  publisherBookDailyMetrics,
  publisherBookReaderDays,
  publisherProfiles,
  notifications as notificationsTable,
  publisherPayouts,
} from '@bukoo/db';
import { and, desc, eq, gte, inArray, sql } from 'drizzle-orm';
import { bucketReaderLoyalty, getPeriodRange, rankTopBooks, resolveDashboardPeriod, type DateRange } from './metrics';
import type { PublisherCatalogBook } from '../catalog-table';

export async function getPublisherCatalog(publisherUserId: string): Promise<PublisherCatalogBook[]> {
  const db = getDb();
  return db.select({
    id: booksTable.id, title: booksTable.title, author: booksTable.author, synopsis: booksTable.synopsis, totalPages: booksTable.totalPages, genre: booksTable.genre,
    language: booksTable.language, subscriptionRequired: booksTable.subscriptionRequired,
    epubKey: booksTable.epubKey, coverKey: booksTable.coverKey, readCount: booksTable.readCount,
    isPublished: booksTable.isPublished, publicationStatus: booksTable.publicationStatus, updatedAt: booksTable.updatedAt,
  }).from(booksTable).where(eq(booksTable.publisherUserId, publisherUserId)).orderBy(desc(booksTable.createdAt));
}

export interface PublisherBookAnalytics {
  book: { id: string; title: string; author: string; coverKey: string | null };
  period: DateRange;
  daily: { date: string; starts: number; seconds: number; completions: number }[];
  uniqueReaders: number;
  loyalty: ReturnType<typeof bucketReaderLoyalty>;
}

export async function getPublisherBookAnalytics(
  publisherUserId: string,
  bookId: string,
  periodInput?: { period?: string | null; from?: string | null; to?: string | null; now?: Date },
): Promise<PublisherBookAnalytics | null> {
  const db = getDb();
  const period = periodInput ? resolveDashboardPeriod(periodInput) : getPeriodRange('this_month', new Date());
  const book = await db.select({ id: booksTable.id, title: booksTable.title, author: booksTable.author, coverKey: booksTable.coverKey })
    .from(booksTable).where(and(eq(booksTable.id, bookId), eq(booksTable.publisherUserId, publisherUserId))).limit(1);
  if (!book[0]) return null;

  const metricConditions = [eq(publisherBookDailyMetrics.bookId, bookId)];
  if (period.start) metricConditions.push(gte(publisherBookDailyMetrics.metricDate, period.start));
  if (period.endExclusive) metricConditions.push(sql`${publisherBookDailyMetrics.metricDate} < ${period.endExclusive}`);
  const daily = await db.select({
    date: publisherBookDailyMetrics.metricDate,
    starts: publisherBookDailyMetrics.readStarts,
    seconds: publisherBookDailyMetrics.readingSeconds,
    completions: publisherBookDailyMetrics.completedReads,
  }).from(publisherBookDailyMetrics).where(and(...metricConditions)).orderBy(publisherBookDailyMetrics.metricDate);

  const readerConditions = [eq(publisherBookReaderDays.bookId, bookId)];
  if (period.start) readerConditions.push(gte(publisherBookReaderDays.readDate, period.start));
  if (period.endExclusive) readerConditions.push(sql`${publisherBookReaderDays.readDate} < ${period.endExclusive}`);
  const readerRows = await db.select({ userId: publisherBookReaderDays.userId, days: sql<number>`count(*)` })
    .from(publisherBookReaderDays).where(and(...readerConditions)).groupBy(publisherBookReaderDays.userId);
  const loyalty = bucketReaderLoyalty(readerRows.map((row) => Number(row.days)));
  return { book: book[0], period, daily, uniqueReaders: readerRows.length, loyalty };
}

/** Estimated royalty config — documented in the design spec. */
export const ROYALTY_CONFIG = {
  /** Monthly revenue pool (IDR) used for estimates. Set explicitly; defaults to 0. */
  monthlyPool: 0,
  /** Publisher rate in basis points (6500 = 65%). */
  rateBps: 6500,
  /** Formula version. */
  version: 'v1',
};

export interface PublisherDashboardOverview {
  period: DateRange;
  publisherName: string;
  totalBooks: number;
  publishedBooks: number;
  inReviewBooks: number;
  totalDistinctReaders: number;
  totalReadingSeconds: number;
  totalCompletions: number;
  totalLifetimeReads: number;
  monthlyRoyaltyEstimate: number;
  readerLoyalty: ReturnType<typeof bucketReaderLoyalty>;
  topBooks: {
    id: string;
    title: string;
    author: string;
    coverKey: string | null;
    readCount: number;
    readSeconds: number;
    completedReads: number;
  }[];
  recentNotifications: {
    id: string;
    title: string;
    body: string | null;
    createdAt: string;
    read: boolean;
  }[];
  payouts: { id: string; amount: number; currency: string; status: string; externalRef: string | null; createdAt: string }[];
}

export async function getPublisherDashboardOverview(
  publisherUserId: string,
  publisherName?: string | null,
  periodInput?: { period?: string | null; from?: string | null; to?: string | null; now?: Date },
): Promise<PublisherDashboardOverview> {
  const db = getDb();

  const publisherBooks = await db
    .select({
      id: booksTable.id,
      title: booksTable.title,
      author: booksTable.author,
      coverKey: booksTable.coverKey,
      readCount: booksTable.readCount,
      isPublished: booksTable.isPublished,
      publicationStatus: booksTable.publicationStatus,
    })
    .from(booksTable)
    .where(eq(booksTable.publisherUserId, publisherUserId))
    .orderBy(desc(booksTable.createdAt));

  const totalBooks = publisherBooks.length;
  const publishedBooks = publisherBooks.filter((b) => b.isPublished).length;
  const inReviewBooks = publisherBooks.filter((b) => b.publicationStatus === 'IN_REVIEW').length;
  const totalLifetimeReads = publisherBooks.reduce((sum, book) => sum + book.readCount, 0);

  const bookIds = publisherBooks.map((b) => b.id);
  const period = periodInput
    ? resolveDashboardPeriod(periodInput)
    : getPeriodRange('this_month', new Date());

  let totalDistinctReaders = 0;
  let totalReadingSeconds = 0;
  let totalCompletions = 0;
  let readerLoyalty = bucketReaderLoyalty([]);
  const lifetimeMetrics = new Map<string, { readSeconds: number; completedReads: number }>();

  if (bookIds.length > 0) {
    const readerDayConditions = [inArray(publisherBookReaderDays.bookId, bookIds)];
    if (period.start) readerDayConditions.push(gte(publisherBookReaderDays.readDate, period.start));
    if (period.endExclusive) readerDayConditions.push(sql`${publisherBookReaderDays.readDate} < ${period.endExclusive}`);

    const readerRows = await db
      .select({ distinctReaders: sql<number>`count(distinct ${publisherBookReaderDays.userId})` })
      .from(publisherBookReaderDays)
      .where(and(...readerDayConditions));

    totalDistinctReaders = Number(readerRows[0]?.distinctReaders ?? 0);

    const loyaltyConditions = [inArray(publisherBookReaderDays.bookId, bookIds)];
    if (period.start) loyaltyConditions.push(gte(publisherBookReaderDays.readDate, period.start));
    if (period.endExclusive) loyaltyConditions.push(sql`${publisherBookReaderDays.readDate} < ${period.endExclusive}`);
    const loyaltyRows = await db.select({ userId: publisherBookReaderDays.userId, days: sql<number>`count(*)` })
      .from(publisherBookReaderDays).where(and(...loyaltyConditions)).groupBy(publisherBookReaderDays.userId);
    readerLoyalty = bucketReaderLoyalty(loyaltyRows.map((row) => Number(row.days)));

    const metricConditions = [inArray(publisherBookDailyMetrics.bookId, bookIds)];
    if (period.start) metricConditions.push(gte(publisherBookDailyMetrics.metricDate, period.start));
    if (period.endExclusive) metricConditions.push(sql`${publisherBookDailyMetrics.metricDate} < ${period.endExclusive}`);
    const metricRows = await db
      .select({
        readingSeconds: sql<number>`coalesce(sum(${publisherBookDailyMetrics.readingSeconds}), 0)`,
        completedReads: sql<number>`coalesce(sum(${publisherBookDailyMetrics.completedReads}), 0)`,
      })
      .from(publisherBookDailyMetrics)
      .where(and(...metricConditions));

    totalReadingSeconds = Number(metricRows[0]?.readingSeconds ?? 0);
    totalCompletions = Number(metricRows[0]?.completedReads ?? 0);

    const lifetimeRows = await db
      .select({
        bookId: publisherBookDailyMetrics.bookId,
        readSeconds: sql<number>`coalesce(sum(${publisherBookDailyMetrics.readingSeconds}), 0)`,
        completedReads: sql<number>`coalesce(sum(${publisherBookDailyMetrics.completedReads}), 0)`,
      })
      .from(publisherBookDailyMetrics)
      .where(inArray(publisherBookDailyMetrics.bookId, bookIds))
      .groupBy(publisherBookDailyMetrics.bookId);

    for (const row of lifetimeRows) {
      lifetimeMetrics.set(row.bookId, {
        readSeconds: Number(row.readSeconds),
        completedReads: Number(row.completedReads),
      });
    }
  }

  const [monthlyPoolSetting, rateBpsSetting] = await Promise.all([
    getPlatformSetting('royalty_monthly_pool'),
    getPlatformSetting('royalty_rate_bps'),
  ]);
  const monthlyPool = Number(monthlyPoolSetting ?? ROYALTY_CONFIG.monthlyPool);
  const rateBps = Number(rateBpsSetting ?? ROYALTY_CONFIG.rateBps);

  // Estimated royalty from the selected period's reading seconds across the pool.
  const monthlyRoyaltyEstimate =
    monthlyPool > 0
      ? Math.round(
          (totalReadingSeconds / 3600) *
            10 *
            (rateBps / 10000),
        ) * 100
      : 0;

  const topBooks = rankTopBooks(publisherBooks, lifetimeMetrics)
    .map((b) => {
      const agg = lifetimeMetrics.get(b.id);
      return {
        id: b.id,
        title: b.title,
        author: b.author,
        coverKey: b.coverKey,
        readCount: b.readCount,
        readSeconds: agg?.readSeconds ?? 0,
        completedReads: agg?.completedReads ?? 0,
      };
    });

  const profile = await db.query.publisherProfiles.findFirst({
    where: eq(publisherProfiles.userId, publisherUserId),
    columns: { displayName: true },
  });

  const recentNotifications = await db
    .select()
    .from(notificationsTable)
    .where(eq(notificationsTable.userId, publisherUserId))
    .orderBy(desc(notificationsTable.createdAt))
    .limit(5);
  const payouts = await db.select({
    id: publisherPayouts.id,
    amount: publisherPayouts.amount,
    currency: publisherPayouts.currency,
    status: publisherPayouts.status,
    externalRef: publisherPayouts.externalRef,
    createdAt: publisherPayouts.createdAt,
  }).from(publisherPayouts).where(eq(publisherPayouts.publisherUserId, publisherUserId)).orderBy(desc(publisherPayouts.createdAt));

  return {
    period,
    publisherName: publisherName || profile?.displayName || 'Mitra Penerbit',
    totalBooks,
    publishedBooks,
    inReviewBooks,
    totalDistinctReaders,
    totalReadingSeconds,
    totalCompletions,
    totalLifetimeReads,
    monthlyRoyaltyEstimate,
    readerLoyalty,
    topBooks,
    recentNotifications: recentNotifications.map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      createdAt: n.createdAt,
      read: !!n.readAt,
    })),
    payouts,
  };
}