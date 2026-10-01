import { getDb } from '@/lib/db';
import { getPlatformSetting } from '@/lib/platform-settings';
import {
  books as booksTable,
  bookDiscoveryDailyMetrics,
  publisherBookDailyMetrics,
  publisherBookReaderDays,
  publisherBookCountryMetrics,
  publisherProfiles,
  notifications as notificationsTable,
  publisherPayouts,
  publisherSubmissions,
  readingProgress as readingProgressTable,
  subscriptions,
  users as usersTable,
} from '@bukoo/db';
import { and, desc, eq, gte, inArray, sql } from 'drizzle-orm';
import {
  AGE_GROUP_LABELS,
  bucketAgeGroups,
  bucketGenders,
  bucketPremiumReaders,
  bucketReaderLoyalty,
  estimatePooledRoyalty,
  getPeriodRange,
  getPreviousPeriodRange,
  rankTopBooks,
  resolveDashboardPeriod,
  type AgeGroupLabel,
  type DateRange,
  type GenderCounts,
  type MonthlyBookReading,
} from './metrics';
import { tierFromSubscription } from '@/lib/subscription';
import type { PublisherCatalogBook } from '../catalog-table';

export async function getPublisherCatalog(publisherUserId: string): Promise<PublisherCatalogBook[]> {
  const db = getDb();
  const catalog = await db.select({
    id: booksTable.id, title: booksTable.title, author: booksTable.author, synopsis: booksTable.synopsis, totalPages: booksTable.totalPages, genre: booksTable.genre,
    language: booksTable.language, subscriptionRequired: booksTable.subscriptionRequired,
    epubKey: booksTable.epubKey, coverKey: booksTable.coverKey, readCount: booksTable.readCount,
    isPublished: booksTable.isPublished, publicationStatus: booksTable.publicationStatus, archivedAt: booksTable.archivedAt, isbn: booksTable.isbn, updatedAt: booksTable.updatedAt, featured: booksTable.featured,
  }).from(booksTable).where(eq(booksTable.publisherUserId, publisherUserId)).orderBy(desc(booksTable.createdAt));
  const reviews = await db.select({ bookId: publisherSubmissions.bookId, reviewNote: publisherSubmissions.reviewNote, status: publisherSubmissions.status })
    .from(publisherSubmissions).where(eq(publisherSubmissions.publisherUserId, publisherUserId)).orderBy(desc(publisherSubmissions.updatedAt));
  const latest = new Map<string, { reviewNote: string | null; status: string }>();
  for (const review of reviews) if (review.bookId && !latest.has(review.bookId)) latest.set(review.bookId, review);
  return catalog.map((book) => ({ ...book, reviewNote: latest.get(book.id)?.reviewNote ?? null }));
}

export interface PublisherBookAnalytics {
  book: { id: string; title: string; author: string; coverKey: string | null };
  period: DateRange;
  daily: { date: string; starts: number; seconds: number; completions: number }[];
  uniqueReaders: number;
  loyalty: ReturnType<typeof bucketReaderLoyalty>;
  discovery: {
    status: 'ready' | 'error';
    coverageStart: string | null;
    coverageEnd: string | null;
    daily: {
      date: string;
      anonymousDetailViews: number;
      anonymousAppCtaClicks: number;
      signedInDetailViews: number;
      signedInAppCtaClicks: number;
      attributedReaderDays: number;
      unattributedReaderDays: number;
    }[];
  };
}

export interface PublisherDiscoveryFunnelCounts {
  anonymousDetailViews: number;
  anonymousAppCtaClicks: number;
  signedInDetailViews: number;
  signedInAppCtaClicks: number;
  attributedReaderDays: number;
  unattributedReaderDays: number;
}

