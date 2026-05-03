'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import type { LibrarySort } from '@/lib/library/catalog-params'
import { mergeLibraryPath } from '@/lib/library/catalog-params'

const SORT_OPTIONS: { value: LibrarySort; label: string }[] = [
  { value: 'popular', label: 'Terpopuler' },
  { value: 'newest', label: 'Terbaru' },
  { value: 'rating', label: 'Rating Tertinggi' },
]

export function LibrarySort({ sort }: { sort: LibrarySort }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ fontSize: 13, color: '#6B7A8D', fontWeight: 700 }}>Urutkan:</span>
      <select
        title="Urutkan"
        value={sort}
        aria-label="Urutkan daftar buku"
        onChange={(e) => {
          const path = mergeLibraryPath(searchParams, {
            sort: e.target.value as LibrarySort,
          })
          router.push(path)
        }}
        style={{
          height: 40,
          borderRadius: 12,
          border: '1.5px solid #E8ECF0',
          background: '#ffffff',
          paddingLeft: 16,
          paddingRight: 36,
          fontSize: 13,
          fontWeight: 700,
          color: '#1A2332',
          appearance: 'none',
          cursor: 'pointer',
          outline: 'none',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          fontFamily: 'inherit',
        }}
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}
