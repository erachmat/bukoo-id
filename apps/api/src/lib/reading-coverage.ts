export const READING_PROGRESS_EPOCH = 2;
export const READING_COVERAGE_WORDS_PER_BLOCK = 5;
export const READING_COVERAGE_MICROS_PER_WORD = 240_000;
export const MAX_READING_WORDS = 20_000_000;
export const MAX_COVERAGE_DELTAS_PER_SYNC = 2_000;

export interface CoverageDelta {
  blockIndex: number;
  exposureMicros: number;
}

export function validateCoverageDeltas(
  deltas: readonly CoverageDelta[],
  totalWords: number,
): CoverageDelta[] {
  if (!Number.isSafeInteger(totalWords) || totalWords <= 0 || totalWords > MAX_READING_WORDS) {
    throw new Error('Book reading manifest has an invalid word count');
  }
  if (deltas.length > MAX_COVERAGE_DELTAS_PER_SYNC) {
    throw new Error('Too many coverage blocks in one sync');
  }
  const blockCount = Math.ceil(totalWords / READING_COVERAGE_WORDS_PER_BLOCK);
  const sorted = [...deltas].sort((a, b) => a.blockIndex - b.blockIndex);
  let previous = -1;
  for (const delta of sorted) {
    if (
      !Number.isSafeInteger(delta.blockIndex) ||
      delta.blockIndex < 0 ||
      delta.blockIndex >= blockCount ||
      delta.blockIndex === previous ||
      !Number.isSafeInteger(delta.exposureMicros) ||
      delta.exposureMicros <= 0 ||
      delta.exposureMicros > READING_COVERAGE_MICROS_PER_WORD
    ) {
      throw new Error('Coverage delta is outside the book reading manifest');
    }
    previous = delta.blockIndex;
  }
  return sorted;
}

export function mergeCoverageExposure(
  current: readonly CoverageDelta[],
  deltas: readonly CoverageDelta[],
  totalWords: number,
): CoverageDelta[] {
  const result = new Map<number, number>();
  for (const item of validateCoverageDeltas(current, totalWords)) {
    result.set(item.blockIndex, Math.min(READING_COVERAGE_MICROS_PER_WORD, item.exposureMicros));
  }
  for (const item of validateCoverageDeltas(deltas, totalWords)) {
    result.set(
      item.blockIndex,
      Math.min(READING_COVERAGE_MICROS_PER_WORD, (result.get(item.blockIndex) ?? 0) + item.exposureMicros),
    );
  }
  return [...result]
    .sort(([a], [b]) => a - b)
    .map(([blockIndex, exposureMicros]) => ({ blockIndex, exposureMicros }));
}

export function calculateCoveragePercent(
  coverage: readonly CoverageDelta[],
  totalWords: number,
): number {
  if (!Number.isSafeInteger(totalWords) || totalWords <= 0 || totalWords > MAX_READING_WORDS) return 0;
  const covered = new Set(
    validateCoverageDeltas(coverage, totalWords)
      .filter(({ exposureMicros }) => exposureMicros >= READING_COVERAGE_MICROS_PER_WORD)
      .map(({ blockIndex }) => blockIndex),
  );
  let coveredWords = 0;
  for (const blockIndex of covered) {
    coveredWords += Math.min(
      READING_COVERAGE_WORDS_PER_BLOCK,
      totalWords - blockIndex * READING_COVERAGE_WORDS_PER_BLOCK,
    );
  }
  if (coveredWords >= totalWords) return 100;
  return Math.min(99, Math.floor((coveredWords / totalWords) * 100));
}
