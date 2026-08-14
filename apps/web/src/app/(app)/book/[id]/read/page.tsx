import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { books as booksTable, subscriptions, readingProgress } from '@bukoo/db'
import { eq, and } from 'drizzle-orm'
import ReaderShell from '@/components/reader/reader-shell'
import { isBookAccessible } from '@bukoo/shared-types'

export default async function ReaderPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const session = await auth()

  // Force auth check
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/book/${resolvedParams.id}/read`)
  }

  const [book, sub, userProgress] = await Promise.all([
    db.query.books.findFirst({
      where: eq(booksTable.id, resolvedParams.id),
    }),
    db.query.subscriptions.findFirst({
      where: eq(subscriptions.userId, session.user.id),
    }),
    db.query.readingProgress.findFirst({
      where: and(eq(readingProgress.userId, session.user.id), eq(readingProgress.bookId, resolvedParams.id)),
    }),
  ])

  if (!book || !book.isPublished) {
    notFound()
  }

  // Enforce Premium check at route level as last defense
  let userTier = 'FREE'
  if (sub && (sub.status === 'ACTIVE' || sub.status === 'TRIALING')) {
    userTier = sub.planId.replace('plan_', '').toUpperCase()
  }

  if (!isBookAccessible(userTier, book.subscriptionRequired)) {
    // Bounce back to the main info page with disabled actions
    redirect(`/book/${resolvedParams.id}`)
  }

  const initialLocation = userProgress?.cfiPosition || null

  return (
    <ReaderShell 
      book={{
        id: book.id,
        title: book.title,
        fileUrl: book.epubKey ? `/api/books/${book.id}/download` : '#',
        fileType: 'EPUB',
      }} 
      initialLocation={initialLocation}
    />
  )
}
