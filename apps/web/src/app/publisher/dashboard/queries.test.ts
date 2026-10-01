import { describe, expect, it } from 'vitest';
import {
  buildMonthlyReadTrend,
  buildPublisherDiscoveryFunnelRows,
  getLatestMetricDate,
  getPublisherBookAnalytics,
  sumPublisherDiscoveryDailyMetrics,
} from '@/app/publisher/dashboard/queries';

describe('getPublisherBookAnalytics', () => {
  it('is exported and callable (full DB coverage requires D1 integration)', () => {
    expect(typeof getPublisherBookAnalytics).toBe('function');
  });
});

describe('buildMonthlyReadTrend', () => {
  it('fills missing months with zero and returns one bucket per month', () => {
    expect(buildMonthlyReadTrend(2026, 4, [
      { month: '2026-01', reads: 12 },
      { month: '2026-03', reads: 7 },
      { month: '2026-03', reads: 5 },
    ])).toEqual([
      { bucket: '2026-01', reads: 12 },
      { bucket: '2026-02', reads: 0 },
      { bucket: '2026-03', reads: 12 },
      { bucket: '2026-04', reads: 0 },
    ]);
  });

  it('clamps the selected month to a valid calendar year', () => {
    expect(buildMonthlyReadTrend(2026, 14, [])).toHaveLength(12);
    expect(buildMonthlyReadTrend(2026, 0, [])).toEqual([{ bucket: '2026-01', reads: 0 }]);
  });
});

describe('getLatestMetricDate', () => {
  it('returns the latest in-period aggregate date, independent of row order', () => {
    expect(getLatestMetricDate([
      { metricDate: '2026-09-03' },
      { metricDate: '2026-08-29' },
      { metricDate: '2026-09-15' },
    ])).toBe('2026-09-15');
  });

  it('returns null when the selected range has no stored reading activity', () => {
    expect(getLatestMetricDate([])).toBeNull();
  });
});

describe('sumPublisherDiscoveryDailyMetrics', () => {
  it('sums each aggregate stage independently across selected days', () => {
    expect(sumPublisherDiscoveryDailyMetrics([
      {
        anonymousDetailViews: 12,
        anonymousAppCtaClicks: 3,
        signedInDetailViews: 4,
        signedInAppCtaClicks: 2,
        attributedReaderDays: 1,
        unattributedReaderDays: 5,
      },
      {
        anonymousDetailViews: 8,
        anonymousAppCtaClicks: 2,
        signedInDetailViews: 6,
        signedInAppCtaClicks: 1,
        attributedReaderDays: 2,
        unattributedReaderDays: 4,
      },
    ])).toEqual({
      anonymousDetailViews: 20,
      anonymousAppCtaClicks: 5,
      signedInDetailViews: 10,
      signedInAppCtaClicks: 3,
      attributedReaderDays: 3,
      unattributedReaderDays: 9,
    });
  });

  it('returns zeros for an empty tracked range without inventing any stage', () => {
    expect(sumPublisherDiscoveryDailyMetrics([])).toEqual({
      anonymousDetailViews: 0,
      anonymousAppCtaClicks: 0,
      signedInDetailViews: 0,
      signedInAppCtaClicks: 0,
      attributedReaderDays: 0,
      unattributedReaderDays: 0,
    });
  });
});

describe('publisher discovery funnel read model', () => {
  it('maps selected daily rows and coverage to books without turning missing rows into zeros', () => {
    expect(buildPublisherDiscoveryFunnelRows(
      [
        { id: 'book-a', title: 'Book A', author: 'Author A' },
        { id: 'book-b', title: 'Book B', author: 'Author B' },
      ],
      [{
        bookId: 'book-a',
        anonymousDetailViews: 8,
        anonymousAppCtaClicks: 3,
        signedInDetailViews: 5,
        signedInAppCtaClicks: 2,
        attributedReaderDays: 1,
        unattributedReaderDays: 4,
      }],
      [{
        bookId: 'book-a',
        coverageStart: '2026-08-10',
        coverageEnd: '2026-09-15',
      }],
    )).toEqual([
      {
        bookId: 'book-a',
        title: 'Book A',
        author: 'Author A',
        coverageStart: '2026-08-10',
        coverageEnd: '2026-09-15',
        hasSelectedMetrics: true,
        anonymousDetailViews: 8,
        anonymousAppCtaClicks: 3,
        signedInDetailViews: 5,
        signedInAppCtaClicks: 2,
        attributedReaderDays: 1,
        unattributedReaderDays: 4,
      },
      {
        bookId: 'book-b',
        title: 'Book B',
        author: 'Author B',
        coverageStart: null,
        coverageEnd: null,
        hasSelectedMetrics: false,
        anonymousDetailViews: 0,
        anonymousAppCtaClicks: 0,
        signedInDetailViews: 0,
        signedInAppCtaClicks: 0,
        attributedReaderDays: 0,
        unattributedReaderDays: 0,
      },
    ]);
  });
});
