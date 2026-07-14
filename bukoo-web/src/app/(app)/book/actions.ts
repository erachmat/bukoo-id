'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function updateReadingProgress(
  bookId: string,
  location: string | null,
  progress: number, // 0.0 - 1.0
) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Not authenticated')
  }

  const userId = session.user.id

  await prisma.readingProgress.upsert({
    where: {
      userId_bookId: {
        userId,
        bookId,
      },
    },
    update: {
      cfiPosition: location,
      progressPercent: progress * 100,
      updatedAt: new Date(),
    },
    create: {
      userId,
      bookId,
      cfiPosition: location,
      progressPercent: progress * 100,
    },
  })

  // Only revalidate cache optionally to prevent waterfall thrashing if called frequently
  // revalidatePath('/library')
  
  return { success: true }
}
