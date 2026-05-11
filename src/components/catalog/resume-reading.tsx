import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Play } from 'lucide-react'

export default async function ResumeReading() {
  const session = await auth()
  if (!session?.user?.id) return null

  // Get Top 5 most recently updated reading progress records
  const readingList = await prisma.readingProgress.findMany({
    where: {
      userId: session.user.id,
      progress: { gt: 0 }, // only those actually started
    },
    include: {
      book: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
    take: 5,
  })

  if (readingList.length === 0) return null

  return (
    <div style={{ marginBottom: 48 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1A2332', letterSpacing: '-0.01em', margin: 0 }}>
          Lanjutkan Membaca ⚡️
        </h2>
      </div>

      <div 
        className="resume-scroll-area"
        style={{ 
          display: 'flex', 
          gap: 20, 
          overflowX: 'auto', 
          paddingBottom: 16,
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {readingList.map(({ book, progress, id }) => (
          <Link 
            key={id} 
            href={`/book/${book.id}/read`}
            style={{ textDecoration: 'none', flexShrink: 0 }}
          >
            <div style={{ 
              display: 'flex', 
              background: '#ffffff', 
              borderRadius: 16, 
              border: '1px solid #EAEEF2', 
              padding: '14px', 
              width: 320,
              gap: 16,
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }} className="resume-card-item">
              {/* Book Cover Thumbnail */}
              <div style={{ 
                width: 64, 
                height: 92, 
                borderRadius: 8, 
                overflow: 'hidden', 
                flexShrink: 0,
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                backgroundColor: '#F0F2F5'
              }}>
                <img 
                  src={book.coverUrl || ''} 
                  alt={book.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Metadata Info */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ 
                  fontSize: 15, 
                  fontWeight: 800, 
                  color: '#1A2332', 
                  marginBottom: 4,
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {book.title}
                </div>
                <div style={{ fontSize: 12, color: '#8896A5', marginBottom: 12 }}>
                  {book.author}
                </div>
                
                {/* Small Progress Tracker */}
                <div style={{ marginTop: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, marginBottom: 6 }}>
                    <span style={{ color: '#00C9A7' }}>{Math.round(progress * 100)}% selesai</span>
                  </div>
                  <div style={{ height: 5, width: '100%', background: '#F0F2F5', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.round(progress * 100)}%`, backgroundColor: '#00C9A7', borderRadius: 3 }}></div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <style>{`
        .resume-scroll-area::-webkit-scrollbar {
          display: none;
        }
        .resume-card-item:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.08) !important;
          border-color: #00C9A7 !important;
        }
      `}</style>
    </div>
  )
}
