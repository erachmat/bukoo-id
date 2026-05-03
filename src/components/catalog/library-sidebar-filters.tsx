'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  LIBRARY_GENRES,
  type LibraryAccess,
  type LibraryLang,
  mergeLibraryPath,
  parseLibraryCatalogParams,
} from '@/lib/library/catalog-params'

export function LibrarySidebarFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const base = parseLibraryCatalogParams(Object.fromEntries(searchParams.entries()))

  const [genreDraft, setGenreDraft] = useState(base.genre)
  const [accessDraft, setAccessDraft] = useState<LibraryAccess>(base.access)
  const [langDraft, setLangDraft] = useState<LibraryLang>(base.lang)

  useEffect(() => {
    const next = parseLibraryCatalogParams(Object.fromEntries(searchParams.entries()))
    const id = window.requestAnimationFrame(() => {
      setGenreDraft(next.genre)
      setAccessDraft(next.access)
      setLangDraft(next.lang)
    })
    return () => window.cancelAnimationFrame(id)
  }, [searchParams])

  function apply() {
    const path = mergeLibraryPath(searchParams, {
      genre: genreDraft,
      access: accessDraft,
      lang: langDraft,
    })
    router.push(path)
  }

  return (
    <aside style={{
      width: 240,
      flexShrink: 0,
      background: '#ffffff',
      borderRadius: 20,
      border: '1px solid #E8ECF0',
      padding: '28px 24px',
      position: 'sticky',
      top: 84,
      boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
    }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00C9A7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="20" y2="12" /><line x1="12" y1="18" x2="20" y2="18" />
        </svg>
        <span style={{ fontWeight: 800, fontSize: 15, color: '#1A2332' }}>Filter</span>
      </div>

      <FilterSection title="Kategori">
        {LIBRARY_GENRES.map((g) => (
          <RadioRow
            key={g}
            name="catalog-genre"
            checked={genreDraft === g}
            label={g}
            onChange={() => setGenreDraft(g)}
          />
        ))}
      </FilterSection>

      <div style={{ height: 1, background: '#F0F2F5', margin: '24px 0' }} />

      <FilterSection title="Tipe Akses">
        <RadioRow name="catalog-access" checked={accessDraft === 'all'} label="Semua" onChange={() => setAccessDraft('all')} />
        <RadioRow name="catalog-access" checked={accessDraft === 'free'} label="Gratis" onChange={() => setAccessDraft('free')} />
        <RadioRow name="catalog-access" checked={accessDraft === 'premium'} label="Premium" badge onChange={() => setAccessDraft('premium')} />
      </FilterSection>

      <div style={{ height: 1, background: '#F0F2F5', margin: '24px 0' }} />

      <FilterSection title="Bahasa">
        <RadioRow name="catalog-lang" checked={langDraft === 'all'} label="Semua bahasa" onChange={() => setLangDraft('all')} />
        <RadioRow name="catalog-lang" checked={langDraft === 'id'} label="Indonesia 🇮🇩" onChange={() => setLangDraft('id')} />
        <RadioRow name="catalog-lang" checked={langDraft === 'en'} label="English 🇺🇸" onChange={() => setLangDraft('en')} />
      </FilterSection>

      <button
        type="button"
        onClick={apply}
        style={{
          width: '100%',
          marginTop: 28,
          height: 42,
          borderRadius: 12,
          background: '#00C9A7',
          color: '#00181A',
          fontWeight: 800,
          fontSize: 14,
          border: 'none',
          cursor: 'pointer',
          letterSpacing: '0.02em',
        }}
      >
        Terapkan Filter
      </button>
    </aside>
  )
}

function FilterSection({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{
        fontSize: 10,
        fontWeight: 900,
        color: '#AAB4C0',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        marginBottom: 14,
      }}
      >
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {children}
      </div>
    </div>
  )
}

function RadioRow({
  name,
  checked,
  label,
  badge,
  onChange,
}: {
  name: string
  checked: boolean
  label: string
  badge?: boolean
  onChange: () => void
}) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        style={{ accentColor: '#00C9A7', width: 18, height: 18, flexShrink: 0, cursor: 'pointer' }}
      />
      <span style={{ fontSize: 13, fontWeight: 600, color: '#3D4A5C' }}>{label}</span>
      {badge && (
        <span style={{
          fontSize: 9,
          fontWeight: 900,
          background: 'linear-gradient(135deg, #F59E0B, #EF6C00)',
          color: '#fff',
          padding: '2px 6px',
          borderRadius: 999,
          letterSpacing: '0.08em',
        }}
        >
          PRO
        </span>
      )}
    </label>
  )
}
