'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { LIBRARY_GENRES, mergeLibraryPath } from '@/lib/library/catalog-params'

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

        return (
          <Link
            key={g}
            href={href}
            style={{
              padding: '7px 18px',
              borderRadius: 999,
              background: selected ? '#00C9A7' : 'rgba(255,255,255,0.1)',
              color: selected ? '#00181A' : 'rgba(255,255,255,0.75)',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              border: selected ? 'none' : '1.5px solid rgba(255,255,255,0.15)',
              transition: 'all 0.2s',
              letterSpacing: '0.01em',
              textDecoration: 'none',
              flexShrink: 0,
              whiteSpace: 'nowrap',
            }}
          >
            {g}
          </Link>
        )
      })}
    </div>
  )
}
