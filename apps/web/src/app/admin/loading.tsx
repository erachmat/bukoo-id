export default function AdminLoading() {
  return (
    <div style={{ padding: '32px clamp(16px, 4vw, 48px)' }} aria-busy="true" aria-label="Memuat dashboard admin">
      <div style={{ width: 240, height: 30, borderRadius: 8, background: 'rgba(0,0,0,0.06)', marginBottom: 28 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 32 }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ border: '1px solid rgba(0,0,0,0.06)', borderRadius: 14, padding: 20 }}>
            <div style={{ width: '50%', height: 12, borderRadius: 6, background: 'rgba(0,0,0,0.05)', marginBottom: 12 }} />
            <div style={{ width: '35%', height: 28, borderRadius: 8, background: 'rgba(0,0,0,0.09)' }} />
          </div>
        ))}
      </div>
      <div style={{ border: '1px solid rgba(0,0,0,0.06)', borderRadius: 14, padding: 20 }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '14px 0', borderBottom: i < 4 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.06)', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ width: '35%', height: 13, borderRadius: 6, background: 'rgba(0,0,0,0.08)', marginBottom: 7 }} />
              <div style={{ width: '20%', height: 11, borderRadius: 6, background: 'rgba(0,0,0,0.05)' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
