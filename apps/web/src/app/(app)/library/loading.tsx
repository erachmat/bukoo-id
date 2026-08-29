export default function LibraryLoading() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0E1117',
        padding: 'clamp(28px, 6vw, 64px) clamp(16px, 4vw, 48px)',
        fontFamily: 'var(--font-geist-sans), Inter, system-ui, sans-serif',
      }}
      aria-busy="true"
      aria-label="Memuat katalog"
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Breadcrumb + title skeleton */}
        <div style={{ width: 120, height: 14, borderRadius: 7, background: 'rgba(255,255,255,0.08)', marginBottom: 20 }} />
        <div style={{ width: 320, height: 44, borderRadius: 10, background: 'rgba(255,255,255,0.1)', marginBottom: 16 }} />
        <div style={{ width: 420, height: 16, borderRadius: 8, background: 'rgba(255,255,255,0.06)', marginBottom: 28 }} />
        <div style={{ width: '100%', maxWidth: 520, height: 52, borderRadius: 999, background: 'rgba(255,255,255,0.06)', marginBottom: 24 }} />
        <div style={{ display: 'flex', gap: 10, marginBottom: 40 }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} style={{ width: 92, height: 36, borderRadius: 999, background: 'rgba(255,255,255,0.06)' }} />
          ))}
        </div>

        {/* Grid skeleton */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 24,
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <div style={{ paddingBottom: '142%', borderRadius: 16, background: 'rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }} />
              <div style={{ width: '60%', height: 12, borderRadius: 6, background: 'rgba(255,255,255,0.06)', marginTop: 14 }} />
              <div style={{ width: '85%', height: 16, borderRadius: 6, background: 'rgba(255,255,255,0.1)', marginTop: 8 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
