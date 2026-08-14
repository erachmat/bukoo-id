'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
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

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID!;
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME ?? 'bukoo-assets';
  const token = process.env.CLOUDFLARE_R2_TOKEN!;

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucketName}/objects/${key}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': file.type || 'application/octet-stream',
      },
      body: file.stream(),
      // @ts-expect-error — required for streaming in server actions
      duplex: 'half',
    },
  );

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`R2 upload failed (${response.status}): ${body}`);
  }

  return key;
}

async function deleteFromR2(key: string | null | undefined) {
  if (!key) return;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID!;
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME ?? 'bukoo-assets';
  const token = process.env.CLOUDFLARE_R2_TOKEN!;
  await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucketName}/objects/${key}`,
    { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } },
  ).catch(() => {});
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
