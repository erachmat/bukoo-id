export const COVERAGE_WORDS_PER_BLOCK = 5;
export const COVERAGE_MICROSECONDS_PER_WORD = 240_000;

export interface VisibleWordRange {
  startBlock: number;
  endBlock: number;
}

function normalizeRanges(
  ranges: readonly VisibleWordRange[],
  blockCount: number,
): VisibleWordRange[] {
  const sorted = ranges
    .map(({ startBlock, endBlock }) => ({
      startBlock: Math.max(0, Math.min(blockCount, Math.floor(startBlock))),
      endBlock: Math.max(0, Math.min(blockCount, Math.floor(endBlock))),
    }))
    .filter((range) => range.endBlock > range.startBlock)
    .sort((a, b) => a.startBlock - b.startBlock || a.endBlock - b.endBlock);

  const merged: VisibleWordRange[] = [];
  for (const range of sorted) {
    const previous = merged.at(-1);
    if (previous && range.startBlock <= previous.endBlock) {
      previous.endBlock = Math.max(previous.endBlock, range.endBlock);
    } else {
      merged.push({ ...range });
    }
  }
  return merged;
}

export function accumulateVisibleExposure(
  current: Uint32Array,
  visibleRanges: readonly VisibleWordRange[],
  elapsedMilliseconds: number,
  visibleWordCount: number,
  totalWordCount: number,
): Uint32Array {
  const blockCount = Math.ceil(Math.max(0, totalWordCount) / COVERAGE_WORDS_PER_BLOCK);
  const next = new Uint32Array(blockCount);
  next.set(current.subarray(0, blockCount));
  if (!Number.isFinite(elapsedMilliseconds) || elapsedMilliseconds <= 0 || visibleWordCount <= 0) return next;

  const ranges = normalizeRanges(visibleRanges, blockCount);
  const visibleBlocks = ranges.reduce((sum, range) => sum + range.endBlock - range.startBlock, 0);
  if (visibleBlocks === 0) return next;

  const coveredWords = ranges.reduce((sum, range) => {
    const firstWord = range.startBlock * COVERAGE_WORDS_PER_BLOCK;
    const endWord = Math.min(totalWordCount, range.endBlock * COVERAGE_WORDS_PER_BLOCK);
    return sum + Math.max(0, endWord - firstWord);
  }, 0);
  const effectiveVisibleWords = Math.max(1, Math.min(visibleWordCount, coveredWords));
  const exposurePerWord = Math.floor((elapsedMilliseconds * 1_000) / effectiveVisibleWords);
  if (exposurePerWord <= 0) return next;

  for (const range of ranges) {
    for (let block = range.startBlock; block < range.endBlock; block += 1) {
      next[block] = Math.min(
        COVERAGE_MICROSECONDS_PER_WORD,
        next[block] + exposurePerWord,
      );
    }
  }
  return next;
}

export function calculateCoveragePercent(
  coverage: Uint32Array,
  totalWordCount: number,
): number {
  if (!Number.isFinite(totalWordCount) || totalWordCount <= 0) return 0;
  const blockCount = Math.ceil(totalWordCount / COVERAGE_WORDS_PER_BLOCK);
  let coveredWords = 0;
  for (let block = 0; block < blockCount; block += 1) {
    if ((coverage[block] ?? 0) >= COVERAGE_MICROSECONDS_PER_WORD) {
      coveredWords += Math.min(
        COVERAGE_WORDS_PER_BLOCK,
        totalWordCount - block * COVERAGE_WORDS_PER_BLOCK,
      );
    }
  }
  if (coveredWords >= totalWordCount) return 100;
  return Math.min(99, Math.floor((coveredWords / totalWordCount) * 100));
}

export function encodeCoverage(coverage: Uint32Array): string {
  const bytes = new Uint8Array(coverage.length * 4);
  const view = new DataView(bytes.buffer);
  coverage.forEach((value, index) => view.setUint32(index * 4, value, true));
  let binary = '';
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  return btoa(binary);
}

export function decodeCoverage(encoded: string | null, blockCount: number): Uint32Array {
  const coverage = new Uint32Array(Math.max(0, blockCount));
  if (!encoded) return coverage;
  try {
    const binary = atob(encoded);
    const byteCount = Math.min(binary.length, coverage.length * 4);
    const bytes = new Uint8Array(byteCount);
    for (let index = 0; index < byteCount; index += 1) bytes[index] = binary.charCodeAt(index);
    const view = new DataView(bytes.buffer);
    for (let index = 0; index + 3 < byteCount; index += 4) {
      coverage[index / 4] = view.getUint32(index, true);
    }
  } catch {
    return coverage;
  }
  return coverage;
}
