'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getDb } from '@/lib/db';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { books } from '@bukoo/db';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { createId } from '@paralleldrive/cuid2';

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

async function getPublisherUser() {
  const session = await auth();
  const user = session?.user;
  if (!user || (user as { role?: string }).role !== 'PUBLISHER') {
    throw new Error('Unauthorized');
  }
  return user as { id: string; name?: string | null; role: string };
}

// ---------------------------------------------------------------------------
// Publisher book actions
// ---------------------------------------------------------------------------

export async function createPublisherBook(formData: FormData) {
  const user = await getPublisherUser();
  const db = getDb();

  const title = formData.get('title') as string;
  const author = formData.get('author') as string;
  const description = formData.get('description') as string;
  const genre = formData.get('genre') as string;
  const language = (formData.get('language') as string) || 'ID';
  const subscriptionRequired = (formData.get('subscriptionRequired') as string) || 'FREE';
  const year = formData.get('year') ? Number(formData.get('year')) : null;
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
    publisher: user.name || 'Mitra Penerbit',
    publisherUserId: user.id,
    totalPages: pageCount ?? null,
  });

  revalidatePath('/publisher/books');
  revalidatePath('/publisher/dashboard');
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
