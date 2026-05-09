import Link from 'next/link'
import { Suspense } from 'react'
import { prismaBookToCatalogBook } from '@/lib/data/book-mapper'
import { parseLibraryCatalogParams } from '@/lib/library/catalog-params'
import { findBooksForLibraryCatalog } from '@/lib/library/catalog-query'
import { BookCatalogCard } from '@/components/catalog/book-catalog-card'
import { LibraryGenreChips } from '@/components/catalog/library-genre-chips'
import { LibrarySearch } from '@/components/catalog/library-search'
import { LibrarySidebarFilters } from '@/components/catalog/library-sidebar-filters'
import { LibrarySort } from '@/components/catalog/library-sort'

export default async function LibraryPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const raw = await props.searchParams
  const filters = parseLibraryCatalogParams(raw)
  const { q, genre } = filters

  const books = await findBooksForLibraryCatalog(filters)
  const catalogBooks = books.map(prismaBookToCatalogBook)

  return (
    <div style={{ minHeight: '100vh', background: '#F0F2F5', fontFamily: 'var(--font-geist-sans), Inter, system-ui, sans-serif' }}>
      {/* Hero Header Band */}
      <div style={{
        background: 'linear-gradient(135deg, #00181A 0%, #00302E 60%, #004D4A 100%)',
        padding: 'clamp(28px, 6vw, 64px) clamp(16px, 4vw, 48px) clamp(40px, 6vw, 80px)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(0,201,167,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: '30%', width: 200, height: 200, borderRadius: '50%', background: 'rgba(0,201,167,0.04)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <Link href="/" style={{ color: '#00C9A7', fontSize: 12, fontWeight: 700, textDecoration: 'none', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Beranda</Link>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>/</span>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Katalog</span>
          </div>

          <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, color: '#ffffff', margin: 0, lineHeight: 1.05, letterSpacing: '-0.02em' }}>
            Katalog Buku
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 16, marginTop: 12, fontWeight: 500 }}>
            {q ? (
              <>Hasil pencarian: <strong style={{ color: '#00C9A7' }}>{catalogBooks.length} judul</strong> untuk &quot;{q}&quot;</>
            ) : (
              <>Temukan bacaan Anda selanjutnya dari <strong style={{ color: '#00C9A7' }}>{catalogBooks.length} judul</strong> pilihan terbaik</>
            )}
          </p>

          <Suspense fallback={(
            <div style={{ position: 'relative', maxWidth: 520, marginTop: 28, height: 52 }} aria-hidden />
          )}
          >
            <LibrarySearch initialQuery={q} />
          </Suspense>

          <Suspense fallback={<div style={{ marginTop: 24, height: 40 }} aria-hidden />}>
            <LibraryGenreChips activeGenre={genre} />
          </Suspense>
        </div>
      </div>

      {/* Main Body */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(24px, 4vw, 40px) clamp(16px, 4vw, 32px)' }}>
        <div className="lib-body-grid" style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>

          <div className="lib-sidebar-wrap">
            <Suspense fallback={(
              <aside style={{ width: 240, flexShrink: 0, height: 400, borderRadius: 20, background: '#ffffff', border: '1px solid #E8ECF0' }} aria-hidden />
            )}
            >
              <LibrarySidebarFilters />
            </Suspense>
          </div>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
              <span style={{ fontSize: 14, color: '#6B7A8D', fontWeight: 600 }}>
                Menampilkan <strong style={{ color: '#1A2332' }}>{catalogBooks.length}</strong> buku
              </span>
              <Suspense fallback={<div style={{ height: 40, width: 200 }} aria-hidden />}>
                <LibrarySort sort={filters.sort} />
              </Suspense>
            </div>

            {catalogBooks.length === 0 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '80px 24px',
                background: '#ffffff',
                borderRadius: 24,
                border: '1px solid #E8ECF0',
                textAlign: 'center',
                boxShadow: '0 2px 12px rgba(0,0,0,0.03)'
              }}>
                <span style={{ fontSize: 52, marginBottom: 16 }}>📚</span>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1A2332', margin: 0 }}>Belum Ada Buku</h3>
                <p style={{ color: '#6B7A8D', fontSize: 14, marginTop: 8, maxWidth: 360, lineHeight: 1.5 }}>
                  Maaf, tidak ada buku yang cocok dengan pilihan filter atau pencarian Anda saat ini.
                </p>
              </div>
            ) : (
              <>
                {/* Book Grid */}
                <div
                  className="lib-book-grid"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                    gap: 20,
                  }}
                >
                  {catalogBooks.map((book) => (
                    <BookCatalogCard key={book.id} book={book} />
                  ))}
                </div>

                {/* Load More */}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 48 }}>
                  <button style={{
                    height: 48,
                    padding: '0 40px',
                    borderRadius: 999,
                    background: '#ffffff',
                    border: '2px solid #E8ECF0',
                    fontSize: 14,
                    fontWeight: 800,
                    color: '#1A2332',
                    cursor: 'pointer',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                    fontFamily: 'inherit',
                  }}
                  type="button"
                  >
                    Muat Lebih Banyak →
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .lib-sidebar-wrap {
            display: none;
          }
          .lib-body-grid {
            flex-direction: column !important;
          }
        }
      `}</style>
    </div>
  )
}
