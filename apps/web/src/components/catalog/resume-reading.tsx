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
      progressPercent: { gt: 0 }, // only those actually started
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
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em', margin: 0 }}>
          Lanjutkan Membaca ⚡️
        </h2>
      </div>

      <div 
        className="resume-scroll-area"
        style={{ 
          display: 'flex', 
          gap: 20, 
          overflowX: 'auto', 
          paddingTop: 12, // added to prevent clipping hover translate animation
          paddingBottom: 16,
          paddingLeft: 2, // to avoid clipping shadows
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {readingList.map(({ book, progressPercent, id }) => (
          <Link 
            key={id} 
            href={`/book/${book.id}/read`}
            style={{ textDecoration: 'none', flexShrink: 0 }}
          >
            <div style={{ 
              position: 'relative',
              background: 'linear-gradient(135deg, #15456b 0%, #0a1a21 100%)', 
              borderRadius: 24, 
              border: '1px solid rgba(255,255,255,0.08)', 
              padding: '24px', 
              width: 340,
              height: 170,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
              transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
              cursor: 'pointer',
              overflow: 'hidden'
            }} className="resume-card-item">
              
              {/* Ambient Light Effect Background */}
              <div style={{
                position: 'absolute', top: '-50%', right: '-20%', width: '70%', height: '100%', 
                background: 'radial-gradient(circle, rgba(0,201,167,0.15) 0%, transparent 70%)',
                pointerEvents: 'none', zIndex: 0
              }}></div>

              {/* Badge */}
              <div style={{ 
                background: '#F59E0B', 
                color: '#00181A', 
                display: 'inline-flex', 
                padding: '6px 12px', 
                borderRadius: 8, 
                fontSize: 11, 
                fontWeight: 800, 
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                width: 'fit-content',
                marginBottom: 16,
                zIndex: 1
              }}>
                Sedang Dibaca
              </div>

              {/* Content */}
              <div style={{ flex: 1, zIndex: 1 }}>
                <h3 style={{ 
                  fontSize: '22px', 
                  fontWeight: 900, 
                  color: '#FFFFFF', 
                  margin: '0 0 4px 0',
                  lineHeight: 1.2,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {book.title}
                </h3>
                <p style={{ 
                  fontSize: '14px', 
                  color: 'rgba(255,255,255,0.6)', 
                  margin: 0,
                  fontWeight: 500,
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {book.author}
                </p>
              </div>

              {/* Footer layout */}
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 'auto', zIndex: 1 }}>
                {/* Progress and Bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                  <div style={{ height: 6, flex: 1, background: 'rgba(255,255,255,0.15)', borderRadius: 4, overflow: 'hidden', maxWidth: '100px' }}>
                    <div style={{ height: '100%', width: `${Math.round(progressPercent)}%`, backgroundColor: '#F59E0B', borderRadius: 4 }}></div>
                  </div>
                  <span style={{ color: '#F59E0B', fontSize: 14, fontWeight: 800 }}>
                    {Math.round(progressPercent)}%
                  </span>
                </div>

                {/* Call to action button style */}
                <div style={{
                  background: '#F59E0B',
                  color: '#00181A',
                  padding: '10px 20px',
                  borderRadius: 14,
                  fontWeight: 800,
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                }}>
                  Lanjut <span style={{ fontSize: 16, lineHeight: 0 }}>→</span>
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
          transform: translateY(-6px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0,0,0,0.35) !important;
          border-color: rgba(255, 255, 255, 0.2) !important;
        }
      `}</style>
    </div>
  )
}
