import { isBookAccessible } from '@bukoo/shared-types';

export interface DashboardMetricRow {
  bookId: string;
  userId?: string;
  metricDate?: string;
  readSeconds?: number;
  completedReads?: number;
}

export type PeriodKey = 'this_month' | 'last_month' | 'all_time' | 'custom';

export interface DateRange {
  key: PeriodKey;
  /** Inclusive YYYY-MM-DD, or null when unbounded. */
  start: string | null;
  /** Exclusive YYYY-MM-DD, or null when unbounded. */
  endExclusive: string | null;
  label: string;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isStrictIsoDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function addOneUtcDay(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + 1));
  return next.toISOString().slice(0, 10);
}

export function getCurrentMonthStart(date: Date): string {
  return `${date.toISOString().slice(0, 7)}-01`;
}

export function parsePeriodKey(value: string | undefined | null): PeriodKey {
  if (value === 'last_month' || value === 'all_time' || value === 'custom') return value;
  return 'this_month';
}

export function monthStartUtc(year: number, monthIndex: number): string {
  const y = monthIndex < 0 ? year - 1 : monthIndex > 11 ? year + 1 : year;
  const m = ((monthIndex % 12) + 12) % 12;
  return `${y}-${String(m + 1).padStart(2, '0')}-01`;
}

export function getPeriodRange(key: Exclude<PeriodKey, 'custom'>, now: Date): DateRange {
  if (key === 'all_time') {
    return { key, start: null, endExclusive: null, label: 'Semua waktu' };
  }

  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  if (key === 'this_month') {
    return {
      key,
      start: monthStartUtc(year, month),
      endExclusive: monthStartUtc(year, month + 1),
      label: 'Bulan ini',
    };
  }

  return {
    key,
    start: monthStartUtc(year, month - 1),
    endExclusive: monthStartUtc(year, month),
    label: 'Bulan lalu',
  };
}

export function resolveDashboardPeriod(input: {
  period?: string | null;
  from?: string | null;
  to?: string | null;
  now?: Date;
}): DateRange {
  const now = input.now ?? new Date();
  const from = input.from?.trim() ?? '';
  const to = input.to?.trim() ?? '';
  if (from && to && isStrictIsoDate(from) && isStrictIsoDate(to) && from <= to) {
    return {
      key: 'custom',
      start: from,
      endExclusive: addOneUtcDay(to),
      label: `${from} – ${to}`,
    };
  }

  const key = parsePeriodKey(input.period);
  if (key === 'custom') return getPeriodRange('this_month', now);
  return getPeriodRange(key, now);
}

export function dateInRange(isoDate: string | undefined, range: DateRange): boolean {
  if (!isoDate) return range.start === null && range.endExclusive === null;
  if (range.start && isoDate < range.start) return false;
  if (range.endExclusive && isoDate >= range.endExclusive) return false;
  return true;
}

export function aggregateOwnedMetricRows(
  rows: DashboardMetricRow[],
  ownedBookIds: ReadonlySet<string>,
  monthStart: string,
) {
  const currentMonthRows = rows.filter(
    (row) => ownedBookIds.has(row.bookId) && (!row.metricDate || row.metricDate >= monthStart),
  );
  const distinctReaders = new Set(
    currentMonthRows.flatMap((row) => row.userId ? [row.userId] : []),
  ).size;

  const byBook = new Map<string, { readSeconds: number; completedReads: number }>();
  for (const row of rows) {
    if (!ownedBookIds.has(row.bookId)) continue;
    const current = byBook.get(row.bookId) ?? { readSeconds: 0, completedReads: 0 };
    current.readSeconds += row.readSeconds ?? 0;
    current.completedReads += row.completedReads ?? 0;
    byBook.set(row.bookId, current);
  }

  return {
    currentMonthReadingSeconds: currentMonthRows.reduce((sum, row) => sum + (row.readSeconds ?? 0), 0),
    currentMonthCompletions: currentMonthRows.reduce((sum, row) => sum + (row.completedReads ?? 0), 0),
    currentMonthDistinctReaders: distinctReaders,
    lifetimeByBook: byBook,
  };
}

export function rankTopBooks<T extends { id: string; readCount: number }>(
  books: T[],
  lifetimeByBook: ReadonlyMap<string, { readSeconds: number }>,
  limit = 5,
): T[] {
  return [...books]
    .sort((left, right) =>
      right.readCount - left.readCount ||
      (lifetimeByBook.get(right.id)?.readSeconds ?? 0) - (lifetimeByBook.get(left.id)?.readSeconds ?? 0),
    )
    .slice(0, limit);
}

export function rankBooksByPeriodActivity<T extends { id: string }>(
  books: T[],
  periodByBook: ReadonlyMap<string, { readSeconds: number; readStarts: number }>,
): T[] {
  return [...books].sort((left, right) => {
    const a = periodByBook.get(left.id);
    const b = periodByBook.get(right.id);
    return (b?.readSeconds ?? 0) - (a?.readSeconds ?? 0)
      || (b?.readStarts ?? 0) - (a?.readStarts ?? 0);
  });
}

export interface LoyaltyBuckets {
  oneDay: number;
  twoToFourDays: number;
  fivePlusDays: number;
}

export function bucketReaderLoyalty(dayCounts: number[]): LoyaltyBuckets {
  const buckets: LoyaltyBuckets = { oneDay: 0, twoToFourDays: 0, fivePlusDays: 0 };
  for (const days of dayCounts) {
    if (days <= 1) buckets.oneDay += 1;
    else if (days <= 4) buckets.twoToFourDays += 1;
    else buckets.fivePlusDays += 1;
  }
  return buckets;
}

/** ISO 3166-1 alpha-2, or XX when missing/invalid. Never stores an IP. */
export function normalizeCountryCode(value: string | null | undefined): string {
  const code = value?.trim().toUpperCase() ?? '';
  if (/^[A-Z]{2}$/.test(code) && code !== 'T1') return code;
  return 'XX';
}

const COUNTRY_LABELS: Record<string, string> = {
  ID: 'Indonesia', MY: 'Malaysia', SG: 'Singapura', TH: 'Thailand',
  US: 'Amerika Serikat', GB: 'Britania Raya', AU: 'Australia',
  SA: 'Arab Saudi', AE: 'Uni Emirat Arab', NL: 'Belanda',
};

export function countryLabel(code: string): string {
  return COUNTRY_LABELS[code] ?? (code === 'XX' ? 'Tidak diketahui' : code);
}

export interface PremiumReaderBook {
  id: string;
  subscriptionRequired: string;
}

export function bucketPremiumReaders(
  readerRows: { bookId: string; userId: string }[],
  tierByUser: Map<string, string>,
  books: PremiumReaderBook[],
): Record<string, { distinctReaders: number; belowTierReaders: number; eligibleReaders: number }> {
  const result: Record<string, { distinctReaders: number; belowTierReaders: number; eligibleReaders: number }> = {};
  for (const book of books) {
    const rows = readerRows.filter((row) => row.bookId === book.id);
    let below = 0;
    let eligible = 0;
    for (const row of rows) {
      const tier = tierByUser.get(row.userId) ?? 'FREE';
      if (isBookAccessible(tier, book.subscriptionRequired)) eligible += 1;
      else below += 1;
    }
    result[book.id] = { distinctReaders: rows.length, belowTierReaders: below, eligibleReaders: eligible };
  }
  return result;
}
