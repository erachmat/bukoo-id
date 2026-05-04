import Link from 'next/link'

export function ComingSoonPage({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <section style={{
      padding: '140px 24px 80px',
      textAlign: 'center',
      position: 'relative',
    }}
    >
      <div style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 560,
        height: 360,
        background: 'radial-gradient(circle, rgba(201,149,42,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }}
      />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 560, margin: '0 auto' }}>
        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 48px)',
          fontWeight: 800,
          color: '#fff',
          letterSpacing: '-1px',
          marginBottom: 16,
        }}
        >
          {title}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 17, lineHeight: 1.65, marginBottom: 32 }}>
          {description ?? 'Halaman ini sedang disiapkan. Kembali lagi nanti untuk pembaruan terbaru dari BUKOO.'}
        </p>
        <span style={{
          display: 'inline-block',
          padding: '10px 22px',
          borderRadius: 999,
          border: '1px solid rgba(201,149,42,0.45)',
          color: 'var(--amber)',
          fontWeight: 700,
          fontSize: 14,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
        >
          Segera hadir
        </span>
        <div style={{ marginTop: 40 }}>
          <Link href="/" className="price-cta-btn price-cta-outline" style={{ display: 'inline-flex', textDecoration: 'none' }}>
            Kembali ke beranda
          </Link>
        </div>
      </div>
    </section>
  )
}
