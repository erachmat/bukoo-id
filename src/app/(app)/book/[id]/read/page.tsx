import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ReaderShell from '@/components/reader/reader-shell'

export default async function ReaderPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const session = await auth()

  // Force auth check
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/book/${resolvedParams.id}/read`)
  }

  const [book, user] = await Promise.all([
    prisma.book.findUnique({
      where: { id: resolvedParams.id },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        readingProgress: {
          where: { bookId: resolvedParams.id }
        }
      }
    })
  ])

  if (!book || !book.isPublished) {
    notFound()
  }

  // Enforce Premium check at route level as last defense
  const userTier = user?.subscriptionTier || 'FREE'
  if (book.isPremium && userTier === 'FREE') {
    // Bounce back to the main info page with disabled actions
    redirect(`/book/${resolvedParams.id}`)
  }

  const initialLocation = user?.readingProgress?.[0]?.location || null

  return (
    <ReaderShell 
      book={{
        id: book.id,
        title: book.title,
        fileUrl: book.fileUrl,
        fileType: book.fileType, // EPUB | PDF
      }} 
      initialLocation={initialLocation}
    />
  )
}
