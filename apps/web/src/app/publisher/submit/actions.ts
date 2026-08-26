'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getDb } from '@/lib/db';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { publisherSubmissions, notifications, books } from '@bukoo/db';
import { eq, inArray } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { getPublisherUser, getAdminUser } from '@/lib/publisher-auth';

// ---------------------------------------------------------------------------
// R2 helpers (mirrors books/actions.ts)
// ---------------------------------------------------------------------------

async function uploadToR2(file: File, folder: 'covers' | 'epubs'): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'bin';
  const key = `${folder}/${createId()}.${ext}`;
  const { env } = getCloudflareContext();
  await env.BUKOO_STORAGE.put(key, file, {
    httpMetadata: { contentType: file.type || 'application/octet-stream' },
  });
  return key;
}

async function deleteFromR2(key: string | null | undefined) {
  if (!key) return;
  const { env } = getCloudflareContext();
  await env.BUKOO_STORAGE.delete(key).catch(() => {});
}

// ---------------------------------------------------------------------------
// Publisher: submit a title for curation review
// ---------------------------------------------------------------------------

export async function submitPublisherSubmission(formData: FormData) {
  const user = await getPublisherUser();
  const db = getDb();

  const title = (formData.get('title') as string)?.trim();
  const author = (formData.get('author') as string)?.trim();
  const isbn = (formData.get('isbn') as string)?.trim() || null;
  const genre = (formData.get('genre') as string)?.trim();
  const year = formData.get('year') ? Number(formData.get('year')) : null;
  const synopsis = (formData.get('synopsis') as string)?.trim();
  const releaseWindow = (formData.get('releaseWindow') as string)?.trim();
  const positioning = (formData.get('positioning') as string)?.trim();
  const storeUrl = (formData.get('storeUrl') as string)?.trim() || null;

  if (!title || !author) {
    throw new Error('Judul dan penulis wajib diisi.');
  }

  const coverFile = formData.get('cover') as File | null;
  const epubFile = formData.get('epub') as File | null;
  if (!epubFile || epubFile.size === 0) {
    throw new Error('Berkas buku (EPUB/PDF) wajib diunggah.');
  }

  let epubKey: string | null = null;
  let coverKey: string | null = null;

  try {
    if (epubFile.size > 0) {
      const ext = epubFile.name.split('.').pop()?.toLowerCase() ?? '';
      if (!['epub', 'pdf'].includes(ext)) {
        throw new Error('Format berkas buku harus EPUB atau PDF.');
      }
      if (epubFile.size > 100 * 1024 * 1024) {
        throw new Error('Ukuran berkas buku maksimal 100MB.');
      }
      epubKey = await uploadToR2(epubFile, 'epubs');
    }
    if (coverFile && coverFile.size > 0) {
      coverKey = await uploadToR2(coverFile, 'covers');
    }

    await db.insert(publisherSubmissions).values({
      id: createId(),
      publisherUserId: user.id,
      title,
      author,
      isbn: isbn || undefined,
      synopsis: synopsis || undefined,
      genre: JSON.stringify(genre ? [genre] : []),
      language: 'ID',
      publishedYear: year ?? undefined,
      epubKey,
      coverKey,
      releaseWindow: releaseWindow || undefined,
      positioning: positioning || undefined,
      storeUrl: storeUrl || undefined,
      status: 'SUBMITTED',
      submittedAt: new Date().toISOString(),
    });

    await db.insert(notifications).values({
      id: createId(),
      userId: user.id,
      kind: 'submission',
      title: 'Pengajuan terkirim',
      body: `"${title}" telah dikirim ke tim kurasi BUKOO.`,
      entityType: 'submission',
      entityId: '',
    });
  } catch (err) {
    await Promise.all([deleteFromR2(epubKey), deleteFromR2(coverKey)]);
    throw err;
  }

  revalidatePath('/publisher/dashboard');
  redirect('/publisher/dashboard');
}

// ---------------------------------------------------------------------------
// Admin: list submissions + approve/reject
// ---------------------------------------------------------------------------

export async function listSubmissionsAdmin() {
  await getAdminUser();
  const db = getDb();
  return db
    .select()
    .from(publisherSubmissions)
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

  const submission = await db.query.publisherSubmissions.findFirst({
    where: eq(publisherSubmissions.id, submissionId),
  });
  if (!submission) {
    throw new Error('Submission not found');
  }

  const now = new Date().toISOString();

  await db
    .update(publisherSubmissions)
    .set({
      status: decision,
      reviewerUserId: reviewer.id,
      reviewNote: note || null,
      reviewedAt: now,
      updatedAt: now,
    })
    .where(eq(publisherSubmissions.id, submissionId));

  // On approval: create/update the catalog book and publish it.
  if (decision === 'APPROVED') {
    let bookId = submission.bookId;
    if (!bookId) {
      bookId = createId();
    }
    await db.insert(books).values({
      id: bookId,
      title: submission.title,
      author: submission.author,
      description: submission.synopsis,
      isbn: submission.isbn || undefined,
      coverKey: submission.coverKey,
      epubKey: submission.epubKey,
      genre: submission.genre,
      language: submission.language,
      publishedYear: submission.publishedYear ?? undefined,
      totalPages: submission.totalPages ?? undefined,
      subscriptionRequired: submission.subscriptionRequired,
      isPublished: true,
      publicationStatus: 'PUBLISHED',
      publisherUserId: submission.publisherUserId,
    }).onConflictDoUpdate({
      target: books.id,
      set: {
        title: submission.title,
        author: submission.author,
        description: submission.synopsis,
        isbn: submission.isbn || undefined,
        coverKey: submission.coverKey,
        epubKey: submission.epubKey,
        genre: submission.genre,
        language: submission.language,
        publishedYear: submission.publishedYear ?? undefined,
        totalPages: submission.totalPages ?? undefined,
        subscriptionRequired: submission.subscriptionRequired,
        isPublished: true,
        publicationStatus: 'PUBLISHED',
        publisherUserId: submission.publisherUserId,
      },
    });

    await db
      .update(publisherSubmissions)
      .set({
        status: 'PUBLISHED',
        bookId,
        reviewedAt: now,
        updatedAt: now,
      })
      .where(eq(publisherSubmissions.id, submissionId));

    await db.insert(notifications).values({
      id: createId(),
      userId: submission.publisherUserId,
      kind: 'review',
      title: 'Buku aktif di katalog',
      body: `"${submission.title}" telah disetujui dan kini tersedia.`,
      entityType: 'book',
      entityId: bookId,
    });
  } else {
    await db.insert(notifications).values({
      id: createId(),
      userId: submission.publisherUserId,
      kind: 'review',
      title: decision === 'REJECTED' ? 'Pengajuan ditolak' : 'Perubahan diperlukan',
      body: `"${submission.title}": ${note || 'Ditinjau oleh tim kurasi.'}`,
      entityType: 'submission',
      entityId: submissionId,
    });
  }

  revalidatePath('/admin/submissions');
  revalidatePath('/publisher/dashboard');
  revalidatePath('/publisher/books');
}