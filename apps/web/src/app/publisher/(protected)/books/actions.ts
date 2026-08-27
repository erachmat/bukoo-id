'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getDb } from '@/lib/db';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { books, publisherSubmissions, notifications } from '@bukoo/db';
import { eq, and, inArray } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { getPublisherUser } from '@/lib/publisher-auth';
import { canPublish, canUnpublish, shouldReReview } from '@/lib/book-publication';

// ---------------------------------------------------------------------------
// Validation constants
// ---------------------------------------------------------------------------

const MAX_FILE_BYTES = 50 * 1024 * 1024; // 50 MB
const ALLOWED_EXTENSIONS = ['epub', 'pdf'];
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// ---------------------------------------------------------------------------
// R2 upload helpers (shared with admin/books/actions.ts)
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

function validateBookFile(file: File | null, folder: 'covers' | 'epubs') {
  if (!file || file.size === 0) return;
  if (file.size > MAX_FILE_BYTES) {
    throw new Error('Ukuran file melebihi batas 50MB.');
  }
  if (folder === 'epubs') {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      throw new Error('Format file harus EPUB atau PDF.');
    }
  } else {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new Error('Format cover harus JPG, PNG, atau WebP.');
    }
  }
}

function parseGenre(raw: string | null): string[] {
  if (!raw) return [];
  return raw.split(',').map((g) => g.trim()).filter(Boolean);
}

// ---------------------------------------------------------------------------
// Publisher book actions
// ---------------------------------------------------------------------------

export async function createPublisherBook(formData: FormData) {
  const user = await getPublisherUser();
  const db = getDb();

  const title = (formData.get('title') as string)?.trim();
  const author = (formData.get('author') as string)?.trim();
  const description = (formData.get('description') as string)?.trim();
  const genre = (formData.get('genre') as string)?.trim();
  const language = (formData.get('language') as string) || 'ID';
  const subscriptionRequired = (formData.get('subscriptionRequired') as string) || 'FREE';
  const year = formData.get('year') ? Number(formData.get('year')) : null;
  const pageCount = formData.get('pageCount') ? Number(formData.get('pageCount')) : null;

  if (!title || !author) {
    throw new Error('Judul dan penulis wajib diisi.');
  }

  const coverFile = formData.get('cover') as File | null;
  const epubFile = formData.get('epub') as File | null;

  validateBookFile(coverFile, 'covers');
  validateBookFile(epubFile, 'epubs');

  let coverKey: string | null = null;
  let epubKey: string | null = null;

  try {
    if (coverFile && coverFile.size > 0) {
      coverKey = await uploadToR2(coverFile, 'covers');
    }
    if (epubFile && epubFile.size > 0) {
      epubKey = await uploadToR2(epubFile, 'epubs');
    }

    // Review-before-publish: new uploads enter IN_REVIEW, not published.
    const bookId = createId();
    await db.insert(books).values({
      id: bookId,
      title,
      author,
      description: description || null,
      coverKey,
      epubKey,
      genre: JSON.stringify(parseGenre(genre)),
      language,
      subscriptionRequired,
      isPublished: false,
      publicationStatus: 'IN_REVIEW',
      publishedYear: year ?? null,
      publisher: user.name || 'Mitra Penerbit',
      publisherUserId: user.id,
      totalPages: pageCount ?? null,
    });

    // Create a submission record linked to the book for the review workflow.
    await db.insert(publisherSubmissions).values({
      id: createId(),
      publisherUserId: user.id,
      bookId,
      title,
      author,
      synopsis: description || null,
      genre: JSON.stringify(parseGenre(genre)),
      language,
      publishedYear: year ?? null,
      totalPages: pageCount ?? null,
      subscriptionRequired,
      epubKey,
      coverKey,
      status: 'IN_REVIEW',
      submittedAt: new Date().toISOString(),
    });

    await db.insert(notifications).values({
      id: createId(),
      userId: user.id,
      kind: 'submission',
      title: 'Judul masuk antrean review',
      body: `"${title}" telah dikirim ke tim kurasi untuk ditinjau.`,
      entityType: 'book',
      entityId: bookId,
    });
  } catch (err) {
    // Clean up any uploaded assets on failure.
    await Promise.all([deleteFromR2(coverKey), deleteFromR2(epubKey)]);
    throw err;
  }

  revalidatePath('/publisher/books');
  revalidatePath('/publisher/dashboard');
  redirect('/publisher/books');
}

