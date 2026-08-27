'use server';

import { revalidatePath } from 'next/cache';
import { getDb } from '@/lib/db';
import { publisherCampaignRequests, books, notifications } from '@bukoo/db';
import { eq, and } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { getPublisherUser } from '@/lib/publisher-auth';

export const MAX_CAMPAIGN_BUDGET_IDR = 100_000_000;

function isStrictIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

// ---------------------------------------------------------------------------
// Publisher: request a promotional campaign for a published, owned book.
// Requests are persisted with status SUBMITTED and reviewed by the BUKOO team
// (admin review tooling is a future iteration).
// ---------------------------------------------------------------------------

export async function createCampaignRequest(formData: FormData) {
  const user = await getPublisherUser();
  const db = getDb();

  const campaignName = (formData.get('campaignName') as string)?.trim();
  const bookId = (formData.get('bookId') as string)?.trim();
  const startDate = (formData.get('startDate') as string)?.trim();
  const endDate = (formData.get('endDate') as string)?.trim();
  const goal = (formData.get('goal') as string)?.trim() || null;
  const notes = (formData.get('notes') as string)?.trim() || null;
  const budgetRaw = (formData.get('budget') as string)?.trim();

  if (!campaignName) throw new Error('Nama kampanye wajib diisi.');
  if (!bookId) throw new Error('Pilih buku yang akan dikampanyekan.');
  if (!startDate || !endDate) throw new Error('Tanggal mulai dan selesai wajib diisi.');
  if (!isStrictIsoDate(startDate) || !isStrictIsoDate(endDate)) {
    throw new Error('Format tanggal tidak valid. Gunakan tanggal kalender yang benar.');
  }
  if (startDate > endDate) throw new Error('Tanggal selesai harus sama atau setelah tanggal mulai.');

  let budget: number | null = null;
  if (budgetRaw) {
    const digits = budgetRaw.replace(/\D/g, '');
    budget = digits ? Number(digits) : NaN;
    if (!Number.isSafeInteger(budget) || budget <= 0 || budget > MAX_CAMPAIGN_BUDGET_IDR) {
      throw new Error(`Anggaran harus berupa angka Rupiah antara 1 dan ${MAX_CAMPAIGN_BUDGET_IDR.toLocaleString('id-ID')}.`);
    }
  }

  // Ownership + published check — the book must belong to this publisher.
  const book = await db.query.books.findFirst({
    where: and(eq(books.id, bookId), eq(books.publisherUserId, user.id)),
  });
  if (!book) {
    throw new Error('Buku tidak ditemukan atau bukan milik Anda.');
  }
  if (!book.isPublished || book.publicationStatus !== 'PUBLISHED') {
    throw new Error('Hanya buku yang sudah terbit yang dapat dikampanyekan.');
  }

  const now = new Date().toISOString();

  await db.insert(publisherCampaignRequests).values({
    id: createId(),
    publisherUserId: user.id,
    bookId,
    campaignName,
    startDate,
    endDate,
    goal: goal || undefined,
    notes: notes || undefined,
    budget: budget ?? undefined,
    status: 'SUBMITTED',
    submittedAt: now,
  });

  await db.insert(notifications).values({
    id: createId(),
    userId: user.id,
    kind: 'campaign',
    title: 'Pengajuan promosi terkirim',
    body: `Kampanye "${campaignName}" telah dikirim ke tim BUKOO.`,
    entityType: 'campaign',
    entityId: '',
  });

  revalidatePath('/publisher/promotions');
}
