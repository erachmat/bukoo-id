import { describe, expect, it } from 'vitest';
import {
  accumulateVisibleExposure,
  calculateCoveragePercent,
  decodeCoverage,
  encodeCoverage,
} from './readingCoverage';

describe('reading coverage', () => {
  it('does not credit skipped text at the end of a book', () => {
    const coverage = new Uint32Array([240_000, 0, 0, 0]);
    expect(calculateCoveragePercent(coverage, 20)).toBe(25);
  });

  it('requires exposure for every block before reporting completion', () => {
    expect(calculateCoveragePercent(new Uint32Array([240_000, 240_000, 240_000, 239_999]), 20)).toBe(75);
    expect(calculateCoveragePercent(new Uint32Array([240_000, 240_000, 240_000, 240_000]), 20)).toBe(100);
  });

  it('distributes visible time across the visible words and accumulates repeated visits', () => {
    const first = accumulateVisibleExposure(new Uint32Array(4), [{ startBlock: 0, endBlock: 1 }], 600, 5, 20);
    expect(first[0]).toBe(120_000);
    const second = accumulateVisibleExposure(first, [{ startBlock: 0, endBlock: 1 }], 600, 5, 20);
    expect(second[0]).toBe(240_000);
    expect(calculateCoveragePercent(second, 20)).toBe(25);
  });

  it('does not double count overlapping visible ranges', () => {
    const coverage = accumulateVisibleExposure(
      new Uint32Array(4),
      [{ startBlock: 0, endBlock: 2 }, { startBlock: 1, endBlock: 3 }],
      2_400,
      15,
      20,
    );
    expect([...coverage]).toEqual([160_000, 160_000, 160_000, 0]);
  });

  it('round trips persisted coverage without losing per-block values', () => {
    const values = new Uint32Array([0, 1_200, 240_000, 0]);
    expect([...decodeCoverage(encodeCoverage(values), 4)]).toEqual([...values]);
  });
});
