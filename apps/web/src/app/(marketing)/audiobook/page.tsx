import Link from 'next/link';

export default function AudiobookPage() {
  return (
    <div style={{ padding: '160px 24px 100px', maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{
        display: 'inline-block',
        padding: '6px 16px',
        background: 'rgba(201,149,42,0.12)',
        border: '1px solid rgba(201,149,42,0.3)',
        borderRadius: '20px',
        color: 'var(--amber)',
        fontSize: '12px',
        fontWeight: 700,
        letterSpacing: '2px',
        textTransform: 'uppercase',
        marginBottom: '20px'
      }}>
        BUKOO Audiobook
      </div>
      <h1 style={{ fontSize: '48px', fontWeight: 800, color: '#fff', marginBottom: '20px', lineHeight: 1.1 }}>
        Dengarkan Ribuan Cerita Sangat Jernih
      </h1>
      <p style={{ fontSize: '18px', color: 'var(--text-dim)', maxWidth: '640px', margin: '0 auto 40px', lineHeight: 1.6 }}>
        Nikmati pengalaman mendengarkan e-book berkualitas tinggi disuarakan oleh narator profesional dan pengisi suara ternama Indonesia.
      </p>
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
        <Link href="/register">
          <button className="btn-cta" style={{ padding: '14px 32px', fontSize: '15px' }}>Mulai Dengarkan Gratis</button>
        </Link>
        <Link href="/koleksi">
          <button className="btn-ghost" style={{ padding: '14px 32px', fontSize: '15px' }}>Jelajahi Koleksi</button>
        </Link>
      </div>
    </div>
  );
}
