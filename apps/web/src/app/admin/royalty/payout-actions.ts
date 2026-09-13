'use server';

import { revalidatePath } from 'next/cache';
import { and, desc, eq } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import {
  notifications as notificationsTable,
  publisherPayoutAccounts,
  publisherPayouts,
  publisherRoyaltyPeriods,
} from '@bukoo/db';
import { createId } from '@paralleldrive/cuid2';
import { getAdminUser } from '@/lib/publisher-auth';

export type PayoutActionState = {
  ok: boolean;
  message: string;
};

/**
 * Sprint 2.2 — Create a payout row from a CALCULATED royalty period.
 * Status starts as SCHEDULED (admin reviews payout account, then marks PROCESSING).
 * One payout per period per publisher (enforced by unique-ish logic in the action).
 */
export async function createPayout(
  _previousState: PayoutActionState,
  formData: FormData,
): Promise<PayoutActionState> {
  await getAdminUser();

  const periodId = String(formData.get('periodId') ?? '').trim();
  const payoutAccountId = String(formData.get('payoutAccountId') ?? '').trim();

  if (!periodId) {
    return { ok: false, message: 'Pilih periode royalti.' };
  }

  const db = getDb();

  const period = await db.query.publisherRoyaltyPeriods.findFirst({
    where: eq(publisherRoyaltyPeriods.id, periodId),
  });
  if (!period) {
    return { ok: false, message: 'Periode tidak ditemukan.' };
  }
  if (period.status !== 'CALCULATED') {
    return { ok: false, message: `Periode harus berstatus CALCULATED (sekarang ${period.status}).` };
  }
  if (period.publisherShare <= 0) {
    return { ok: false, message: 'Bagian penerbit nol — tidak ada payout yang perlu dibuat.' };
  }

  // Idempotency: already has a payout?
  const existing = await db.query.publisherPayouts.findFirst({
    where: eq(publisherPayouts.royaltyPeriodId, periodId),
  });
  if (existing) {
    return { ok: false, message: `Payout sudah ada untuk periode ini (status ${existing.status}).` };
  }

  // Default to publisher's ACTIVE account if none specified.
  let accountId = payoutAccountId || null;
  if (!accountId) {
    const active = await db.query.publisherPayoutAccounts.findFirst({
      where: and(
        eq(publisherPayoutAccounts.publisherUserId, period.publisherUserId),
        eq(publisherPayoutAccounts.status, 'ACTIVE'),
      ),
      orderBy: desc(publisherPayoutAccounts.createdAt),
    });
    accountId = active?.id ?? null;
  }

  const payoutId = createId();
  await db.batch([
    db.insert(publisherPayouts).values({
      id: payoutId,
      publisherUserId: period.publisherUserId,
      royaltyPeriodId: periodId,
      payoutAccountId: accountId,
      amount: period.publisherShare,
      currency: period.currency,
      status: 'SCHEDULED',
      scheduledAt: new Date().toISOString(),
    }),
    db.insert(notificationsTable).values({
      id: createId(),
      userId: period.publisherUserId,
      kind: 'PAYOUT',
      title: 'Payout dijadwalkan',
      body: `Payout sebesar Rp ${period.publisherShare.toLocaleString('id-ID')} untuk periode ${period.periodStart.slice(0, 7)} telah dijadwalkan.`,
    }),
  ]);

  revalidatePath('/admin/royalty');
  revalidatePath('/publisher/dashboard');
  return { ok: true, message: `Payout Rp ${period.publisherShare.toLocaleString('id-ID')} dijadwalkan (SCHEDULED).` };
}

/**
 * Update payout status: SCHEDULED → PROCESSING → PAID/FAILED.
 * PAID sets processedAt; FAILED requires failureReason.
 */
