'use server';

import { revalidatePath } from 'next/cache';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { books, notifications, publisherSubmissions } from '@bukoo/db';
import { createId } from '@paralleldrive/cuid2';
import { and, eq, inArray } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { getPublisherUser } from '@/lib/publisher-auth';
import { archivedPublicationStatus, canPublish, canSubmitForReview, canUnpublish, restoredPublicationState, shouldReReview } from '@/lib/book-publication';
import { catalogFingerprint, MAX_PUBLISHER_FILE_BYTES, normalizeBookIsbn, parsePublisherBookFields, reviewRequirements } from '@/lib/publisher-book-input';

type PublisherBook = typeof books.$inferSelect;

function refreshCatalog() {
  revalidatePath('/publisher/books');
  revalidatePath('/publisher/dashboard');
  revalidatePath('/admin/submissions');
}

async function fileUpload(file: File | null, folder: 'covers' | 'epubs') {
  if (!file || !file.size) return null;
  if (file.size > MAX_PUBLISHER_FILE_BYTES) throw new Error('Ukuran setiap file maksimal 50 MB.');
  const extension = file.name.split('.').pop()?.toLowerCase();
  const signature = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const starts = (...bytes: number[]) => bytes.every((byte, index) => signature[index] === byte);
  let contentType: string;
  if (folder === 'epubs') {
    if (extension === 'epub' && starts(0x50, 0x4b, 0x03, 0x04)) contentType = 'application/epub+zip';
    else if (extension === 'pdf' && starts(0x25, 0x50, 0x44, 0x46, 0x2d)) contentType = 'application/pdf';
    else throw new Error('File buku harus EPUB atau PDF yang valid.');
  } else if ((extension === 'jpg' || extension === 'jpeg') && starts(0xff, 0xd8, 0xff)) contentType = 'image/jpeg';
  else if (extension === 'png' && starts(0x89, 0x50, 0x4e, 0x47)) contentType = 'image/png';
  else if (extension === 'webp' && String.fromCharCode(...signature.slice(0, 4)) === 'RIFF' && String.fromCharCode(...signature.slice(8, 12)) === 'WEBP') contentType = 'image/webp';
  else throw new Error('Cover harus JPG, PNG, atau WebP yang valid.');
  const key = `${folder}/${createId()}.${extension}`;
  const { env } = getCloudflareContext();
  await env.BUKOO_STORAGE.put(key, file, { httpMetadata: { contentType } });
  return key;
}

async function removeNewFile(key: string | null) {
  if (key) {
    const { env } = getCloudflareContext();
    await env.BUKOO_STORAGE.delete(key).catch(() => {});
  }
}

async function ownedBook(id: string, userId: string) {
  const book = await getDb().query.books.findFirst({ where: and(eq(books.id, id), eq(books.publisherUserId, userId)) });
  if (!book) throw new Error('Buku tidak ditemukan atau tidak berhak diakses.');
  return book;
}

async function assertUnique(input: ReturnType<typeof parsePublisherBookFields>, userId: string, exceptId?: string) {
  const db = getDb();
  const all = await db.query.books.findMany();
  const name = catalogFingerprint(input.title, input.author);
  for (const book of all) {
    if (book.id === exceptId) continue;
    const existingIsbn = book.isbn ? normalizeBookIsbn(book.isbn) : null;
    if (input.isbn && existingIsbn === input.isbn) throw new Error('ISBN ini sudah dipakai buku lain.');
    if (book.publisherUserId === userId && catalogFingerprint(book.title, book.author) === name && (!input.isbn || !existingIsbn)) {
      throw new Error('Judul dan penulis ini sudah ada di katalog Anda. Gunakan edisi dengan ISBN berbeda bila memang edisi baru.');
    }
  }
}

function submissionSnapshot(book: PublisherBook) {
  return {
    title: book.title, author: book.author, isbn: book.isbn, synopsis: book.description,
    genre: book.genre, language: book.language, publishedYear: book.publishedYear,
    totalPages: book.totalPages, subscriptionRequired: book.subscriptionRequired,
    epubKey: book.epubKey, coverKey: book.coverKey,
  };
}

function reviewNotification(userId: string, book: PublisherBook) {
  return {
    id: createId(), userId, kind: 'submission', title: 'Judul masuk antrean review',
    body: `"${book.title}" telah dikirim ke tim kurasi untuk ditinjau.`,
    entityType: 'book', entityId: book.id,
  };
}

