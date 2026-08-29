export default function PublisherBooksLoading() {
  return (
    <div style={{ padding: '32px clamp(16px, 4vw, 48px)', maxWidth: 1200, margin: '0 auto' }} aria-busy="true" aria-label="Memuat katalog penerbit">
      <div style={{ width: 260, height: 32, borderRadius: 8, background: 'rgba(0,0,0,0.06)', marginBottom: 12 }} />
      <div style={{ width: 380, height: 16, borderRadius: 8, background: 'rgba(0,0,0,0.05)', marginBottom: 32 }} />
      <div style={{ border: '1px solid rgba(0,0,0,0.06)', borderRadius: 14, overflow: 'hidden' }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '18px 20px',
              borderBottom: i < 4 ? '1px solid rgba(0,0,0,0.05)' : 'none',
            }}
          >
            <div style={{ width: 44, height: 60, borderRadius: 6, background: 'rgba(0,0,0,0.06)', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ width: '40%', height: 14, borderRadius: 6, background: 'rgba(0,0,0,0.08)', marginBottom: 8 }} />
              <div style={{ width: '25%', height: 12, borderRadius: 6, background: 'rgba(0,0,0,0.05)' }} />
            </div>
            <div style={{ width: 90, height: 26, borderRadius: 999, background: 'rgba(0,0,0,0.05)' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
