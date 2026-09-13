import { describe, it, expect } from 'vitest';
import {
  computeClosePeriod,
  hourlyRateFromPool,
  monthBounds,
  PPH23_RATE_BPS,
  ROYALTY_CALC_VERSION,
} from './royalty-close';

const baseConfig = {
  monthlyPool: 7_200_000,
  rateBps: 6500,
  taxRateBps: PPH23_RATE_BPS,
  ratePerHour: 10_000,
};

describe('computeClosePeriod', () => {
  it('returns empty totals for no books', () => {
    const result = computeClosePeriod(baseConfig, []);
    expect(result.lines).toEqual([]);
    expect(result.revenuePool).toBe(0);
    expect(result.publisherShare).toBe(0);
    expect(result.totalTax).toBe(0);
    expect(result.calcVersion).toBe(ROYALTY_CALC_VERSION);
  });

  it('computes gross, tax, and net for a single line', () => {
    // 3600s = 1h × 10_000/h × 0.65 = 6500 gross; tax 23% = 1495; net 5005.
    const result = computeClosePeriod(baseConfig, [{ bookId: 'b1', readSeconds: 3600 }]);
    expect(result.lines[0].grossAmount).toBe(6500);
    expect(result.lines[0].taxableAmount).toBe(6500);
    expect(result.lines[0].taxAmount).toBe(1495);
    expect(result.lines[0].netAmount).toBe(5005);
    expect(result.lines[0].taxType).toBe('PPh_23');
    expect(result.revenuePool).toBe(6500);
    expect(result.publisherShare).toBe(5005);
    expect(result.totalTax).toBe(1495);
  });

  it('rounds half-up at line level', () => {
    // 1800s = 0.5h × 10_000 × 0.65 = 3250; tax 747.5 → 748 (half-up); net 2502.
    const result = computeClosePeriod(baseConfig, [{ bookId: 'b1', readSeconds: 1800 }]);
    expect(result.lines[0].taxAmount).toBe(748);
    expect(result.lines[0].netAmount).toBe(2502);
  });

  it('zeroes tax when taxType is NONE', () => {
    const result = computeClosePeriod(baseConfig, [
      { bookId: 'b1', readSeconds: 3600, taxType: 'NONE' },
    ]);
    expect(result.lines[0].taxRateBps).toBe(0);
    expect(result.lines[0].taxAmount).toBe(0);
    expect(result.lines[0].netAmount).toBe(6500);
    expect(result.publisherShare).toBe(6500);
  });

  it('honors per-book rate override', () => {
    const result = computeClosePeriod(baseConfig, [
      { bookId: 'b1', readSeconds: 3600, rateBpsOverride: 5000 },
    ]);
    expect(result.lines[0].rateBps).toBe(5000);
    expect(result.lines[0].grossAmount).toBe(5000);
    expect(result.lines[0].taxAmount).toBe(1150);
    expect(result.lines[0].netAmount).toBe(3850);
  });

  it('aggregates multiple books and sums totals', () => {
    const result = computeClosePeriod(baseConfig, [
      { bookId: 'b1', readSeconds: 3600 },
      { bookId: 'b2', readSeconds: 7200 },
      { bookId: 'b3', readSeconds: 0 },
    ]);
    expect(result.lines).toHaveLength(3);
    // b1: 6500 gross / b2: 13000 gross / b3: 0 gross
    expect(result.revenuePool).toBe(19_500);
    // tax: 1495 + 2990 + 0 = 4485; share: 5005 + 10010 + 0 = 15015
    expect(result.totalTax).toBe(4485);
    expect(result.publisherShare).toBe(15_015);
  });

  it('handles zero readSeconds', () => {
    const result = computeClosePeriod(baseConfig, [{ bookId: 'b1', readSeconds: 0 }]);
    expect(result.lines[0].grossAmount).toBe(0);
    expect(result.lines[0].taxAmount).toBe(0);
    expect(result.lines[0].netAmount).toBe(0);
  });

  it('embeds calc metadata JSON', () => {
    const result = computeClosePeriod(baseConfig, [{ bookId: 'b1', readSeconds: 3600 }]);
    const meta = JSON.parse(result.lines[0].calcMeta);
    expect(meta.version).toBe(ROYALTY_CALC_VERSION);
    expect(meta.ratePerHour).toBe(10_000);
    expect(meta.pool).toBe(7_200_000);
  });
});

describe('hourlyRateFromPool', () => {
  it('derives hourly rate from a monthly pool', () => {
    expect(hourlyRateFromPool(7_200_000)).toBe(10_000);
  });

  it('returns 0 for zero or negative pools', () => {
    expect(hourlyRateFromPool(0)).toBe(0);
    expect(hourlyRateFromPool(-100)).toBe(0);
  });
});

describe('monthBounds', () => {
  it('returns inclusive start and exclusive end', () => {
    expect(monthBounds('2026-09')).toEqual({ start: '2026-09-01', endExclusive: '2026-10-01' });
  });

  it('wraps December', () => {
    expect(monthBounds('2026-12')).toEqual({ start: '2026-12-01', endExclusive: '2027-01-01' });
  });

  it('pads single-digit months', () => {
    expect(monthBounds('2026-03')).toEqual({ start: '2026-03-01', endExclusive: '2026-04-01' });
  });

  it('throws on invalid input', () => {
    expect(() => monthBounds('2026-13')).toThrow('Format periode harus YYYY-MM.');
    expect(() => monthBounds('2026-00')).toThrow('Format periode harus YYYY-MM.');
    expect(() => monthBounds('september')).toThrow('Format periode harus YYYY-MM.');
  });
});