export function sumPublisherDiscoveryDailyMetrics(
  rows: readonly PublisherDiscoveryFunnelCounts[],
): PublisherDiscoveryFunnelCounts {
  return rows.reduce((totals, row) => ({
    anonymousDetailViews: totals.anonymousDetailViews + row.anonymousDetailViews,
    anonymousAppCtaClicks: totals.anonymousAppCtaClicks + row.anonymousAppCtaClicks,
    signedInDetailViews: totals.signedInDetailViews + row.signedInDetailViews,
    signedInAppCtaClicks: totals.signedInAppCtaClicks + row.signedInAppCtaClicks,
    attributedReaderDays: totals.attributedReaderDays + row.attributedReaderDays,
    unattributedReaderDays: totals.unattributedReaderDays + row.unattributedReaderDays,
  }), {
    anonymousDetailViews: 0,
    anonymousAppCtaClicks: 0,
    signedInDetailViews: 0,
    signedInAppCtaClicks: 0,
    attributedReaderDays: 0,
    unattributedReaderDays: 0,
  });
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

  let discovery: PublisherBookAnalytics['discovery'];
  try {
    const discoveryConditions = [eq(bookDiscoveryDailyMetrics.bookId, bookId)];
    if (period.start) discoveryConditions.push(gte(bookDiscoveryDailyMetrics.metricDate, period.start));
    if (period.endExclusive) discoveryConditions.push(sql`${bookDiscoveryDailyMetrics.metricDate} < ${period.endExclusive}`);
    const [discoveryDaily, coverageRows] = await Promise.all([
      db.select({
        date: bookDiscoveryDailyMetrics.metricDate,
        anonymousDetailViews: bookDiscoveryDailyMetrics.anonymousDetailViews,
        anonymousAppCtaClicks: bookDiscoveryDailyMetrics.anonymousAppCtaClicks,
        signedInDetailViews: bookDiscoveryDailyMetrics.signedInDetailViews,
        signedInAppCtaClicks: bookDiscoveryDailyMetrics.signedInAppCtaClicks,
        attributedReaderDays: bookDiscoveryDailyMetrics.attributedReaderDays,
        unattributedReaderDays: bookDiscoveryDailyMetrics.unattributedReaderDays,
      })
        .from(bookDiscoveryDailyMetrics)
        .where(and(...discoveryConditions))
        .orderBy(bookDiscoveryDailyMetrics.metricDate),
      db.select({
        coverageStart: sql<string | null>`min(${bookDiscoveryDailyMetrics.metricDate})`,
        coverageEnd: sql<string | null>`max(${bookDiscoveryDailyMetrics.metricDate})`,
      })
        .from(bookDiscoveryDailyMetrics)
        .where(eq(bookDiscoveryDailyMetrics.bookId, bookId)),
    ]);
    discovery = {
      status: 'ready',
      coverageStart: coverageRows[0]?.coverageStart ?? null,
      coverageEnd: coverageRows[0]?.coverageEnd ?? null,
      daily: discoveryDaily.map((row) => ({
        ...row,
        anonymousDetailViews: Number(row.anonymousDetailViews),
        anonymousAppCtaClicks: Number(row.anonymousAppCtaClicks),
        signedInDetailViews: Number(row.signedInDetailViews),
        signedInAppCtaClicks: Number(row.signedInAppCtaClicks),
        attributedReaderDays: Number(row.attributedReaderDays),
        unattributedReaderDays: Number(row.unattributedReaderDays),
      })),
    };
  } catch {
    discovery = { status: 'error', coverageStart: null, coverageEnd: null, daily: [] };
  }

  return { book: book[0], period, daily, uniqueReaders: readerRows.length, loyalty, discovery };
}

export type PublisherDiscoveryFunnelExportRow = {
  bookId: string;
  title: string;
  author: string;
  coverageStart: string | null;
  coverageEnd: string | null;
  /** True only when the selected range contains a stored daily funnel row. */
  hasSelectedMetrics: boolean;
} & PublisherDiscoveryFunnelCounts;

export function buildPublisherDiscoveryFunnelRows(
  publisherBooks: readonly { id: string; title: string; author: string }[],
  dailyRows: readonly ({ bookId: string } & PublisherDiscoveryFunnelCounts)[],
  coverageRows: readonly { bookId: string; coverageStart: string | null; coverageEnd: string | null }[],
): PublisherDiscoveryFunnelExportRow[] {
  const totals = new Map<string, PublisherDiscoveryFunnelCounts>();
  for (const row of dailyRows) {
    const current = totals.get(row.bookId) ?? sumPublisherDiscoveryDailyMetrics([]);
    totals.set(row.bookId, sumPublisherDiscoveryDailyMetrics([current, {
      anonymousDetailViews: Number(row.anonymousDetailViews),
      anonymousAppCtaClicks: Number(row.anonymousAppCtaClicks),
      signedInDetailViews: Number(row.signedInDetailViews),
      signedInAppCtaClicks: Number(row.signedInAppCtaClicks),
      attributedReaderDays: Number(row.attributedReaderDays),
      unattributedReaderDays: Number(row.unattributedReaderDays),
    }]));
  }
  const booksWithSelectedMetrics = new Set(dailyRows.map((row) => row.bookId));
  const coverageByBook = new Map(coverageRows.map((row) => [row.bookId, {
    coverageStart: row.coverageStart,
    coverageEnd: row.coverageEnd,
  }]));

  return publisherBooks.map((book) => ({
    bookId: book.id,
    title: book.title,
    author: book.author,
    ...(coverageByBook.get(book.id) ?? { coverageStart: null, coverageEnd: null }),
    hasSelectedMetrics: booksWithSelectedMetrics.has(book.id),
    ...(totals.get(book.id) ?? sumPublisherDiscoveryDailyMetrics([])),
  }));
}

export interface PublisherDiscoveryFunnelReport {
  period: DateRange;
  rows: PublisherDiscoveryFunnelExportRow[];
}

