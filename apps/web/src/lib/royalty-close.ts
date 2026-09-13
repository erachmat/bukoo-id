/**
 * Royalty period close calculation (Sprint 2.1) — pure functions, no DB.
 *
 * Formula (v1, matches ROYALTY_CONFIG in publisher/dashboard/queries.ts):
 *   grossAmount = (readSeconds / 3600) * ratePerHour * (rateBps / 10000)
 *   taxableAmount = grossAmount
 *   taxAmount = PPh 23 = 23% of taxable (taxRateBps default 2300)
 *   netAmount = grossAmount − taxAmount
 *
 * Money is integer IDR minor units (rupiah). All rounding is half-up at the
 * line level so period totals are the exact sum of their lines.
 */

export const ROYALTY_CALC_VERSION = 'v1-pph23';

/** PPh 23 rate in basis points: 2300 = 23%. */
export const PPH23_RATE_BPS = 2300;

export interface ClosePeriodConfig {
  /** Monthly revenue pool in IDR used by the v1 estimate formula. */
  monthlyPool: number;
  /** Publisher share rate in basis points (6500 = 65%). */
  rateBps: number;
  /** Withholding tax rate in basis points (2300 = PPh 23 23%). */
  taxRateBps: number;
  /** IDR paid per hour of reading time in the v1 formula. */
  ratePerHour: number;
}

export interface ClosePeriodBookInput {
  bookId: string;
  readSeconds: number;
  /** Book-specific rate override, or null to use the platform rateBps. */
  rateBpsOverride?: number | null;
  /** Set 'NONE' to zero the tax for this line (e.g. exempt publisher). */
  taxType?: 'PPh_23' | 'NONE';
}

export interface ClosePeriodLineResult {
  bookId: string;
  readSeconds: number;
  rateBps: number;
  grossAmount: number;
  taxableAmount: number;
  taxRateBps: number;
  taxAmount: number;
  taxType: 'PPh_23' | 'NONE';
  netAmount: number;
  calcMeta: string;
}

export interface ClosePeriodResult {
  lines: ClosePeriodLineResult[];
  /** Sum of all line gross amounts (minor units). */
  revenuePool: number;
  /** Sum of all line net amounts (minor units) — what the publisher receives. */
  publisherShare: number;
  /** Sum of withheld tax (minor units). */
  totalTax: number;
  calcVersion: string;
}

/** Half-up rounding for non-negative integers in minor units. */
function roundHalfUp(value: number): number {
  return Math.floor(value + 0.5);
}

/**
 * Compute royalty lines for one publisher's close-month run. Pure: same input
 * always yields the same output, safe to unit-test without a DB.
 */
export function computeClosePeriod(
  config: ClosePeriodConfig,
  books: ClosePeriodBookInput[],
): ClosePeriodResult {
  const lines: ClosePeriodLineResult[] = [];

  for (const book of books) {
    const rateBps = book.rateBpsOverride ?? config.rateBps;
    const grossAmount = roundHalfUp(
      (book.readSeconds / 3600) * config.ratePerHour * (rateBps / 10000),
    );
    const taxType = book.taxType ?? 'PPh_23';
    const taxableAmount = grossAmount;
    const taxRateBps = taxType === 'NONE' ? 0 : config.taxRateBps;
    const taxAmount = taxType === 'NONE' ? 0 : roundHalfUp((taxableAmount * taxRateBps) / 10000);
    const netAmount = grossAmount - taxAmount;

    lines.push({
      bookId: book.bookId,
      readSeconds: book.readSeconds,
      rateBps,
      grossAmount,
      taxableAmount,
      taxRateBps,
      taxAmount,
      taxType,
      netAmount,
      calcMeta: JSON.stringify({
        version: ROYALTY_CALC_VERSION,
        ratePerHour: config.ratePerHour,
        pool: config.monthlyPool,
      }),
    });
  }

  const revenuePool = lines.reduce((sum, l) => sum + l.grossAmount, 0);
  const publisherShare = lines.reduce((sum, l) => sum + l.netAmount, 0);
  const totalTax = lines.reduce((sum, l) => sum + l.taxAmount, 0);

  return { lines, revenuePool, publisherShare, totalTax, calcVersion: ROYALTY_CALC_VERSION };
}

/**
 * The v1 hourly rate implied by the configured pool — documented heuristic:
 * pool / 720 hours (≈ a 30-day month of reading across all publishers).
 * Exported so the action and tests agree on one derivation.
 */
export function hourlyRateFromPool(monthlyPool: number): number {
  return monthlyPool > 0 ? monthlyPool / 720 : 0;
}

/** Calendar month bounds (inclusive start, exclusive end) for a YYYY-MM key. */
export function monthBounds(periodMonth: string): { start: string; endExclusive: string } {
  const [year, month] = periodMonth.split('-').map(Number);
  if (!year || !month || month < 1 || month > 12) {
    throw new Error('Format periode harus YYYY-MM.');
  }
  const start = `${periodMonth}-01`;
  const nextYear = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const endExclusive = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;
  return { start, endExclusive };
}
