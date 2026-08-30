import { getDb } from '@/lib/db';
import { getPlatformSetting } from '@/lib/platform-settings';
import {
  books as booksTable,
  publisherBookDailyMetrics,
  publisherBookReaderDays,
  publisherBookCountryMetrics,
  publisherProfiles,
  notifications as notificationsTable,
  publisherPayouts,
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
  getPeriodRange,
  getPreviousPeriodRange,
  rankTopBooks,
  resolveDashboardPeriod,
  type AgeGroupLabel,
  type DateRange,
  type GenderCounts,
} from './metrics';
import { tierFromSubscription } from '@/lib/subscription';
import type { PublisherCatalogBook } from '../catalog-table';

export async function getPublisherCatalog(publisherUserId: string): Promise<PublisherCatalogBook[]> {
  const db = getDb();
  return db.select({
    id: booksTable.id, title: booksTable.title, author: booksTable.author, synopsis: booksTable.synopsis, totalPages: booksTable.totalPages, genre: booksTable.genre,
    language: booksTable.language, subscriptionRequired: booksTable.subscriptionRequired,
    epubKey: booksTable.epubKey, coverKey: booksTable.coverKey, readCount: booksTable.readCount,
    isPublished: booksTable.isPublished, publicationStatus: booksTable.publicationStatus, updatedAt: booksTable.updatedAt, featured: booksTable.featured,
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

export interface TrendPoint {
  /** 'YYYY-MM-DD' for daily points, 'YYYY-MM' for monthly rollup. */
  bucket: string;
  reads: number;
  seconds: number;
  completions: number;
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
  seconds: number;
  completions: number;
}

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
    readers: KpiComparison;
    seconds: KpiComparison;
    completions: KpiComparison;
    royalty: KpiComparison;
  };
  /** In-period reading activity series (daily for months/quarters, monthly for YTD). */
  dailyTrend: TrendPoint[];
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
  const period = periodInput
    ? resolveDashboardPeriod(periodInput)
    : getPeriodRange('this_month', new Date());

  let totalDistinctReaders = 0;
  let totalReadingSeconds = 0;
  let totalCompletions = 0;
  let readerLoyalty = bucketReaderLoyalty([]);
  let geo: { countryCode: string; readerDays: number }[] = [];
  const lifetimeMetrics = new Map<string, { readSeconds: number; completedReads: number }>();
  const comparison = {
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
  const bookStatsMap = new Map<string, { reads: number; seconds: number; completions: number }>();

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
        readingSeconds: sql<number>`coalesce(sum(${publisherBookDailyMetrics.readingSeconds}), 0)`,
        completedReads: sql<number>`coalesce(sum(${publisherBookDailyMetrics.completedReads}), 0)`,
      })
      .from(publisherBookDailyMetrics)
      .where(and(...metricConditions));

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

    // Hour rhythm — last-session hour per reader-day.
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

  // Same formula applied to the previous window (pool/rate treated as constant).
  comparison.royalty =
    monthlyPool > 0 && previousRange
      ? {
          previous: Math.round((comparison.seconds.previous / 3600) * 10 * (rateBps / 10000)) * 100,
          hasData: comparison.seconds.hasData,
        }
      : { previous: 0, hasData: false };

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
    totalReadingSeconds,
    totalCompletions,
    totalLifetimeReads,
    monthlyRoyaltyEstimate,
    readerLoyalty,
    geo,
    topBooks,
    comparison,
    dailyTrend: [...dailyTrendMap.entries()]
      .map(([bucket, agg]) => ({ bucket, ...agg }))
      .sort((a, b) => a.bucket.localeCompare(b.bucket)),
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