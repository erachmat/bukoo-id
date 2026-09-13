'use server';

import { revalidatePath } from 'next/cache';
import { and, eq, gte, inArray, sql } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import {
  books as booksTable,
  notifications as notificationsTable,
  publisherBookDailyMetrics,
  publisherRoyaltyLines,
  publisherRoyaltyPeriods,
} from '@bukoo/db';
import { createId } from '@paralleldrive/cuid2';
import { getAdminUser } from '@/lib/publisher-auth';
import { getPlatformSetting } from '@/lib/platform-settings';
import {
  computeClosePeriod,
  hourlyRateFromPool,
  monthBounds,
  PPH23_RATE_BPS,
  type ClosePeriodBookInput,
} from '@/lib/royalty-close';

export type ClosePeriodState = {
  ok: boolean;
  message: string;
};

/**
 * Admin "close month" (Sprint 2.1): computes and freezes one publisher's
 * royalty period for a calendar month as an immutable snapshot.
 *
 * Idempotency: if a period row already exists for (publisher, month) the
 * action refuses to overwrite it — delete the row first to re-run (VOID by
 * re-close is intentionally out of scope until payout status flow lands).
 */
export async function closeRoyaltyPeriod(
  _previousState: ClosePeriodState,
  formData: FormData,
): Promise<ClosePeriodState> {
  await getAdminUser();

  const publisherUserId = String(formData.get('publisherUserId') ?? '').trim();
  const periodMonth = String(formData.get('periodMonth') ?? '').trim();

  if (!publisherUserId) {
    return { ok: false, message: 'Pilih penerbit terlebih dahulu.' };
  }
  if (!/^\d{4}-\d{2}$/.test(periodMonth)) {
    return { ok: false, message: 'Format periode harus YYYY-MM.' };
  }

  const db = getDb();
  const { start, endExclusive } = monthBounds(periodMonth);

  const existing = await db.query.publisherRoyaltyPeriods.findFirst({
    where: and(
      eq(publisherRoyaltyPeriods.publisherUserId, publisherUserId),
      eq(publisherRoyaltyPeriods.periodStart, start),
      eq(publisherRoyaltyPeriods.periodEnd, endExclusive),
    ),
  });
  if (existing) {
    return {
      ok: false,
      message: `Periode ${periodMonth} sudah ditutup untuk penerbit ini (status ${existing.status}). Hapus snapshot dulu untuk menghitung ulang.`,
    };
  }

  const publisherBooks = await db
    .select({ id: booksTable.id })
    .from(booksTable)
    .where(eq(booksTable.publisherUserId, publisherUserId));
  if (publisherBooks.length === 0) {
    return { ok: false, message: 'Penerbit ini belum memiliki buku.' };
  }
  const bookIds = publisherBooks.map((b) => b.id);

  // Per-book reading seconds inside the calendar month.
  const metricRows = await db
    .select({
      bookId: publisherBookDailyMetrics.bookId,
      seconds: sql<number>`coalesce(sum(${publisherBookDailyMetrics.readingSeconds}), 0)`,
    })
    .from(publisherBookDailyMetrics)
    .where(and(
      inArray(publisherBookDailyMetrics.bookId, bookIds),
      gte(publisherBookDailyMetrics.metricDate, start),
      sql`${publisherBookDailyMetrics.metricDate} < ${endExclusive}`,
    ))
    .groupBy(publisherBookDailyMetrics.bookId);

  const [poolSetting, rateBpsSetting] = await Promise.all([
    getPlatformSetting('royalty_monthly_pool'),
    getPlatformSetting('royalty_rate_bps'),
  ]);
  const monthlyPool = Number(poolSetting ?? 0);
  const rateBps = Number(rateBpsSetting ?? 6500);
  const config = {
    monthlyPool,
    rateBps,
    taxRateBps: PPH23_RATE_BPS,
    ratePerHour: hourlyRateFromPool(monthlyPool),
  };

  const bookInputs: ClosePeriodBookInput[] = metricRows.map((row) => ({
    bookId: row.bookId,
    readSeconds: Number(row.seconds),
  }));
  const calc = computeClosePeriod(config, bookInputs);

  const periodId = createId();
  await db.batch([
    db.insert(publisherRoyaltyPeriods).values({
      id: periodId,
      publisherUserId,
      periodStart: start,
      periodEnd: endExclusive,
      status: 'CALCULATED',
      currency: 'IDR',
      revenuePool: calc.revenuePool,
      publisherShare: calc.publisherShare,
      calcVersion: calc.calcVersion,
      finalizedAt: new Date().toISOString(),
    }),
    // Lines are written only when there is activity; an all-zero month still
    // creates the period header so the dashboard can show "0, finalized".
    ...(calc.lines.length > 0
      ? [
          db.insert(publisherRoyaltyLines).values(
            calc.lines.map((line) => ({
              id: createId(),
              periodId,
              publisherUserId,
              bookId: line.bookId,
              readSeconds: line.readSeconds,
              rateBps: line.rateBps,
              grossAmount: line.grossAmount,
              taxableAmount: line.taxableAmount,
              taxRateBps: line.taxRateBps,
              taxAmount: line.taxAmount,
              taxType: line.taxType,
              netAmount: line.netAmount,
              calcMeta: line.calcMeta,
            })),
          ),
        ]
      : []),
    // In-app notification so the publisher sees the finalized period.
    db.insert(notificationsTable).values({
      id: createId(),
      userId: publisherUserId,
      kind: 'ROYALTY',
      title: `Royalti ${periodMonth} difinalisasi`,
      body: `Periode ${periodMonth} telah ditutup. Bagian penerbit: Rp ${calc.publisherShare.toLocaleString('id-ID')} (pajak PPh 23: Rp ${calc.totalTax.toLocaleString('id-ID')}).`,
    }),
  ]);

  revalidatePath('/admin/royalty');
  revalidatePath('/publisher/dashboard');
  return {
    ok: true,
    message: `Periode ${periodMonth} ditutup. Pool: Rp ${calc.revenuePool.toLocaleString('id-ID')}, bagian penerbit: Rp ${calc.publisherShare.toLocaleString('id-ID')}, pajak: Rp ${calc.totalTax.toLocaleString('id-ID')}.`,
  };
}
