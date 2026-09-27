'use server';

import { revalidatePath } from 'next/cache';
import { books, notifications, publisherSubmissions } from '@bukoo/db';
import { createId } from '@paralleldrive/cuid2';
import { and, eq, inArray } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { getAdminUser } from '@/lib/publisher-auth';
import { catalogFingerprint } from '@/lib/publisher-book-input';

export async function listSubmissionsAdmin() {
  await getAdminUser();
  return getDb().select().from(publisherSubmissions)
    .where(inArray(publisherSubmissions.status, ['SUBMITTED', 'IN_REVIEW']))
    .orderBy(publisherSubmissions.createdAt);
}

export async function adminReviewSubmission(
  submissionId: string,
  decision: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED',
  note?: string,
) {
  const reviewer = await getAdminUser();
  const db = getDb();
  const submission = await db.query.publisherSubmissions.findFirst({ where: eq(publisherSubmissions.id, submissionId) });
  if (!submission || !['SUBMITTED', 'IN_REVIEW'].includes(submission.status)) throw new Error('Pengajuan sudah diproses atau tidak ditemukan.');
  const linkedBook = submission.bookId ? await db.query.books.findFirst({ where: eq(books.id, submission.bookId) }) : null;
  if (linkedBook?.archivedAt) throw new Error('Buku telah diarsipkan penerbit. Pulihkan sebelum review.');
  if (linkedBook && linkedBook.publisherUserId !== submission.publisherUserId) throw new Error('Pengajuan dan buku memiliki pemilik berbeda.');
  const now = new Date().toISOString();
  const bookId = submission.bookId ?? createId();
  const fingerprint = submission.isbn ? null : catalogFingerprint(submission.title, submission.author);
  const reviewStatus = decision === 'APPROVED' ? 'PUBLISHED' : decision === 'REJECTED' ? 'REJECTED' : 'DRAFT';
  const submissionStatus = decision === 'APPROVED' ? 'PUBLISHED' : decision;
  const bookValues = {
    title: submission.title, author: submission.author, description: submission.synopsis,
    isbn: submission.isbn, catalogFingerprint: fingerprint, coverKey: submission.coverKey,
    epubKey: submission.epubKey, genre: submission.genre, language: submission.language,
    publishedYear: submission.publishedYear, totalPages: submission.totalPages,
    subscriptionRequired: submission.subscriptionRequired, publisherUserId: submission.publisherUserId,
    isPublished: decision === 'APPROVED', publicationStatus: reviewStatus, updatedAt: now,
  };
  const notification = {
    id: createId(), userId: submission.publisherUserId, kind: 'review',
    title: decision === 'APPROVED' ? 'Buku aktif di katalog' : decision === 'REJECTED' ? 'Pengajuan ditolak' : 'Perubahan diperlukan',
    body: decision === 'APPROVED' ? `"${submission.title}" telah disetujui dan kini tersedia.` : `"${submission.title}": ${note || 'Ditinjau oleh tim kurasi.'}`,
    entityType: linkedBook || decision === 'APPROVED' ? 'book' : 'submission',
    entityId: linkedBook || decision === 'APPROVED' ? bookId : submissionId,
  };
  const statusUpdate = db.update(publisherSubmissions).set({
    status: submissionStatus, bookId: submission.bookId ?? (decision === 'APPROVED' ? bookId : null),
    reviewerUserId: reviewer.id, reviewNote: note?.trim() || null, reviewedAt: now, updatedAt: now,
  }).where(and(eq(publisherSubmissions.id, submissionId), inArray(publisherSubmissions.status, ['SUBMITTED', 'IN_REVIEW'])));
  if (linkedBook) await db.batch([
    db.update(books).set({ ...bookValues, archivedAt: null }).where(and(eq(books.id, linkedBook.id), eq(books.publisherUserId, submission.publisherUserId))),
    statusUpdate,
    db.insert(notifications).values(notification),
  ]);
  else if (decision === 'APPROVED') await db.batch([
    db.insert(books).values({ id: bookId, ...bookValues }),
    statusUpdate,
    db.insert(notifications).values(notification),
  ]);
  else await db.batch([statusUpdate, db.insert(notifications).values(notification)]);
  revalidatePath('/admin/submissions');
  revalidatePath('/publisher/dashboard');
  revalidatePath('/publisher/books');
}
