'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { LIBRARY_GENRES, mergeLibraryPath } from '@/lib/library/catalog-params'

const genreDisplayMap: Record<string, string> = {
  'Semua': '🔥 Trending',
  'Fiksi': 'Novel 🇮🇩',
  'Non-Fiksi': 'Non-Fiksi 🧠',
  'Sastra': 'Sastra 🖋️',
  'Pengembangan Diri': 'Self-Dev 🌱',
  'Bisnis': 'Bisnis 💼',
  'Sejarah': 'Sejarah 🏛️',
  'Roman': 'Roman 💖',
  'Klasik': 'Klasik 📜',
}

export function LibraryGenreChips({ activeGenre }: { activeGenre: string }) {
  const searchParams = useSearchParams()

  return (
    <div style={{ display: 'flex', gap: 10, marginTop: 24, overflowX: 'auto', flexWrap: 'nowrap', paddingBottom: 4, scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      <style>{`.lib-genre-chips::-webkit-scrollbar { display: none; }`}</style>
      {LIBRARY_GENRES.map((g) => {
        const selected =
          g === 'Semua'
            ? activeGenre === 'Semua'
            : activeGenre.toLowerCase() === g.toLowerCase()

        const href = mergeLibraryPath(searchParams, { genre: g })
        const display = genreDisplayMap[g] || g
        
        let bg = selected ? '#00C9A7' : 'rgba(255,255,255,0.05)'
        let color = selected ? '#00181A' : 'rgba(255,255,255,0.75)'
        let border = selected ? 'none' : '1px solid rgba(255,255,255,0.1)'
        
        // Special styling for 'Semua' / Trending when active
        if (selected && g === 'Semua') {
          bg = 'linear-gradient(135deg, #F59E0B, #FBBF24)'
        }

        return (
          <Link
            key={g}
            href={href}
            style={{
              padding: '7px 18px',
              borderRadius: 999,
              background: bg,
              color: color,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              border: border,
              transition: 'all 0.2s',
              letterSpacing: '0.01em',
              textDecoration: 'none',
              flexShrink: 0,
              whiteSpace: 'nowrap',
            }}
          >
            {display}
          </Link>
        )
      })}
    </div>
  )
}
