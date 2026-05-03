'use client'

import { Search } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export function LibrarySearch({ initialQuery }: { initialQuery: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(initialQuery)

  useEffect(() => {
    const urlQ = searchParams.get('q') ?? ''
    const id = window.setTimeout(() => {
      setValue(urlQ)
    }, 0)
    return () => window.clearTimeout(id)
  }, [searchParams])

  useEffect(() => {
    const q = value.trim()
    const current = (searchParams.get('q') ?? '').trim()
    if (q === current) return

    const handle = window.setTimeout(() => {
      const next = new URLSearchParams(searchParams.toString())
      if (q) next.set('q', q)
      else next.delete('q')
      const qs = next.toString()
      router.replace(qs ? `/library?${qs}` : '/library')
    }, 300)

    return () => window.clearTimeout(handle)
  }, [value, router, searchParams])

  return (
    <div style={{ position: 'relative', maxWidth: 520, marginTop: 28 }}>
      <label htmlFor="library-catalog-search" className="sr-only">
        Cari judul, penulis, genre
      </label>
      <Search
        aria-hidden
        style={{
          position: 'absolute',
          left: 18,
          top: '50%',
          transform: 'translateY(-50%)',
          height: 20,
          width: 20,
          color: 'rgba(255,255,255,0.85)',
          pointerEvents: 'none',
        }}
      />
      <input
        id="library-catalog-search"
        type="search"
        placeholder="Cari judul, penulis, genre..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoComplete="off"
        style={{
          width: '100%',
          height: 52,
          borderRadius: 999,
          border: '1.5px solid rgba(255,255,255,0.15)',
          background: 'rgba(255,255,255,0.07)',
          color: '#ffffff',
          fontSize: 15,
          paddingLeft: 52,
          paddingRight: 24,
          outline: 'none',
          backdropFilter: 'blur(8px)',
          boxSizing: 'border-box',
          fontFamily: 'inherit',
        }}
      />
    </div>
  )
}
