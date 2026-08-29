'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { CatalogBook } from '@/lib/data/book-mapper'

export function BookCatalogCard({ book }: { book: CatalogBook }) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link href={`/book/${book.id}`} style={{ textDecoration: 'none', display: 'flex', height: '100%' }}>
      <div
        style={{
          background: 'transparent',
          borderRadius: 16,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.05)',
          boxShadow: hovered ? '0 20px 48px rgba(0,0,0,0.14)' : '0 2px 12px rgba(0,0,0,0.05)',
          transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          width: '100%',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Cover */}
        <div style={{ position: 'relative', paddingBottom: '142%', background: '#F0F2F5', overflow: 'hidden' }}>
          <img
            src={book.coverUrl}
            alt={book.title}
            loading="lazy"
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
              transform: hovered ? 'scale(1.07)' : 'scale(1)',
              transition: 'transform 0.6s ease',
            }}
          />

          {/* Language badge */}
          <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 2 }}>
            <span style={{
              fontSize: 10, fontWeight: 900, letterSpacing: '0.06em',
              background: 'rgba(0,24,26,0.72)', color: '#fff', padding: '4px 9px',
              borderRadius: 999, backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.15)',
            }}>{book.language}</span>
          </div>

          {/* Premium badge */}
          {book.isPremium && (
            <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 2 }}>
              <span style={{
                fontSize: 10, fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase',
                background: 'linear-gradient(135deg, #F59E0B, #EF6C00)', color: '#fff',
                padding: '4px 10px', borderRadius: 999, boxShadow: '0 2px 8px rgba(245,158,11,0.4)',
              }}>Premium</span>
            </div>
          )}

          {/* Hover overlay */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 1,
            background: 'linear-gradient(to top, rgba(0,24,26,0.75) 0%, transparent 55%)',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.3s ease',
            display: 'flex', alignItems: 'flex-end', padding: '16px',
          }}>
            <span style={{
              color: '#00C9A7', fontSize: 13, fontWeight: 800,
              transform: hovered ? 'translateY(0)' : 'translateY(8px)',
              transition: 'transform 0.3s ease',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span>Lihat Detail</span>
              <span style={{ fontSize: 16 }}>→</span>
            </span>
          </div>

          {/* Bottom gradient (always visible) */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%',
            background: 'linear-gradient(to top, rgba(0,0,0,0.35), transparent)',
            pointerEvents: 'none',
          }} />
        </div>

        {/* Info */}
        <div style={{ padding: '14px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{
            fontSize: 10, fontWeight: 800, color: '#00C9A7',
            letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6,
          }}>
            {book.genre[0]}
          </div>
          <div style={{
            fontSize: 15, fontWeight: 800, color: hovered ? '#00C9A7' : '#ffffff',
            lineHeight: 1.3, marginBottom: 6,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
            transition: 'color 0.2s ease',
          }}>
            {book.title}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginBottom: 12, fontStyle: 'italic' }}>
            {book.author}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ color: '#F59E0B', fontSize: 13 }}>★</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.8)' }}>4.8</span>
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
              {(book.readCount / 1000).toFixed(0)}k dibaca
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
