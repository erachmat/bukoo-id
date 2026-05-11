'use client'

import { Search } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { mergeLibraryPath } from '@/lib/library/catalog-params'

export function LibrarySearch({ initialQuery }: { initialQuery: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(initialQuery)

  useEffect(() => {
    const urlQ = searchParams.get('q') ?? ''
    const id = window.setTimeout(() => setValue(urlQ), 0)
    return () => window.clearTimeout(id)
  }, [searchParams])

  function commitSearch() {
    const path = mergeLibraryPath(searchParams, { q: value.trim() })
    router.push(path)
  }

  return (
    <form
      style={{ position: 'relative', maxWidth: 520, marginTop: 28 }}
      onSubmit={(e) => {
        e.preventDefault()
        commitSearch()
      }}
    >
      <label htmlFor="library-catalog-search" className="sr-only">
        Cari judul, penulis, genre
      </label>
      <span
        aria-hidden
        style={{
          position: 'absolute',
          left: 18,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          color: '#6B7A8D',
        }}
      >
        <Search strokeWidth={2.5} size={22} />
      </span>
      <input
        id="library-catalog-search"
        name="q"
        type="text"
        placeholder="Cari judul, penulis, genre..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoComplete="off"
        enterKeyHint="search"
        style={{
          width: '100%',
          height: 52,
          borderRadius: 999,
          border: '1px solid rgba(255,255,255,0.05)',
          background: 'rgba(255,255,255,0.05)',
          color: '#ffffff',
          fontSize: 15,
          paddingLeft: 54,
          paddingRight: 24,
          outline: 'none',
          backdropFilter: 'blur(8px)',
          boxSizing: 'border-box',
          fontFamily: 'inherit',
        }}
      />
    </form>
  )
}
