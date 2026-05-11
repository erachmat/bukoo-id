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
      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>Urutkan:</span>
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
          border: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(255,255,255,0.05)',
          paddingLeft: 16,
          paddingRight: 36,
          fontSize: 13,
          fontWeight: 700,
          color: '#FFFFFF',
          appearance: 'none',
          cursor: 'pointer',
          outline: 'none',
          fontFamily: 'inherit',
        }}
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value} style={{ background: '#0E1117', color: '#FFFFFF' }}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}