export async function updatePublisherBook(bookId: string, formData: FormData) {
  const user = await getPublisherUser();
  const db = getDb();

  const book = await db.query.books.findFirst({
    where: and(eq(books.id, bookId), eq(books.publisherUserId, user.id)),
  });
  if (!book) {
    throw new Error('Buku tidak ditemukan atau tidak berhak mengakses.');
  }

  const title = (formData.get('title') as string)?.trim();
  const author = (formData.get('author') as string)?.trim();
  const description = (formData.get('description') as string)?.trim();
  const genre = (formData.get('genre') as string)?.trim();
  const language = (formData.get('language') as string) || 'ID';
  const subscriptionRequired = (formData.get('subscriptionRequired') as string) || 'FREE';
  const year = formData.get('year') ? Number(formData.get('year')) : null;
  const pageCount = formData.get('pageCount') ? Number(formData.get('pageCount')) : null;

  if (!title || !author) {
    throw new Error('Judul dan penulis wajib diisi.');
  }

  const coverFile = formData.get('cover') as File | null;
  const epubFile = formData.get('epub') as File | null;

  validateBookFile(coverFile, 'covers');
  validateBookFile(epubFile, 'epubs');

  let newCoverKey = book.coverKey;
  let newEpubKey = book.epubKey;

  try {
    if (coverFile && coverFile.size > 0) {
      newCoverKey = await uploadToR2(coverFile, 'covers');
    }
    if (epubFile && epubFile.size > 0) {
      newEpubKey = await uploadToR2(epubFile, 'epubs');
    }

    const contentChanged = newEpubKey !== book.epubKey;
    const reReview = shouldReReview(book.publicationStatus, contentChanged);
    await db
      .update(books)
      .set({
        title,
        author,
        description: description || null,
        coverKey: newCoverKey,
        epubKey: newEpubKey,
        genre: JSON.stringify(parseGenre(genre)),
        language,
        subscriptionRequired,
        publishedYear: year ?? null,
        totalPages: pageCount ?? null,
        isPublished: reReview ? false : book.isPublished,
        publicationStatus: reReview ? 'IN_REVIEW' : book.publicationStatus,
        updatedAt: new Date().toISOString(),
      })
      .where(and(eq(books.id, bookId), eq(books.publisherUserId, user.id)));

    // Clean up replaced assets.
    if (newCoverKey !== book.coverKey) await deleteFromR2(book.coverKey);
    if (newEpubKey !== book.epubKey) await deleteFromR2(book.epubKey);

    if (reReview) {
      const submittedAt = new Date().toISOString();
      await db.insert(publisherSubmissions).values({
        id: createId(), publisherUserId: user.id, bookId, title, author,
        synopsis: description || null, genre: JSON.stringify(parseGenre(genre)), language,
        publishedYear: year ?? null, totalPages: pageCount ?? null, subscriptionRequired,
        epubKey: newEpubKey, coverKey: newCoverKey, status: 'IN_REVIEW', submittedAt,
      });
      await db.insert(notifications).values({
        id: createId(), userId: user.id, kind: 'submission',
        title: 'Perubahan konten masuk antrean review ulang',
        body: `Perubahan pada "${title}" harus ditinjau sebelum diterbitkan kembali.`,
        entityType: 'book', entityId: bookId,
      });
    }
  } catch (err) {
    // Clean up newly uploaded assets on failure.
    if (newCoverKey !== book.coverKey) await deleteFromR2(newCoverKey);
    if (newEpubKey !== book.epubKey) await deleteFromR2(newEpubKey);
    throw err;
  }

  revalidatePath('/publisher/books');
  revalidatePath('/publisher/dashboard');
  revalidatePath('/admin/submissions');
  redirect('/publisher/books');
}