export async function getPublisherDiscoveryFunnelExport(
  publisherUserId: string,
  periodInput?: { period?: string | null; from?: string | null; to?: string | null; now?: Date },
  bookId?: string | null,
): Promise<PublisherDiscoveryFunnelReport> {
  const db = getDb();
  const period = periodInput
    ? resolveDashboardPeriod(periodInput)
    : getPeriodRange('this_month', new Date());
  const bookConditions = [eq(booksTable.publisherUserId, publisherUserId)];
  if (bookId) bookConditions.push(eq(booksTable.id, bookId));
  const publisherBooks = await db
    .select({ id: booksTable.id, title: booksTable.title, author: booksTable.author })
    .from(booksTable)
    .where(and(...bookConditions));
  if (publisherBooks.length === 0) return { period, rows: [] };

  const bookIds = publisherBooks.map((book) => book.id);
  const metricConditions = [inArray(bookDiscoveryDailyMetrics.bookId, bookIds)];
  if (period.start) metricConditions.push(gte(bookDiscoveryDailyMetrics.metricDate, period.start));
  if (period.endExclusive) metricConditions.push(sql`${bookDiscoveryDailyMetrics.metricDate} < ${period.endExclusive}`);
  const [dailyRows, coverageRows] = await Promise.all([
    db.select({
      bookId: bookDiscoveryDailyMetrics.bookId,
      anonymousDetailViews: bookDiscoveryDailyMetrics.anonymousDetailViews,
      anonymousAppCtaClicks: bookDiscoveryDailyMetrics.anonymousAppCtaClicks,
      signedInDetailViews: bookDiscoveryDailyMetrics.signedInDetailViews,
      signedInAppCtaClicks: bookDiscoveryDailyMetrics.signedInAppCtaClicks,
      attributedReaderDays: bookDiscoveryDailyMetrics.attributedReaderDays,
      unattributedReaderDays: bookDiscoveryDailyMetrics.unattributedReaderDays,
    })
      .from(bookDiscoveryDailyMetrics)
      .where(and(...metricConditions)),
    db.select({
      bookId: bookDiscoveryDailyMetrics.bookId,
      coverageStart: sql<string | null>`min(${bookDiscoveryDailyMetrics.metricDate})`,
      coverageEnd: sql<string | null>`max(${bookDiscoveryDailyMetrics.metricDate})`,
    })
      .from(bookDiscoveryDailyMetrics)
      .where(inArray(bookDiscoveryDailyMetrics.bookId, bookIds))
      .groupBy(bookDiscoveryDailyMetrics.bookId),
  ]);

  return {
    period,
    rows: buildPublisherDiscoveryFunnelRows(publisherBooks, dailyRows, coverageRows),
  };
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

export interface TrendPoint {
  /** 'YYYY-MM-DD' for daily points, 'YYYY-MM' for monthly rollup. */
  bucket: string;
  reads: number;
  seconds: number;
  completions: number;
}

export interface MonthlyRoyaltyPoint {
  bucket: string;
  amount: number;
}

export interface MonthlyReadPoint {
  bucket: string;
  reads: number;
}

export interface KpiComparison {
  previous: number;
  /** null when the previous window has no data → render 'baru' instead of a misleading delta. */
  hasData: boolean;
}

export interface PublisherDemographics {
  ageGroups: { label: AgeGroupLabel; count: number }[];
  gender: GenderCounts;
  knownCount: number;
}

export interface EngagementFunnel {
  opened: number;
  /** Progress ≥10% — null when the publisher has no reading_progress data (2-step fallback). */
  tenPlus: number | null;
  /** Progress ≥50% — null when the publisher has no reading_progress data. */
  fiftyPlus: number | null;
  completed: number;
  hasProgressData: boolean;
}

export interface CityReaders {
  city: string;
  readers: number;
}

export interface RhythmPoint {
  bucket: string;
  reads: number;
}

export interface PublisherBookStat {
  id: string;
  title: string;
  author: string;
  coverKey: string | null;
  subscriptionRequired: string;
  isPublished: boolean;
  lifetimeReads: number;
  reads: number;
  previousReads: number;
  hasPreviousReads: boolean;
  seconds: number;
  completions: number;
  estimatedRoyalty: number;
}

export interface PublisherDashboardOverview {
  period: DateRange;
  publisherName: string;
  totalBooks: number;
  publishedBooks: number;
  inReviewBooks: number;
  totalDistinctReaders: number;
  totalReadStarts: number;
  totalReadingSeconds: number;
  totalCompletions: number;
  totalLifetimeReads: number;
  royaltyEstimate: number;
  readerLoyalty: ReturnType<typeof bucketReaderLoyalty>;
  geo: { countryCode: string; readerDays: number }[];
  topBooks: {
    id: string;
    title: string;
    author: string;
    coverKey: string | null;
    readCount: number;
    readSeconds: number;
    completedReads: number;
  }[];
  /** Per-KPI previous-window values for ▲/▼ delta chips. */
  comparison: {
    reads: KpiComparison;
    readers: KpiComparison;
    seconds: KpiComparison;
    completions: KpiComparison;
    royalty: KpiComparison;
  };
  /** In-period reading activity series (daily for months/quarters, monthly for YTD). */
  dailyTrend: TrendPoint[];
  /** Latest stored reading activity date within the selected period, in UTC. */
  readingDataThrough: string | null;
  /** Read starts grouped by month from January through the selected month. */
  monthlyReadTrend: MonthlyReadPoint[];
  /** Actual-data royalty estimates for the current month and preceding five months. */
  royaltyTrend: MonthlyRoyaltyPoint[];
  /** Readers-days split across each book's genres (a book with 2 genres contributes to both). */
  genreSplit: { genre: string; readerDays: number }[];
  demographics: PublisherDemographics | null;
  funnel: EngagementFunnel;
  /** Distinct in-period readers by self-declared city (top 8 + Lainnya). */
  cities: CityReaders[];
  /** Reads per weekday, '0'=Minggu … '6'=Sabtu. */
  weekdayRhythm: RhythmPoint[];
  /** Reads per hour-of-day (00–23) from reader-day last_read_at. */
  hourRhythm: RhythmPoint[];
  /** Per-book period stats for the Performa tab (all books, not just top N). */
  bookStats: PublisherBookStat[];
  recentNotifications: {
    id: string;
    title: string;
    body: string | null;
    createdAt: string;
    read: boolean;
  }[];
  payouts: { id: string; amount: number; currency: string; status: string; externalRef: string | null; createdAt: string }[];
  premiumInsights: {
    premiumBookCount: number;
    books: { id: string; title: string; requiredTier: string; distinctReaders: number; belowTierReaders: number; eligibleReaders: number }[];
  };
}

/** Parse a books.genre JSON text column into a string[] safely. */
function parseGenres(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((g): g is string => typeof g === 'string') : [];
  } catch {
    return [];
  }
}

