'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getDb } from '@/lib/db';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { books } from '@bukoo/db';
import { eq } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

// ---------------------------------------------------------------------------
// R2 file upload helpers
// ---------------------------------------------------------------------------

/**
 * Uploads a file to Cloudflare R2 via the BUKOO_STORAGE binding.
 * Returns the R2 object key (e.g. "covers/abc123.jpg") for storage in D1.
 * The public URL is constructed from the R2 public bucket domain.
 */
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
// Admin book actions
// ---------------------------------------------------------------------------

export async function createBook(formData: FormData) {
  const db = getDb();
  const title = formData.get('title') as string;
  const author = formData.get('author') as string;
  const description = formData.get('description') as string;
  const genre = formData.get('genre') as string;
  const language = (formData.get('language') as string) || 'ID';
  const subscriptionRequired = (formData.get('subscriptionRequired') as string) || 'FREE';
  const year = formData.get('year') ? Number(formData.get('year')) : null;
  const publisher = (formData.get('publisher') as string) || null;
  const pageCount = formData.get('pageCount') ? Number(formData.get('pageCount')) : null;

  const coverFile = formData.get('cover') as File | null;
  const epubFile = formData.get('epub') as File | null;

  let coverKey: string | null = null;
  let epubKey: string | null = null;

  if (coverFile && coverFile.size > 0) {
    coverKey = await uploadToR2(coverFile, 'covers');
  }
  if (epubFile && epubFile.size > 0) {
    epubKey = await uploadToR2(epubFile, 'epubs');
  }

  await db.insert(books).values({
    id: createId(),
    title,
    author,
    description: description || null,
    coverKey,
    epubKey,
    genre: JSON.stringify(genre ? [genre] : []),
    language,
    subscriptionRequired,
    isPublished: true,
    publishedYear: year ?? null,
    publisher: publisher || null,
    totalPages: pageCount ?? null,
  });

  revalidatePath('/admin/books');
  redirect('/admin/books');
}

export async function updateBook(id: string, formData: FormData) {
  const db = getDb();
  const existing = await db.query.books.findFirst({ where: eq(books.id, id) });
  if (!existing) redirect('/admin/books');

  const title = formData.get('title') as string;
  const author = formData.get('author') as string;
  const description = formData.get('description') as string;
  const genre = formData.get('genre') as string;
  const language = (formData.get('language') as string) || 'ID';
  const subscriptionRequired = (formData.get('subscriptionRequired') as string) || 'FREE';
  const year = formData.get('year') ? Number(formData.get('year')) : null;
  const publisher = (formData.get('publisher') as string) || null;
  const pageCount = formData.get('pageCount') ? Number(formData.get('pageCount')) : null;

  const coverFile = formData.get('cover') as File | null;
  const epubFile = formData.get('epub') as File | null;

  let coverKey = existing.coverKey;
  let epubKey = existing.epubKey;

  if (coverFile && coverFile.size > 0) {
    await deleteFromR2(existing.coverKey);
    coverKey = await uploadToR2(coverFile, 'covers');
  }
  if (epubFile && epubFile.size > 0) {
    await deleteFromR2(existing.epubKey);
    epubKey = await uploadToR2(epubFile, 'epubs');
  }

  await db.update(books).set({
    title,
    author,
    description: description || null,
    coverKey,
    epubKey,
    genre: JSON.stringify(genre ? [genre] : []),
    language,
    subscriptionRequired,
    publishedYear: year ?? null,
    publisher: publisher || null,
    totalPages: pageCount ?? null,
    updatedAt: new Date().toISOString(),
  }).where(eq(books.id, id));

  revalidatePath('/admin/books');
  redirect('/admin/books');
}

export async function deleteBook(id: string) {
  const db = getDb();
  const book = await db.query.books.findFirst({ where: eq(books.id, id) });
  if (book) {
    await Promise.all([
      deleteFromR2(book.coverKey),
      deleteFromR2(book.epubKey),
    ]);
    await db.delete(books).where(eq(books.id, id));
  }
  revalidatePath('/admin/books');
}
