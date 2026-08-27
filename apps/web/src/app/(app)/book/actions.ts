'use server';

import { auth } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { readingProgress, recordPublisherReadingMetric } from '@bukoo/db';
import { eq, and } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { headers } from 'next/headers';

export async function updateReadingProgress(
  bookId: string,
  location: string | null,
  progress: number, // 0.0 - 1.0
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Not authenticated');
  }

  const db = getDb();
  const userId = session.user.id;
  const progressPercent = progress * 100;
  const now = new Date().toISOString();

  const existing = await db.query.readingProgress.findFirst({
    where: and(eq(readingProgress.userId, userId), eq(readingProgress.bookId, bookId)),
  });

  // No reading-time delta from the web reader (progress-only), so no seconds to add.
  const isCompletion =
    progressPercent >= 100 && (existing?.progressPercent ?? 0) < 100;
  const isStart = !existing && progressPercent > 0;

  if (existing) {
    await db
      .update(readingProgress)
      .set({
        cfiPosition: location,
        progressPercent,
        updatedAt: now,
        lastReadAt: now,
      })
      .where(and(eq(readingProgress.userId, userId), eq(readingProgress.bookId, bookId)));
  } else {
    await db.insert(readingProgress).values({
      id: createId(),
      userId,
      bookId,
      cfiPosition: location,
      progressPercent,
      lastReadAt: now,
    });
  }

  // Aggregate publisher analytics idempotently.
  const countryCode = (await headers()).get('cf-ipcountry') ?? null;
  await recordPublisherReadingMetric(db, {
    userId,
    bookId,
    progressPercent,
    isStart,
    isCompletion,
    countryCode,
  });

  return { success: true };
}
