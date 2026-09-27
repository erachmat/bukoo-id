import { describe, expect, it } from 'vitest';
import { buildMonthlyReadTrend, getPublisherBookAnalytics } from '@/app/publisher/dashboard/queries';

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