/** Save a new or existing title. New titles remain drafts until explicitly submitted. */
export async function savePublisherBook(bookId: string | null, formData: FormData): Promise<{ bookId: string; sentForReview: boolean }> {
  const user = await getPublisherUser();
  const db = getDb();
  const oldBook = bookId ? await ownedBook(bookId, user.id) : null;
  const input = parsePublisherBookFields(formData);
  await assertUnique(input, user.id, bookId ?? undefined);
  const coverFile = formData.get('cover');
  const contentFile = formData.get('epub');
  const cover = coverFile instanceof File ? coverFile : null;
  const content = contentFile instanceof File ? contentFile : null;
  // Validate both before uploading either file.
  for (const file of [cover, content]) if (file?.size && file.size > MAX_PUBLISHER_FILE_BYTES) throw new Error('Ukuran setiap file maksimal 50 MB.');
  let newCover: string | null = null;
  let newContent: string | null = null;
  try {
    newCover = await fileUpload(cover, 'covers');
    newContent = await fileUpload(content, 'epubs');
    const now = new Date().toISOString();
    const nextBook: PublisherBook = {
      ...(oldBook ?? { id: createId(), createdAt: now, updatedAt: now, readCount: 0, ratingAverage: 0, ratingCount: 0, readTimeMinutes: 0, tags: '[]', featured: false, featuredAt: null, isAvailableOffline: false, synopsis: null, publisher: user.name || 'Mitra Penerbit', publisherUserId: user.id, isPublished: false, publicationStatus: 'DRAFT', archivedAt: null }),
      title: input.title, author: input.author, isbn: input.isbn, catalogFingerprint: input.catalogFingerprint,
      description: input.description || null, genre: JSON.stringify(input.genre ? [input.genre] : []),
      language: input.language, subscriptionRequired: input.subscriptionRequired,
      publishedYear: input.year, totalPages: input.pageCount,
      coverKey: newCover ?? oldBook?.coverKey ?? null, epubKey: newContent ?? oldBook?.epubKey ?? null,
      updatedAt: now,
    };
    const reReview = !!oldBook && !oldBook.archivedAt && shouldReReview(oldBook.publicationStatus, !!newContent);
    if (reReview) {
      nextBook.publicationStatus = 'IN_REVIEW';
      nextBook.isPublished = false;
      if (reviewRequirements(nextBook).length) throw new Error('Lengkapi sinopsis, kategori, cover, dan file buku sebelum review ulang.');
    }
    if (!oldBook) {
      await db.insert(books).values(nextBook);
    } else {
      const changes = {
        title: nextBook.title, author: nextBook.author, isbn: nextBook.isbn, catalogFingerprint: nextBook.catalogFingerprint,
        description: nextBook.description, genre: nextBook.genre, language: nextBook.language,
        subscriptionRequired: nextBook.subscriptionRequired, publishedYear: nextBook.publishedYear,
        totalPages: nextBook.totalPages, coverKey: nextBook.coverKey, epubKey: nextBook.epubKey,
        publicationStatus: nextBook.publicationStatus, isPublished: nextBook.isPublished, updatedAt: now,
      };
      if (reReview) {
        await db.batch([
          db.update(books).set(changes).where(and(eq(books.id, oldBook.id), eq(books.publisherUserId, user.id))),
          db.insert(publisherSubmissions).values({ id: createId(), publisherUserId: user.id, bookId: oldBook.id, ...submissionSnapshot(nextBook), status: 'IN_REVIEW', submittedAt: now }),
          db.insert(notifications).values(reviewNotification(user.id, nextBook)),
        ]);
      } else {
        const active = oldBook.publicationStatus === 'IN_REVIEW'
          ? await db.query.publisherSubmissions.findFirst({ where: and(eq(publisherSubmissions.bookId, oldBook.id), eq(publisherSubmissions.status, 'IN_REVIEW')) }) : null;
        if (active) await db.batch([
          db.update(books).set(changes).where(and(eq(books.id, oldBook.id), eq(books.publisherUserId, user.id))),
          db.update(publisherSubmissions).set({ ...submissionSnapshot(nextBook), updatedAt: now }).where(eq(publisherSubmissions.id, active.id)),
        ]);
        else await db.update(books).set(changes).where(and(eq(books.id, oldBook.id), eq(books.publisherUserId, user.id)));
      }
    }
    refreshCatalog();
    return { bookId: nextBook.id, sentForReview: reReview };
  } catch (error) {
    await Promise.all([removeNewFile(newCover), removeNewFile(newContent)]);
    if (error instanceof Error && /UNIQUE constraint failed/i.test(error.message)) throw new Error('Buku dengan ISBN atau judul dan penulis ini sudah ada.');
    throw error;
  }
}