/** Bucket key for the trend chart: daily ISO date, or 'YYYY-MM' when monthly=true. */
function trendBucketKey(date: string, monthly: boolean): string {
  return monthly ? date.slice(0, 7) : date;
}

export function buildMonthlyReadTrend(
  year: number,
  selectedMonth: number,
  rows: readonly { month: string; reads: number }[],
): MonthlyReadPoint[] {
  const lastMonth = Math.max(1, Math.min(12, Math.trunc(selectedMonth)));
  const totals = new Map<string, number>();
  for (const row of rows) totals.set(row.month, (totals.get(row.month) ?? 0) + Number(row.reads || 0));
  return Array.from({ length: lastMonth }, (_, index) => {
    const bucket = `${year}-${String(index + 1).padStart(2, '0')}`;
    return { bucket, reads: totals.get(bucket) ?? 0 };
  });
}

export function getLatestMetricDate(rows: readonly { metricDate: string }[]): string | null {
  return rows.reduce<string | null>(
    (latest, row) => !latest || row.metricDate > latest ? row.metricDate : latest,
    null,
  );
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
      subscriptionRequired: booksTable.subscriptionRequired,
      genre: booksTable.genre,
    })
    .from(booksTable)
    .where(eq(booksTable.publisherUserId, publisherUserId))
    .orderBy(desc(booksTable.createdAt));

  const totalBooks = publisherBooks.length;
  const publishedBooks = publisherBooks.filter((b) => b.isPublished).length;
  const inReviewBooks = publisherBooks.filter((b) => b.publicationStatus === 'IN_REVIEW').length;
  const totalLifetimeReads = publisherBooks.reduce((sum, book) => sum + book.readCount, 0);

  const bookIds = publisherBooks.map((b) => b.id);
  const eligibleBookIds = publisherBooks.filter((book) => book.isPublished).map((book) => book.id);
  const period = periodInput
    ? resolveDashboardPeriod(periodInput)
    : getPeriodRange('this_month', new Date());

  let totalDistinctReaders = 0;
  let totalReadingSeconds = 0;
  let totalCompletions = 0;
  let totalReadStarts = 0;
  let readerLoyalty = bucketReaderLoyalty([]);
  let geo: { countryCode: string; readerDays: number }[] = [];
  const lifetimeMetrics = new Map<string, { readSeconds: number; completedReads: number }>();
  const comparison = {
    reads: { previous: 0, hasData: false },
    readers: { previous: 0, hasData: false },
    seconds: { previous: 0, hasData: false },
    completions: { previous: 0, hasData: false },
    royalty: { previous: 0, hasData: false },
  };
  const dailyTrendMap = new Map<string, { reads: number; seconds: number; completions: number }>();
  let genreSplit: { genre: string; readerDays: number }[] = [];
  let demographics: PublisherDemographics | null = null;
  let funnel: EngagementFunnel = { opened: 0, tenPlus: null, fiftyPlus: null, completed: 0, hasProgressData: false };
  let cities: CityReaders[] = [];
  let weekdayRhythm: RhythmPoint[] = [];
  let hourRhythm: RhythmPoint[] = [];
  let readingDataThrough: string | null = null;
  const bookStatsMap = new Map<string, { reads: number; seconds: number; completions: number }>();
  const previousBookReads = new Map<string, number>();

  const previousRange = getPreviousPeriodRange(period);

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

    const countryConditions = [inArray(publisherBookCountryMetrics.bookId, bookIds)];
    if (period.start) countryConditions.push(gte(publisherBookCountryMetrics.metricDate, period.start));
    if (period.endExclusive) countryConditions.push(sql`${publisherBookCountryMetrics.metricDate} < ${period.endExclusive}`);
    const countryRows = await db.select({
      countryCode: publisherBookCountryMetrics.countryCode,
      readerDays: sql<number>`coalesce(sum(${publisherBookCountryMetrics.readerDays}), 0)`,
    }).from(publisherBookCountryMetrics).where(and(...countryConditions)).groupBy(publisherBookCountryMetrics.countryCode).orderBy(desc(sql`sum(${publisherBookCountryMetrics.readerDays})`));
    geo = countryRows.map((row) => ({ countryCode: row.countryCode, readerDays: Number(row.readerDays) }));

    const metricConditions = [inArray(publisherBookDailyMetrics.bookId, bookIds)];
    if (period.start) metricConditions.push(gte(publisherBookDailyMetrics.metricDate, period.start));
    if (period.endExclusive) metricConditions.push(sql`${publisherBookDailyMetrics.metricDate} < ${period.endExclusive}`);
    const metricRows = await db
      .select({
        readStarts: sql<number>`coalesce(sum(${publisherBookDailyMetrics.readStarts}), 0)`,
        readingSeconds: sql<number>`coalesce(sum(${publisherBookDailyMetrics.readingSeconds}), 0)`,
        completedReads: sql<number>`coalesce(sum(${publisherBookDailyMetrics.completedReads}), 0)`,
      })
      .from(publisherBookDailyMetrics)
      .where(and(...metricConditions));

    totalReadStarts = Number(metricRows[0]?.readStarts ?? 0);
    totalReadingSeconds = Number(metricRows[0]?.readingSeconds ?? 0);
    totalCompletions = Number(metricRows[0]?.completedReads ?? 0);

    // Trend series — daily buckets, except ytd where 200+ days would be unreadable.
    const trendRows = await db
      .select({
        metricDate: publisherBookDailyMetrics.metricDate,
        starts: sql<number>`coalesce(sum(${publisherBookDailyMetrics.readStarts}), 0)`,
        seconds: sql<number>`coalesce(sum(${publisherBookDailyMetrics.readingSeconds}), 0)`,
        completions: sql<number>`coalesce(sum(${publisherBookDailyMetrics.completedReads}), 0)`,
      })
      .from(publisherBookDailyMetrics)
      .where(and(...metricConditions))
      .groupBy(publisherBookDailyMetrics.metricDate);
    readingDataThrough = getLatestMetricDate(trendRows);
    const monthlyBuckets = period.key === 'ytd';
    for (const row of trendRows) {
      const key = trendBucketKey(row.metricDate, monthlyBuckets);
      const agg = dailyTrendMap.get(key) ?? { reads: 0, seconds: 0, completions: 0 };
      agg.reads += Number(row.starts);
      agg.seconds += Number(row.seconds);
      agg.completions += Number(row.completions);
      dailyTrendMap.set(key, agg);
    }

    // Funnel — opened = distinct reader×book pairs; mid-steps from reading_progress
    // (progress_percent 0–100); completed = daily-metric completions. The progress
    // join is skipped when the publisher has no progress rows (hasProgressData=false).
    const pairRows = await db
      .select({ userId: publisherBookReaderDays.userId, bookId: publisherBookReaderDays.bookId })
      .from(publisherBookReaderDays)
      .where(and(...readerDayConditions))
      .groupBy(publisherBookReaderDays.userId, publisherBookReaderDays.bookId);

    let startRowsOpen = 0;
    const startRows = await db
      .select({ starts: sql<number>`coalesce(sum(${publisherBookDailyMetrics.readStarts}), 0)` })
      .from(publisherBookDailyMetrics)
      .where(and(...metricConditions));
    startRowsOpen = Number(startRows[0]?.starts ?? 0);

    let tenPlus: number | null = null;
    let fiftyPlus: number | null = null;
    let hasProgressData = false;
    if (pairRows.length > 0) {
      const pairSet = new Set(pairRows.map((p) => `${p.userId}|${p.bookId}`));
      const progressRows = await db
        .select({ userId: readingProgressTable.userId, bookId: readingProgressTable.bookId, progress: readingProgressTable.progressPercent })
        .from(readingProgressTable)
        .where(and(
          inArray(readingProgressTable.userId, pairRows.map((p) => p.userId)),
          inArray(readingProgressTable.bookId, bookIds),
        ));
      const inScope = progressRows.filter((r) => pairSet.has(`${r.userId}|${r.bookId}`));
      if (inScope.length > 0) {
        hasProgressData = true;
        tenPlus = inScope.filter((r) => r.progress >= 10).length;
        fiftyPlus = inScope.filter((r) => r.progress >= 50).length;
      }
    }
    funnel = { opened: startRowsOpen, tenPlus, fiftyPlus, completed: totalCompletions, hasProgressData };

    // Weekday rhythm — reads per day-of-week ('0'=Minggu … '6'=Sabtu).
    const weekdayRows = await db
      .select({
        dow: sql<string>`strftime('%w', ${publisherBookDailyMetrics.metricDate})`,
        reads: sql<number>`coalesce(sum(${publisherBookDailyMetrics.readStarts}), 0)`,
      })
      .from(publisherBookDailyMetrics)
      .where(and(...metricConditions))
      .groupBy(sql`strftime('%w', ${publisherBookDailyMetrics.metricDate})`);
    weekdayRhythm = weekdayRows.map((r) => ({ bucket: r.dow, reads: Number(r.reads) }));

  // Hour rhythm — last-read hour per reader-day.
    const hourRows = await db
      .select({
        hour: sql<string>`strftime('%H', ${publisherBookReaderDays.lastReadAt})`,
        reads: sql<number>`count(*)`,
      })
      .from(publisherBookReaderDays)
      .where(and(...readerDayConditions))
      .groupBy(sql`strftime('%H', ${publisherBookReaderDays.lastReadAt})`);
    hourRhythm = hourRows.map((r) => ({ bucket: r.hour, reads: Number(r.reads) }));

    // Cities — distinct in-period readers by self-declared city.
    const cityRows = await db
      .select({
        city: usersTable.city,
        readers: sql<number>`count(distinct ${publisherBookReaderDays.userId})`,
      })
      .from(publisherBookReaderDays)
      .innerJoin(usersTable, eq(usersTable.id, publisherBookReaderDays.userId))
      .where(and(...readerDayConditions))
      .groupBy(usersTable.city);
    const cityList = cityRows
      .map((r) => ({ city: r.city || 'Lainnya', readers: Number(r.readers) }))
      .sort((a, b) => b.readers - a.readers);
    const topCities = cityList.slice(0, 8);
    const restReaders = cityList.slice(8).reduce((sum, c) => sum + c.readers, 0);
    if (restReaders > 0) topCities.push({ city: 'Lainnya', readers: restReaders });
    cities = topCities;

    // Previous-period aggregates for KPI deltas.
    if (previousRange) {
      const prevMetricConditions = [inArray(publisherBookDailyMetrics.bookId, bookIds)];
      if (previousRange.start) prevMetricConditions.push(gte(publisherBookDailyMetrics.metricDate, previousRange.start));
      if (previousRange.endExclusive) prevMetricConditions.push(sql`${publisherBookDailyMetrics.metricDate} < ${previousRange.endExclusive}`);
      const prevMetricRows = await db
        .select({
          seconds: sql<number>`coalesce(sum(${publisherBookDailyMetrics.readingSeconds}), 0)`,
          completions: sql<number>`coalesce(sum(${publisherBookDailyMetrics.completedReads}), 0)`,
          starts: sql<number>`coalesce(sum(${publisherBookDailyMetrics.readStarts}), 0)`,
        })
        .from(publisherBookDailyMetrics)
        .where(and(...prevMetricConditions));
      const prevSeconds = Number(prevMetricRows[0]?.seconds ?? 0);
      const prevCompletions = Number(prevMetricRows[0]?.completions ?? 0);
      const prevReaders = await db
        .select({ distinctReaders: sql<number>`count(distinct ${publisherBookReaderDays.userId})` })
        .from(publisherBookReaderDays)
        .where(and(
          inArray(publisherBookReaderDays.bookId, bookIds),
          ...(previousRange.start ? [gte(publisherBookReaderDays.readDate, previousRange.start)] : []),
          ...(previousRange.endExclusive ? [sql`${publisherBookReaderDays.readDate} < ${previousRange.endExclusive}`] : []),
        ));
      const prevReaderCount = Number(prevReaders[0]?.distinctReaders ?? 0);
      comparison.seconds = { previous: prevSeconds, hasData: prevSeconds > 0 };
      comparison.completions = { previous: prevCompletions, hasData: prevCompletions > 0 };
      comparison.readers = { previous: prevReaderCount, hasData: prevReaderCount > 0 };
      const prevStarts = Number(prevMetricRows[0]?.starts ?? 0);
      comparison.reads = { previous: prevStarts, hasData: prevStarts > 0 };

      const previousBookRows = await db
        .select({
          bookId: publisherBookDailyMetrics.bookId,
          reads: sql<number>`coalesce(sum(${publisherBookDailyMetrics.readStarts}), 0)`,
        })
        .from(publisherBookDailyMetrics)
        .where(and(
          inArray(publisherBookDailyMetrics.bookId, bookIds),
          ...(previousRange.start ? [gte(publisherBookDailyMetrics.metricDate, previousRange.start)] : []),
          ...(previousRange.endExclusive ? [sql`${publisherBookDailyMetrics.metricDate} < ${previousRange.endExclusive}`] : []),
        ))
        .groupBy(publisherBookDailyMetrics.bookId);
      for (const row of previousBookRows) previousBookReads.set(row.bookId, Number(row.reads));
    }

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

    // Per-book period stats (Performa tab) — reads/seconds/completions grouped by book.
    const perBookPeriod = await db
      .select({
        bookId: publisherBookDailyMetrics.bookId,
        reads: sql<number>`coalesce(sum(${publisherBookDailyMetrics.readStarts}), 0)`,
        seconds: sql<number>`coalesce(sum(${publisherBookDailyMetrics.readingSeconds}), 0)`,
        completions: sql<number>`coalesce(sum(${publisherBookDailyMetrics.completedReads}), 0)`,
      })
      .from(publisherBookDailyMetrics)
      .where(and(...metricConditions))
      .groupBy(publisherBookDailyMetrics.bookId);
    for (const row of perBookPeriod) {
      bookStatsMap.set(row.bookId, {
        reads: Number(row.reads),
        seconds: Number(row.seconds),
        completions: Number(row.completions),
      });
    }

    // Genre split — reader-days per book joined to each book's genre list.
    const genreReaderRows = await db
      .select({ bookId: publisherBookReaderDays.bookId, readerDays: sql<number>`count(*)` })
      .from(publisherBookReaderDays)
      .where(and(...readerDayConditions))
      .groupBy(publisherBookReaderDays.bookId);
    const genreTotals = new Map<string, number>();
    for (const row of genreReaderRows) {
      const bookGenres = parseGenres(publisherBooks.find((b) => b.id === row.bookId)?.genre ?? null);
      if (bookGenres.length === 0) continue;
      for (const genre of bookGenres) {
        genreTotals.set(genre, (genreTotals.get(genre) ?? 0) + Number(row.readerDays));
      }
    }
    genreSplit = [...genreTotals.entries()]
      .map(([genre, readerDays]) => ({ genre, readerDays }))
      .sort((a, b) => b.readerDays - a.readerDays);

    // Demographics — anonymous buckets over distinct in-period readers.
    const demoReaderRows = await db
      .selectDistinct({ userId: publisherBookReaderDays.userId, ageGroup: usersTable.ageGroup, gender: usersTable.gender })
      .from(publisherBookReaderDays)
      .innerJoin(usersTable, eq(usersTable.id, publisherBookReaderDays.userId))
      .where(and(...readerDayConditions));
    if (demoReaderRows.length > 0) {
      const knownRows = demoReaderRows.filter((r) => r.ageGroup ?? r.gender);
      const ageBuckets = bucketAgeGroups(demoReaderRows.map((r) => r.ageGroup));
      const genderCounts = bucketGenders(demoReaderRows.map((r) => r.gender));
      demographics = {
        ageGroups: AGE_GROUP_LABELS.map((label) => ({ label, count: ageBuckets[label] })),
        gender: genderCounts,
        knownCount: knownRows.length,
      };
    }
  }

  // Dashboard chart: actual read starts from January through the selected month.
  const chartAnchor = period.endExclusive
    ? new Date(`${period.endExclusive}T00:00:00.000Z`)
    : new Date(`${period.start ?? new Date().toISOString().slice(0, 10)}T00:00:00.000Z`);
  if (period.endExclusive) chartAnchor.setUTCDate(chartAnchor.getUTCDate() - 1);
  const chartYear = chartAnchor.getUTCFullYear();
  const selectedMonth = chartAnchor.getUTCMonth() + 1;
  const monthlyStart = `${chartYear}-01-01`;
  const monthlyEnd = selectedMonth === 12
    ? `${chartYear + 1}-01-01`
    : `${chartYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`;
  const monthlyReadRows = bookIds.length > 0 ? await db
    .select({
      month: sql<string>`substr(${publisherBookDailyMetrics.metricDate}, 1, 7)`,
      reads: sql<number>`coalesce(sum(${publisherBookDailyMetrics.readStarts}), 0)`,
    })
    .from(publisherBookDailyMetrics)
    .where(and(
      inArray(publisherBookDailyMetrics.bookId, bookIds),
      gte(publisherBookDailyMetrics.metricDate, monthlyStart),
      sql`${publisherBookDailyMetrics.metricDate} < ${monthlyEnd}`,
    ))
    .groupBy(sql`substr(${publisherBookDailyMetrics.metricDate}, 1, 7)`)
    : [];
  const monthlyReadTrend = buildMonthlyReadTrend(chartYear, selectedMonth, monthlyReadRows.map((row) => ({
    month: row.month,
    reads: Number(row.reads),
  })));

  const [monthlyPoolSetting, rateBpsSetting] = await Promise.all([
    getPlatformSetting('royalty_monthly_pool'),
    getPlatformSetting('royalty_rate_bps'),
  ]);
  const monthlyPool = Number(monthlyPoolSetting ?? ROYALTY_CONFIG.monthlyPool);
  const rateBps = Number(rateBpsSetting ?? ROYALTY_CONFIG.rateBps);

  // Read only the month buckets needed by the selected and comparison windows.
  // The denominator includes all published books on the platform; each publisher
  // numerator includes only their own published titles.
  let royaltyEstimate = { total: 0, byBook: new Map<string, number>() };
  let previousRoyaltyEstimate: { total: number; byBook: Map<string, number> } | null = null;
  if (monthlyPool > 0 && rateBps > 0 && eligibleBookIds.length > 0) {
    const loadRoyaltyEstimate = async (range: DateRange) => {
      const dateConditions = [
        ...(range.start ? [gte(publisherBookDailyMetrics.metricDate, range.start)] : []),
        ...(range.endExclusive ? [sql`${publisherBookDailyMetrics.metricDate} < ${range.endExclusive}`] : []),
      ];
      const monthBucket = sql<string>`substr(${publisherBookDailyMetrics.metricDate}, 1, 7)`;
      const [platformRows, publisherRows] = await Promise.all([
        db.select({
          month: monthBucket,
          readingSeconds: sql<number>`coalesce(sum(${publisherBookDailyMetrics.readingSeconds}), 0)`,
        })
          .from(publisherBookDailyMetrics)
          .innerJoin(booksTable, eq(publisherBookDailyMetrics.bookId, booksTable.id))
          .where(and(eq(booksTable.isPublished, true), ...dateConditions))
          .groupBy(monthBucket),
        db.select({
          month: monthBucket,
          bookId: publisherBookDailyMetrics.bookId,
          readingSeconds: sql<number>`coalesce(sum(${publisherBookDailyMetrics.readingSeconds}), 0)`,
        })
          .from(publisherBookDailyMetrics)
          .where(and(inArray(publisherBookDailyMetrics.bookId, eligibleBookIds), ...dateConditions))
          .groupBy(monthBucket, publisherBookDailyMetrics.bookId),
      ]);
      const platformSecondsByMonth = new Map(platformRows.map((row) => [row.month, Number(row.readingSeconds)]));
      const bookReadings: MonthlyBookReading[] = publisherRows.map((row) => ({
        month: row.month,
        bookId: row.bookId,
        readingSeconds: Number(row.readingSeconds),
      }));
      return estimatePooledRoyalty({ range, monthlyPool, rateBps, platformSecondsByMonth, bookReadings });
    };
    [royaltyEstimate, previousRoyaltyEstimate] = await Promise.all([
      loadRoyaltyEstimate(period),
      previousRange ? loadRoyaltyEstimate(previousRange) : Promise.resolve(null),
    ]);
  }

  comparison.royalty = previousRoyaltyEstimate
    ? { previous: previousRoyaltyEstimate.total, hasData: previousRoyaltyEstimate.total > 0 }
    : { previous: 0, hasData: false };

  const royaltyTrend: MonthlyRoyaltyPoint[] = [];
  const trendNow = periodInput?.now ?? new Date();
  const trendRanges = Array.from({ length: 6 }, (_, index): DateRange => {
    const monthStart = new Date(Date.UTC(trendNow.getUTCFullYear(), trendNow.getUTCMonth() - 5 + index, 1));
    const nextMonthStart = new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 1));
    return {
      key: 'custom',
      start: monthStart.toISOString().slice(0, 10),
      endExclusive: nextMonthStart.toISOString().slice(0, 10),
      label: monthStart.toISOString().slice(0, 7),
    };
  });
  if (monthlyPool > 0 && rateBps > 0 && eligibleBookIds.length > 0) {
    const trendStart = trendRanges[0].start!;
    const trendEnd = trendRanges[trendRanges.length - 1].endExclusive!;
    const monthBucket = sql<string>`substr(${publisherBookDailyMetrics.metricDate}, 1, 7)`;
    const [platformRows, publisherRows] = await Promise.all([
      db.select({ month: monthBucket, readingSeconds: sql<number>`coalesce(sum(${publisherBookDailyMetrics.readingSeconds}), 0)` })
        .from(publisherBookDailyMetrics)
        .innerJoin(booksTable, eq(publisherBookDailyMetrics.bookId, booksTable.id))
        .where(and(eq(booksTable.isPublished, true), gte(publisherBookDailyMetrics.metricDate, trendStart), sql`${publisherBookDailyMetrics.metricDate} < ${trendEnd}`))
        .groupBy(monthBucket),
      db.select({ month: monthBucket, bookId: publisherBookDailyMetrics.bookId, readingSeconds: sql<number>`coalesce(sum(${publisherBookDailyMetrics.readingSeconds}), 0)` })
        .from(publisherBookDailyMetrics)
        .where(and(inArray(publisherBookDailyMetrics.bookId, eligibleBookIds), gte(publisherBookDailyMetrics.metricDate, trendStart), sql`${publisherBookDailyMetrics.metricDate} < ${trendEnd}`))
        .groupBy(monthBucket, publisherBookDailyMetrics.bookId),
    ]);
    const platformSecondsByMonth = new Map(platformRows.map((row) => [row.month, Number(row.readingSeconds)]));
    for (const range of trendRanges) {
      const month = range.start!.slice(0, 7);
      const bookReadings: MonthlyBookReading[] = publisherRows.filter((row) => row.month === month).map((row) => ({
        month: row.month,
        bookId: row.bookId,
        readingSeconds: Number(row.readingSeconds),
      }));
      royaltyTrend.push({
        bucket: month,
        amount: estimatePooledRoyalty({ range, monthlyPool, rateBps, platformSecondsByMonth, bookReadings }).total,
      });
    }
  }

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

  const premiumBooks = publisherBooks.filter((book) => book.subscriptionRequired !== 'FREE');
  const premiumInsights: PublisherDashboardOverview['premiumInsights'] = { premiumBookCount: premiumBooks.length, books: [] };
  if (premiumBooks.length > 0) {
    const premiumBookIds = premiumBooks.map((book) => book.id);
    const readerRows = await db
      .select({ bookId: publisherBookReaderDays.bookId, userId: publisherBookReaderDays.userId })
      .from(publisherBookReaderDays)
      .where(inArray(publisherBookReaderDays.bookId, premiumBookIds))
      .groupBy(publisherBookReaderDays.bookId, publisherBookReaderDays.userId);
    const readerIds = [...new Set(readerRows.map((row) => row.userId))];
    const tierByUser = new Map<string, string>();
    if (readerIds.length > 0) {
      const subscriptionRows = await db
        .select({ userId: subscriptions.userId, planId: subscriptions.planId, status: subscriptions.status })
        .from(subscriptions)
        .where(inArray(subscriptions.userId, readerIds));
      for (const row of subscriptionRows) tierByUser.set(row.userId, tierFromSubscription({ status: row.status, planId: row.planId }));
    }
    const buckets = bucketPremiumReaders(readerRows, tierByUser, premiumBooks.map((book) => ({ id: book.id, subscriptionRequired: book.subscriptionRequired })));
    premiumInsights.books = premiumBooks.map((book) => {
      const bucket = buckets[book.id] ?? { distinctReaders: 0, belowTierReaders: 0, eligibleReaders: 0 };
      return { id: book.id, title: book.title, requiredTier: book.subscriptionRequired, ...bucket };
    });
  }

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
    totalReadStarts,
    totalReadingSeconds,
    totalCompletions,
    totalLifetimeReads,
    royaltyEstimate: royaltyEstimate.total,
    readerLoyalty,
    geo,
    topBooks,
    comparison,
    monthlyReadTrend,
    dailyTrend: [...dailyTrendMap.entries()]
      .map(([bucket, agg]) => ({ bucket, ...agg }))
      .sort((a, b) => a.bucket.localeCompare(b.bucket)),
    readingDataThrough,
    royaltyTrend,
    genreSplit,
    demographics,
    funnel,
    cities,
    weekdayRhythm,
    hourRhythm,
    bookStats: publisherBooks.map((b) => ({
      id: b.id,
      title: b.title,
      author: b.author,
      coverKey: b.coverKey,
      subscriptionRequired: b.subscriptionRequired,
      isPublished: b.isPublished,
      lifetimeReads: b.readCount,
      estimatedRoyalty: royaltyEstimate.byBook.get(b.id) ?? 0,
      previousReads: previousBookReads.get(b.id) ?? 0,
      hasPreviousReads: comparison.reads.hasData,
      ...(bookStatsMap.get(b.id) ?? { reads: 0, seconds: 0, completions: 0 }),
    })),
    recentNotifications: recentNotifications.map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      createdAt: n.createdAt,
      read: !!n.readAt,
    })),
    payouts,
    premiumInsights,
  };
}
