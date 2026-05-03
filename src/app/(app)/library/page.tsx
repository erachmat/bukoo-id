import Link from 'next/link'
import { mockBooks } from '@/lib/data/mock-books'
import { BookCatalogCard } from '@/components/catalog/book-catalog-card'

export default function LibraryPage() {
  const genres = ["Semua", "Fiksi", "Non-Fiksi", "Sastra", "Pengembangan Diri", "Bisnis", "Sejarah", "Roman", "Klasik"]

  return (
    <div style={{ minHeight: '100vh', background: '#F0F2F5', fontFamily: 'var(--font-geist-sans), Inter, system-ui, sans-serif' }}>
      {/* Hero Header Band */}
      <div style={{
        background: 'linear-gradient(135deg, #00181A 0%, #00302E 60%, #004D4A 100%)',
        padding: '48px 32px 64px',
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
            Temukan bacaan Anda selanjutnya dari <strong style={{ color: '#00C9A7' }}>{mockBooks.length} judul</strong> pilihan terbaik
          </p>

          {/* Search bar in hero */}
          <div style={{ position: 'relative', maxWidth: 520, marginTop: 28 }}>
            <svg style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="search"
              placeholder="Cari judul, penulis, genre..."
              style={{
                width: '100%', height: 52, borderRadius: 999, border: '1.5px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.07)', color: '#ffffff', fontSize: 15,
                paddingLeft: 52, paddingRight: 24, outline: 'none', backdropFilter: 'blur(8px)',
                boxSizing: 'border-box', fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Genre quick filter chips */}
          <div style={{ display: 'flex', gap: 10, marginTop: 24, flexWrap: 'wrap' }}>
            {genres.slice(0, 7).map((g, i) => (
              <span key={g} style={{
                padding: '7px 18px', borderRadius: 999,
                background: i === 0 ? '#00C9A7' : 'rgba(255,255,255,0.1)',
                color: i === 0 ? '#00181A' : 'rgba(255,255,255,0.75)',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                border: i === 0 ? 'none' : '1.5px solid rgba(255,255,255,0.15)',
                transition: 'all 0.2s', letterSpacing: '0.01em',
              }}>
                {g}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 32px' }}>
        <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>

          {/* Sidebar */}
          <aside style={{
            width: 240, flexShrink: 0,
            background: '#ffffff',
            borderRadius: 20,
            border: '1px solid #E8ECF0',
            padding: '28px 24px',
            position: 'sticky',
            top: 84,
            boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00C9A7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="12" y1="18" x2="20" y2="18"/>
              </svg>
              <span style={{ fontWeight: 800, fontSize: 15, color: '#1A2332' }}>Filter</span>
            </div>

            <FilterSection title="Kategori">
              {genres.map(g => <FilterItem key={g} label={g} />)}
            </FilterSection>

            <div style={{ height: 1, background: '#F0F2F5', margin: '24px 0' }} />

            <FilterSection title="Tipe Akses">
              <FilterItem label="Gratis" />
              <FilterItem label="Premium" badge />
            </FilterSection>

            <div style={{ height: 1, background: '#F0F2F5', margin: '24px 0' }} />

            <FilterSection title="Bahasa">
              <FilterItem label="Indonesia 🇮🇩" />
              <FilterItem label="English 🇺🇸" />
            </FilterSection>

            <button style={{
              width: '100%', marginTop: 28, height: 42, borderRadius: 12,
              background: '#00C9A7', color: '#00181A', fontWeight: 800,
              fontSize: 14, border: 'none', cursor: 'pointer', letterSpacing: '0.02em',
            }}>
              Terapkan Filter
            </button>
          </aside>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
              <span style={{ fontSize: 14, color: '#6B7A8D', fontWeight: 600 }}>
                Menampilkan <strong style={{ color: '#1A2332' }}>{mockBooks.length * 2}</strong> buku
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 13, color: '#6B7A8D', fontWeight: 700 }}>Urutkan:</span>
                <select style={{
                  height: 40, borderRadius: 12, border: '1.5px solid #E8ECF0',
                  background: '#ffffff', paddingLeft: 16, paddingRight: 36,
                  fontSize: 13, fontWeight: 700, color: '#1A2332',
                  appearance: 'none', cursor: 'pointer', outline: 'none',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  fontFamily: 'inherit',
                }}>
                  <option>Terpopuler</option>
                  <option>Terbaru</option>
                  <option>Rating Tertinggi</option>
                </select>
              </div>
            </div>

            {/* Book Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(185px, 1fr))',
              gap: 24,
            }}>
              {[...mockBooks, ...mockBooks].map((book, idx) => (
                <BookCatalogCard key={`${book.id}-${idx}`} book={book} />
              ))}
            </div>

            {/* Load More */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 48 }}>
              <button style={{
                height: 48, padding: '0 40px', borderRadius: 999,
                background: '#ffffff', border: '2px solid #E8ECF0',
                fontSize: 14, fontWeight: 800, color: '#1A2332', cursor: 'pointer',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                fontFamily: 'inherit',
              }}>
                Muat Lebih Banyak →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FilterSection({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ fontSize: 10, fontWeight: 900, color: '#AAB4C0', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {children}
      </div>
    </div>
  )
}

function FilterItem({ label, badge }: { label: string, badge?: boolean }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
      <div style={{
        width: 18, height: 18, borderRadius: 6, border: '2px solid #D0D7E0',
        background: '#fff', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }} />
      <span style={{ fontSize: 13, fontWeight: 600, color: '#3D4A5C' }}>{label}</span>
      {badge && (
        <span style={{
          fontSize: 9, fontWeight: 900, background: 'linear-gradient(135deg, #F59E0B, #EF6C00)',
          color: '#fff', padding: '2px 6px', borderRadius: 999, letterSpacing: '0.08em',
        }}>PRO</span>
      )}
    </label>
  )
}

