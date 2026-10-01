import { describe, expect, it } from 'vitest';
import {
  calculateCoveragePercent,
  mergeCoverageExposure,
  validateCoverageDeltas,
} from './reading-coverage.js';

describe('server reading coverage', () => {
  it('rejects duplicate, negative, and out-of-book coverage blocks', () => {
    expect(() => validateCoverageDeltas([{ blockIndex: 0, exposureMicros: 1 }, { blockIndex: 0, exposureMicros: 1 }], 20)).toThrow();
    expect(() => validateCoverageDeltas([{ blockIndex: -1, exposureMicros: 1 }], 20)).toThrow();
    expect(() => validateCoverageDeltas([{ blockIndex: 4, exposureMicros: 1 }], 20)).toThrow();
  });

  it('caps accumulated time and counts each covered block once', () => {
    const merged = mergeCoverageExposure(
      [{ blockIndex: 0, exposureMicros: 200_000 }, { blockIndex: 1, exposureMicros: 240_000 }],
      [{ blockIndex: 0, exposureMicros: 100_000 }, { blockIndex: 1, exposureMicros: 100_000 }],
      20,
    );
    expect(merged).toEqual([
      { blockIndex: 0, exposureMicros: 240_000 },
      { blockIndex: 1, exposureMicros: 240_000 },
    ]);
    expect(calculateCoveragePercent(merged, 20)).toBe(50);
  });

  it('counts a partial final block only for words in the book', () => {
    expect(calculateCoveragePercent([
      { blockIndex: 0, exposureMicros: 240_000 },
      { blockIndex: 1, exposureMicros: 240_000 },
      { blockIndex: 2, exposureMicros: 240_000 },
    ], 12)).toBe(100);
  });

  it('keeps incomplete coverage below 100 percent', () => {
    expect(calculateCoveragePercent([
      { blockIndex: 0, exposureMicros: 240_000 },
      { blockIndex: 1, exposureMicros: 239_999 },
    ], 10)).toBe(50);
  });
});
