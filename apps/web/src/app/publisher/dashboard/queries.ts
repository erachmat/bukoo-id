import { getDb } from '@/lib/db';
import {
  books as booksTable,
  publisherBookDailyMetrics,
  publisherBookReaderDays,
  notifications as notificationsTable,
} from '@bukoo/db';
import { eq, desc, sql, gt } from 'drizzle-orm';

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
  publisherName: string;
  totalBooks: number;
  publishedBooks: number;
  inReviewBooks: number;
  totalDistinctReaders: number;
  totalReadingSeconds: number;
  totalCompletions: number;
  monthlyRoyaltyEstimate: number;
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
}

export async function getPublisherDashboardOverview(publisherUserId: string): Promise<PublisherDashboardOverview> {
  const db = getDb();

  const publisherBooks = await db
    .select()
    .from(booksTable)
    .where(eq(booksTable.publisherUserId, publisherUserId))
    .orderBy(desc(booksTable.createdAt));

  const totalBooks = publisherBooks.length;
  const publishedBooks = publisherBooks.filter((b) => b.isPublished).length;
  const inReviewBooks = publisherBooks.filter((b) => b.publicationStatus === 'IN_REVIEW').length;

  const bookIds = publisherBooks.map((b) => b.id);
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = today.slice(0, 8) + '01'; // first day of current month

  let totalDistinctReaders = 0;
  let totalReadingSeconds = 0;
  let totalCompletions = 0;

  if (bookIds.length > 0) {
    const readerDays = await db
      .select({ userId: publisherBookReaderDays.userId })
      .from(publisherBookReaderDays)
      .where(gt(publisherBookReaderDays.readDate, monthStart));

    // Distinct readers in the current month.
    totalDistinctReaders = new Set(readerDays.map((r) => r.userId)).size;

    const metricRows = await db
      .select()
      .from(publisherBookDailyMetrics)
      .where(gt(publisherBookDailyMetrics.metricDate, monthStart));

    totalReadingSeconds = metricRows.reduce((sum, m) => sum + m.readingSeconds, 0);
    totalCompletions = metricRows.reduce((sum, m) => sum + m.completedReads, 0);
  }

  // Estimated royalty from this month's reading seconds across the pool.
  const monthlyRoyaltyEstimate =
    ROYALTY_CONFIG.monthlyPool > 0
      ? Math.round(
          (totalReadingSeconds / 3600) *
            10 *
            (ROYALTY_CONFIG.rateBps / 10000),
        ) * 100
      : 0;

  const topBooks = await Promise.all(
    publisherBooks.slice(0, 5).map(async (b) => {
      const rows = await db
        .select({
          readSeconds: sql<number>`coalesce(sum(${publisherBookDailyMetrics.readingSeconds}), 0)`,
          completedReads: sql<number>`coalesce(sum(${publisherBookDailyMetrics.completedReads}), 0)`,
        })
        .from(publisherBookDailyMetrics)
        .where(eq(publisherBookDailyMetrics.bookId, b.id));
      const agg = rows[0];
      return {
        id: b.id,
        title: b.title,
        author: b.author,
        coverKey: b.coverKey,
        readCount: b.readCount,
        readSeconds: agg?.readSeconds ?? 0,
        completedReads: agg?.completedReads ?? 0,
      };
    }),
  );

  const recentNotifications = await db
    .select()
    .from(notificationsTable)
    .where(eq(notificationsTable.userId, publisherUserId))
    .orderBy(desc(notificationsTable.createdAt))
    .limit(5);

  return {
    publisherName: '',
    totalBooks,
    publishedBooks,
    inReviewBooks,
    totalDistinctReaders,
    totalReadingSeconds,
    totalCompletions,
    monthlyRoyaltyEstimate,
    topBooks,
    recentNotifications: recentNotifications.map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      createdAt: n.createdAt,
      read: !!n.readAt,
    })),
  };
}