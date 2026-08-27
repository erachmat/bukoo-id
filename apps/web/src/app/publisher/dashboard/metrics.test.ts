import { describe, expect, it } from 'vitest';
import {
  addOneUtcDay,
  aggregateOwnedMetricRows,
  bucketReaderLoyalty,
  dateInRange,
  getCurrentMonthStart,
  getPeriodRange,
  normalizeCountryCode,
  countryLabel,
  rankBooksByPeriodActivity,
  rankTopBooks,
  resolveDashboardPeriod,
} from './metrics';

describe('publisher dashboard metrics', () => {
  it('includes the first day of the current month and excludes another publisher', () => {
    const result = aggregateOwnedMetricRows(
      [
        { bookId: 'owned', userId: 'reader-a', metricDate: '2026-08-01', readSeconds: 60 },
        { bookId: 'other', userId: 'reader-b', metricDate: '2026-08-15', readSeconds: 600 },
        { bookId: 'owned', userId: 'reader-c', metricDate: '2026-07-31', readSeconds: 300 },
      ],
      new Set(['owned']),
      '2026-08-01',
    );

    expect(result.currentMonthReadingSeconds).toBe(60);
    expect(result.currentMonthDistinctReaders).toBe(1);
    expect(result.lifetimeByBook.get('other')).toBeUndefined();
  });

  it('derives the current month start from an ISO date', () => {
    expect(getCurrentMonthStart(new Date('2026-08-27T12:00:00Z'))).toBe('2026-08-01');
  });

  it('ranks books by lifetime reads with lifetime seconds as the tie breaker', () => {
    const ranked = rankTopBooks(
      [
        { id: 'newest', readCount: 1 },
        { id: 'leader', readCount: 9 },
        { id: 'tie-breaker', readCount: 9 },
      ],
      new Map([
        ['leader', { readSeconds: 10 }],
        ['tie-breaker', { readSeconds: 20 }],
      ]),
    );

    expect(ranked.map((book) => book.id)).toEqual(['tie-breaker', 'leader', 'newest']);
  });

  it('uses inclusive month start and exclusive next-month bound for this and last month', () => {
    const now = new Date('2026-08-27T12:00:00Z');
    expect(getPeriodRange('this_month', now)).toEqual({
      key: 'this_month',
      start: '2026-08-01',
      endExclusive: '2026-09-01',
      label: 'Bulan ini',
    });
    expect(getPeriodRange('last_month', now)).toEqual({
      key: 'last_month',
      start: '2026-07-01',
      endExclusive: '2026-08-01',
      label: 'Bulan lalu',
    });
    expect(getPeriodRange('all_time', now).start).toBeNull();
  });

  it('wraps last_month across January', () => {
    expect(getPeriodRange('last_month', new Date('2026-01-05T00:00:00Z'))).toMatchObject({
      start: '2025-12-01',
      endExclusive: '2026-01-01',
    });
  });

  it('resolves custom inclusive date ranges', () => {
    const range = resolveDashboardPeriod({ from: '2026-08-01', to: '2026-08-01' });
    expect(range.key).toBe('custom');
    expect(range.start).toBe('2026-08-01');
    expect(range.endExclusive).toBe('2026-08-02');
    expect(addOneUtcDay('2026-12-31')).toBe('2027-01-01');
  });

  it('keeps month-start dates inside the range and excludes the exclusive bound', () => {
    const range = getPeriodRange('this_month', new Date('2026-08-27T00:00:00Z'));
    expect(dateInRange('2026-08-01', range)).toBe(true);
    expect(dateInRange('2026-08-31', range)).toBe(true);
    expect(dateInRange('2026-09-01', range)).toBe(false);
    expect(dateInRange('2026-07-31', range)).toBe(false);
  });

  it('ranks period activity by reading seconds then starts', () => {
    const ranked = rankBooksByPeriodActivity(
      [{ id: 'quiet' }, { id: 'hot' }, { id: 'tie' }],
      new Map([
        ['quiet', { readSeconds: 10, readStarts: 9 }],
        ['hot', { readSeconds: 90, readStarts: 1 }],
        ['tie', { readSeconds: 90, readStarts: 4 }],
      ]),
    );
    expect(ranked.map((book) => book.id)).toEqual(['tie', 'hot', 'quiet']);
  });

  it('buckets reader-day loyalty without demographic attributes', () => {
    expect(bucketReaderLoyalty([1, 1, 3, 4, 5, 12])).toEqual({
      oneDay: 2,
      twoToFourDays: 2,
      fivePlusDays: 2,
    });
    expect(bucketReaderLoyalty([])).toEqual({ oneDay: 0, twoToFourDays: 0, fivePlusDays: 0 });
  });

  it('normalizes country codes and never treats garbage as a country', () => {
    expect(normalizeCountryCode('id')).toBe('ID');
    expect(normalizeCountryCode('T1')).toBe('XX');
    expect(normalizeCountryCode('Indonesia')).toBe('XX');
    expect(normalizeCountryCode(null)).toBe('XX');
  });

  it('uses privacy-safe country labels with an unknown fallback', () => {
    expect(countryLabel('ID')).toBe('Indonesia');
    expect(countryLabel('XX')).toBe('Tidak diketahui');
    expect(countryLabel('JP')).toBe('JP');
  });
});