export async function deletePublisherBook(id: string) {
  const user = await getPublisherUser();
  const db = getDb();

  const book = await db.query.books.findFirst({
    where: and(eq(books.id, id), eq(books.publisherUserId, user.id)),
  });

  if (!book) {
    throw new Error('Book not found or unauthorized');
  }

  await Promise.all([
    deleteFromR2(book.coverKey),
    deleteFromR2(book.epubKey),
  ]);

  await db.delete(books).where(eq(books.id, id));

  revalidatePath('/publisher/books');
  revalidatePath('/publisher/dashboard');
}

export async function setBookPublication(bookId: string, action: 'publish' | 'unpublish') {
  const user = await getPublisherUser();
  const db = getDb();
  const book = await db.query.books.findFirst({
    where: and(eq(books.id, bookId), eq(books.publisherUserId, user.id)),
  });
  if (!book) throw new Error('Buku tidak ditemukan atau tidak berhak mengakses.');

  if (action === 'unpublish') {
    if (!canUnpublish(book.isPublished)) throw new Error('Buku ini sudah tidak aktif.');
    await db.update(books).set({ isPublished: false, publicationStatus: 'UNPUBLISHED', updatedAt: new Date().toISOString() }).where(and(eq(books.id, bookId), eq(books.publisherUserId, user.id)));
  } else {
    if (book.isPublished) throw new Error('Buku ini sudah aktif.');
    if (!canPublish(book.isPublished, book.publicationStatus)) throw new Error('Judul baru harus disetujui tim kurasi sebelum terbit.');
    await db.update(books).set({ isPublished: true, publicationStatus: 'PUBLISHED', updatedAt: new Date().toISOString() }).where(and(eq(books.id, bookId), eq(books.publisherUserId, user.id)));
  }

  revalidatePath('/publisher/books');
  revalidatePath('/publisher/dashboard');
}

export async function bulkSetBookPublication(bookIds: string[], action: 'publish' | 'unpublish') {
  const user = await getPublisherUser();
  const ids = [...new Set(bookIds)].filter(Boolean);
  if (ids.length === 0) return;
  const db = getDb();
  const ownedBooks = await db.query.books.findMany({ where: and(inArray(books.id, ids), eq(books.publisherUserId, user.id)) });
  const eligible = ownedBooks.filter((book) => action === 'publish' ? canPublish(book.isPublished, book.publicationStatus) : canUnpublish(book.isPublished));
  if (eligible.length > 0) {
    await db.update(books).set({
      isPublished: action === 'publish', publicationStatus: action === 'publish' ? 'PUBLISHED' : 'UNPUBLISHED', updatedAt: new Date().toISOString(),
    }).where(and(inArray(books.id, eligible.map((book) => book.id)), eq(books.publisherUserId, user.id)));
  }
  revalidatePath('/publisher/books');
  revalidatePath('/publisher/dashboard');
}

export async function bulkDeleteBooks(bookIds: string[]) {
  const user = await getPublisherUser();
  const ids = [...new Set(bookIds)].filter(Boolean);
  if (ids.length === 0) return;
  const db = getDb();
  const ownedBooks = await db.query.books.findMany({ where: and(inArray(books.id, ids), eq(books.publisherUserId, user.id)) });
  await Promise.all(ownedBooks.flatMap((book) => [deleteFromR2(book.coverKey), deleteFromR2(book.epubKey)]));
  if (ownedBooks.length > 0) await db.delete(books).where(and(inArray(books.id, ownedBooks.map((book) => book.id)), eq(books.publisherUserId, user.id)));
  revalidatePath('/publisher/books');
  revalidatePath('/publisher/dashboard');
}