export async function updatePayoutStatus(
  _previousState: PayoutActionState,
  formData: FormData,
): Promise<PayoutActionState> {
  await getAdminUser();

  const payoutId = String(formData.get('payoutId') ?? '').trim();
  const status = String(formData.get('status') ?? '').trim() as
    | 'PROCESSING'
    | 'PAID'
    | 'FAILED'
    | 'CANCELED';
  const externalRef = String(formData.get('externalRef') ?? '').trim() || null;
  const failureReason = String(formData.get('failureReason') ?? '').trim() || null;

  if (!payoutId || !['PROCESSING', 'PAID', 'FAILED', 'CANCELED'].includes(status)) {
    return { ok: false, message: 'Parameter tidak valid.' };
  }
  if (status === 'FAILED' && !failureReason) {
    return { ok: false, message: 'Alasan gagal wajib diisi untuk status FAILED.' };
  }

  const db = getDb();

  const payout = await db.query.publisherPayouts.findFirst({
    where: eq(publisherPayouts.id, payoutId),
  });
  if (!payout) {
    return { ok: false, message: 'Payout tidak ditemukan.' };
  }

  const validTransitions: Record<string, string[]> = {
    SCHEDULED: ['PROCESSING', 'CANCELED'],
    PROCESSING: ['PAID', 'FAILED', 'CANCELED'],
    PAID: [],
    FAILED: ['PROCESSING', 'CANCELED'],
    CANCELED: ['SCHEDULED'],
  };
  if (!validTransitions[payout.status]?.includes(status)) {
    return { ok: false, message: `Transisi ${payout.status} → ${status} tidak diizinkan.` };
  }

  const now = new Date().toISOString();
  const updates: Record<string, unknown> = {
    status,
    updatedAt: now,
  };
  if (externalRef) updates.externalRef = externalRef;
  if (failureReason) updates.failureReason = failureReason;
  if (status === 'PAID') updates.processedAt = now;

  await db.batch([
    db.update(publisherPayouts).set(updates).where(eq(publisherPayouts.id, payoutId)),
    db.insert(notificationsTable).values({
      id: createId(),
      userId: payout.publisherUserId,
      kind: 'PAYOUT',
      title: payoutTitle(status),
      body: payoutBody(status, payout.amount, externalRef, failureReason),
    }),
  ]);

  revalidatePath('/admin/royalty');
  revalidatePath('/publisher/dashboard');
  return { ok: true, message: `Payout ${status.toLowerCase()}.` };
}

function payoutTitle(status: string): string {
  switch (status) {
    case 'PROCESSING':
      return 'Payout diproses';
    case 'PAID':
      return 'Payout terbayar';
    case 'FAILED':
      return 'Payout gagal';
    case 'CANCELED':
      return 'Payout dibatalkan';
    default:
      return 'Payout diperbarui';
  }
}

function payoutBody(
  status: string,
  amount: number,
  externalRef: string | null,
  failureReason: string | null,
): string {
  const base = `Rp ${amount.toLocaleString('id-ID')}`;
  switch (status) {
    case 'PROCESSING':
      return `Payout ${base} sedang diproses${externalRef ? ` (ref: ${externalRef})` : ''}.`;
    case 'PAID':
      return `Payout ${base} telah dibayarkan${externalRef ? ` (ref: ${externalRef})` : ''}.`;
    case 'FAILED':
      return `Payout ${base} gagal: ${failureReason}${externalRef ? ` (ref: ${externalRef})` : ''}.`;
    case 'CANCELED':
      return `Payout ${base} dibatalkan${failureReason ? ` (${failureReason})` : ''}.`;
    default:
      return `Status payout ${base} diperbarui.`;
  }
}

export interface AdminPayoutAccount {
  id: string;
  method: string;
  maskedAccount: string | null;
}

export async function getAdminPayoutAccounts(): Promise<AdminPayoutAccount[]> {
  await getAdminUser();
  const db = getDb();

  return db
    .select({
      id: publisherPayoutAccounts.id,
      method: publisherPayoutAccounts.method,
      maskedAccount: publisherPayoutAccounts.maskedAccount,
    })
    .from(publisherPayoutAccounts)
    .where(eq(publisherPayoutAccounts.status, 'ACTIVE'))
    .orderBy(desc(publisherPayoutAccounts.createdAt));
}

export type AdminPayoutRow = {
  id: string;
  publisherUserId: string;
  publisherName: string;
  periodStart: string;
  amount: number;
  status: string;
  externalRef: string | null;
  createdAt: string;
  updatedAt: string;
  processedAt: string | null;
};

export async function getAdminPayouts(): Promise<AdminPayoutRow[]> {
  await getAdminUser();
  const db = getDb();

  const payouts = await db
    .select({
      id: publisherPayouts.id,
      publisherUserId: publisherPayouts.publisherUserId,
      periodStart: publisherRoyaltyPeriods.periodStart,
      amount: publisherPayouts.amount,
      status: publisherPayouts.status,
      externalRef: publisherPayouts.externalRef,
      createdAt: publisherPayouts.createdAt,
      updatedAt: publisherPayouts.updatedAt,
      processedAt: publisherPayouts.processedAt,
    })
    .from(publisherPayouts)
    .innerJoin(publisherRoyaltyPeriods, eq(publisherPayouts.royaltyPeriodId, publisherRoyaltyPeriods.id))
    .orderBy(desc(publisherPayouts.createdAt));

  const userIds = [...new Set(payouts.map((p) => p.publisherUserId))];
  const nameMap = new Map<string, string>();
  if (userIds.length > 0) {
    const users = await db.query.users.findMany({
      where: (usersTable, { inArray }) => inArray(usersTable.id, userIds),
      columns: { id: true, name: true, email: true },
    });
    for (const u of users) nameMap.set(u.id, u.name || u.email);
  }

  return payouts.map((p) => ({
    ...p,
    publisherName: nameMap.get(p.publisherUserId) || p.publisherUserId,
  }));
}