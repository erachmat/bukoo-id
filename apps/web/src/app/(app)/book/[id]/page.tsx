import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getDb } from '@/lib/db'
import { books as booksTable, users as usersTable, subscriptions, readingProgress } from '@bukoo/db'
import { eq, and } from 'drizzle-orm'
import { prismaBookToCatalogBook } from '@/lib/data/book-mapper'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Star, BookOpen, Globe, ArrowLeft, BookmarkPlus, Share2 } from 'lucide-react'

import { auth } from '@/lib/auth'
import { Lock } from 'lucide-react'
import { isBookAccessible } from '@bukoo/shared-types'

export default async function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const session = await auth()
  const db = getDb()

  const row = await db.query.books.findFirst({
    where: eq(booksTable.id, resolvedParams.id),
  })
  if (!row || !row.isPublished) notFound()

  // Fetch user model to double check subscription tier and reading progress
  let userProgress = null
  let userTier = 'FREE'

  if (session?.user?.id) {
    const [sub, prog] = await Promise.all([
      db.query.subscriptions.findFirst({
        where: eq(subscriptions.userId, session.user.id),
      }),
      db.query.readingProgress.findFirst({
        where: and(eq(readingProgress.userId, session.user.id), eq(readingProgress.bookId, resolvedParams.id)),
      }),
    ])

    if (sub && (sub.status === 'ACTIVE' || sub.status === 'TRIALING')) {
      userTier = sub.planId.replace('plan_', '').toUpperCase()
    }
    userProgress = prog || null
  }

  // Access Check
  const canRead = isBookAccessible(userTier, row.subscriptionRequired)

  const book = prismaBookToCatalogBook(row)
  const hasStarted = userProgress && userProgress.progressPercent > 0

  return (
    <div style={{ width: '100%', maxWidth: '1152px', margin: '0 auto', padding: '32px 16px', boxSizing: 'border-box' }}>
      <Link
        href="/library"
        style={{ display: 'inline-flex', alignItems: 'center', fontSize: '14px', fontWeight: '500', color: '#6B7280', textDecoration: 'none', marginBottom: '32px' }}
      >
        <ArrowLeft style={{ marginRight: '8px', height: '16px', width: '16px' }} />
        Kembali ke Katalog
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 320px) minmax(0, 1fr)', gap: '56px', alignItems: 'start' }}>
        {/* Cover */}
        <div style={{ width: '100%', maxWidth: '320px', position: 'sticky', top: '96px', alignSelf: 'flex-start' }}>
          <div style={{ position: 'relative', aspectRatio: '2/3', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #E5E7EB' }}>
            <img
              src={book.coverUrl || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop'}
              alt={book.title}
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            />
            {book.isPremium && (
              <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', borderRadius: '9999px', padding: '4px 10px', fontSize: '12px', fontWeight: '700', letterSpacing: '0.025em', color: '#ffffff', background: 'linear-gradient(to right, #EAB308, #D97706)', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                  PREMIUM
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
              {book.genre.map((g) => (
                <div key={g} style={{ display: 'inline-flex', alignItems: 'center', borderRadius: '9999px', border: '1px solid rgba(0, 24, 26, 0.2)', backgroundColor: 'rgba(0, 24, 26, 0.1)', padding: '2px 10px', fontSize: '12px', fontWeight: '600', color: '#00181A' }}>{g}</div>
              ))}
            </div>
            <h1 style={{ fontSize: '48px', fontWeight: '800', letterSpacing: '-0.025em', marginBottom: '8px', lineHeight: '1.1', color: '#111827' }}>{book.title}</h1>
            <p style={{ fontSize: '20px', color: '#6B7280' }}>Oleh <span style={{ color: '#111827', fontWeight: '500' }}>{book.author}</span></p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', fontSize: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Star style={{ marginRight: '8px', height: '20px', width: '20px', color: '#EAB308', fill: '#EAB308' }} />
              <span style={{ fontWeight: '700', fontSize: '16px', marginRight: '4px' }}>4.8</span>
              <span style={{ color: '#6B7280' }}>({(book.readCount / 1000).toFixed(1)}k ulasan)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', color: '#6B7280' }}>
              <BookOpen style={{ marginRight: '8px', height: '20px', width: '20px' }} />
              <span>{book.pageCount} halaman</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', color: '#6B7280' }}>
              <Globe style={{ marginRight: '8px', height: '20px', width: '20px' }} />
              <span>{book.language === 'ID' ? 'Indonesia' : 'Inggris'} ({book.year || '—'})</span>
            </div>
          </div>

          <div style={{ height: '1px', backgroundColor: '#E5E7EB', width: '100%' }} />

          {userProgress && userProgress.progressPercent > 0 && (
            <div style={{ padding: '16px', backgroundColor: '#F3F4F6', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#374151', margin: '0 0 6px 0' }}>Progres Membaca: {Math.round(userProgress.progressPercent)}%</p>
                <div style={{ height: '6px', background: '#D1D5DB', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.round(userProgress.progressPercent)}%`, backgroundColor: '#00C9A7' }}></div>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontWeight: '700', fontSize: '18px', margin: 0, color: '#111827' }}>Sinopsis</h3>
            <p style={{ maxWidth: '65ch', color: '#6B7280', lineHeight: '1.625', margin: 0 }}>
              {book.description || '—'}
            </p>
          </div>

          <div style={{ paddingTop: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {!canRead ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '360px' }}>
                <button
                  disabled
                  style={{ display: 'inline-flex', height: '56px', alignItems: 'center', justifyContent: 'center', borderRadius: '9999px', backgroundColor: '#9CA3AF', padding: '0 40px', fontSize: '16px', fontWeight: '700', color: '#ffffff', border: 'none', cursor: 'not-allowed', opacity: 0.8 }}
                >
                  <Lock style={{ height: '18px', width: '18px', marginRight: '8px' }} />
                  Khusus Premium
                </button>
                <p style={{ fontSize: '13px', color: '#EF4444', fontWeight: '500', margin: 0 }}>Berlangganan PRO untuk membuka buku ini.</p>
              </div>
            ) : (
              <Link
                href={`/book/${resolvedParams.id}/read`}
                style={{ display: 'inline-flex', height: '56px', alignItems: 'center', justifyContent: 'center', borderRadius: '9999px', backgroundColor: '#00181A', padding: '0 40px', fontSize: '16px', fontWeight: '700', color: '#ffffff', textDecoration: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
              >
                {hasStarted ? 'Lanjutkan Membaca' : 'Mulai Baca Sekarang'}
              </Link>
            )}

            {canRead && (
              <div style={{ display: 'flex', gap: '16px' }}>
                <button type="button" style={{ height: '56px', width: '56px', borderRadius: '9999px', border: '1px solid #D1D5DB', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <BookmarkPlus style={{ height: '20px', width: '20px', color: '#111827' }} />
                </button>
                <button type="button" style={{ height: '56px', width: '56px', borderRadius: '9999px', border: '1px solid #D1D5DB', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <Share2 style={{ height: '20px', width: '20px', color: '#111827' }} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 1024px) {
          div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          div[style*="position: sticky"] {
            position: relative !important;
            top: 0 !important;
            max-width: 240px !important;
            margin: 0 auto !important;
          }
        }
      `}</style>
    </div>
  )
}
