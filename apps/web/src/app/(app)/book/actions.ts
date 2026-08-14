'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { readingProgress } from '@bukoo/db';
import { eq, and } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

export async function updateReadingProgress(
  bookId: string,
  location: string | null,
  progress: number, // 0.0 - 1.0
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Not authenticated');
  }

  const userId = session.user.id;
  const progressPercent = progress * 100;
  const now = new Date().toISOString();

  const existing = await db.query.readingProgress.findFirst({
    where: and(eq(readingProgress.userId, userId), eq(readingProgress.bookId, bookId)),
  });

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

  return { success: true };
}