export async function submitPublisherBookForReview(bookId: string, rightsConfirmed: boolean) {
  if (!rightsConfirmed) throw new Error('Konfirmasi hak distribusi sebelum mengirim buku.');
  const user = await getPublisherUser();
  const db = getDb();
  const book = await ownedBook(bookId, user.id);
  if (book.archivedAt) throw new Error('Pulihkan buku dari arsip sebelum dikirim untuk review.');
  if (!canSubmitForReview(book.publicationStatus, book.archivedAt)) throw new Error('Buku ini sudah pernah dikirim untuk review.');
  const missing = reviewRequirements(book);
  if (missing.length) throw new Error(`Lengkapi ${missing.join(', ')} sebelum mengirim untuk review.`);
  const active = await db.query.publisherSubmissions.findFirst({ where: and(eq(publisherSubmissions.bookId, book.id), inArray(publisherSubmissions.status, ['SUBMITTED', 'IN_REVIEW'])) });
  if (active) throw new Error('Buku ini sudah ada dalam antrean review.');
  const now = new Date().toISOString();
  await db.batch([
    db.update(books).set({ publicationStatus: 'IN_REVIEW', isPublished: false, updatedAt: now }).where(and(eq(books.id, book.id), eq(books.publisherUserId, user.id))),
    db.insert(publisherSubmissions).values({ id: createId(), publisherUserId: user.id, bookId: book.id, ...submissionSnapshot(book), status: 'IN_REVIEW', submittedAt: now }),
    db.insert(notifications).values(reviewNotification(user.id, book)),
  ]);
  refreshCatalog();
}

export async function setBookPublication(bookId: string, action: 'publish' | 'unpublish') {
  const user = await getPublisherUser();
  const book = await ownedBook(bookId, user.id);
  if (book.archivedAt) throw new Error('Pulihkan buku dari arsip lebih dulu.');
  if (action === 'publish' && !canPublish(book.isPublished, book.publicationStatus)) throw new Error('Buku harus disetujui kurasi sebelum diterbitkan.');
  if (action === 'unpublish' && !canUnpublish(book.isPublished)) throw new Error('Buku ini sudah tidak aktif.');
  await getDb().update(books).set({ isPublished: action === 'publish', publicationStatus: action === 'publish' ? 'PUBLISHED' : 'UNPUBLISHED', updatedAt: new Date().toISOString() }).where(and(eq(books.id, bookId), eq(books.publisherUserId, user.id)));
  refreshCatalog();
}

export async function bulkSetBookPublication(bookIds: string[], action: 'publish' | 'unpublish') {
  const user = await getPublisherUser();
  const ids = [...new Set(bookIds)].filter(Boolean);
  if (!ids.length) return { processed: 0, skipped: 0 };
  const db = getDb();
  const owned = await db.query.books.findMany({ where: and(inArray(books.id, ids), eq(books.publisherUserId, user.id)) });
  const eligible = owned.filter((book) => !book.archivedAt && (action === 'publish' ? canPublish(book.isPublished, book.publicationStatus) : canUnpublish(book.isPublished)));
  if (eligible.length) await db.update(books).set({ isPublished: action === 'publish', publicationStatus: action === 'publish' ? 'PUBLISHED' : 'UNPUBLISHED', updatedAt: new Date().toISOString() }).where(and(inArray(books.id, eligible.map((book) => book.id)), eq(books.publisherUserId, user.id)));
  refreshCatalog();
  return { processed: eligible.length, skipped: ids.length - eligible.length };
}

export async function bulkArchivePublisherBooks(bookIds: string[]) {
  const user = await getPublisherUser();
  const ids = [...new Set(bookIds)].filter(Boolean);
  if (!ids.length) return { processed: 0, skipped: 0 };
  const db = getDb();
  const owned = await db.query.books.findMany({ where: and(inArray(books.id, ids), eq(books.publisherUserId, user.id)) });
  const eligible = owned.filter((book) => !book.archivedAt);
  const now = new Date().toISOString();
  if (eligible.length) {
    const statements = eligible.flatMap((book) => [
      db.update(books).set({ archivedAt: now, isPublished: false, publicationStatus: archivedPublicationStatus(book.publicationStatus), updatedAt: now }).where(and(eq(books.id, book.id), eq(books.publisherUserId, user.id))),
      db.update(publisherSubmissions).set({ status: 'WITHDRAWN', updatedAt: now }).where(and(eq(publisherSubmissions.bookId, book.id), inArray(publisherSubmissions.status, ['SUBMITTED', 'IN_REVIEW']))),
    ]);
    await db.batch(statements as [typeof statements[number], ...typeof statements]);
  }
  refreshCatalog();
  return { processed: eligible.length, skipped: ids.length - eligible.length };
}

export async function archivePublisherBook(id: string) { return bulkArchivePublisherBooks([id]); }

export async function restorePublisherBook(id: string) {
  const user = await getPublisherUser();
  const book = await ownedBook(id, user.id);
  if (!book.archivedAt) throw new Error('Buku ini tidak ada di arsip.');
  await getDb().update(books).set({ archivedAt: null, ...restoredPublicationState(book.publicationStatus), updatedAt: new Date().toISOString() }).where(and(eq(books.id, id), eq(books.publisherUserId, user.id)));
  refreshCatalog();
}
