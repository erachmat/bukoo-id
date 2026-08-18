import Link from 'next/link';

export default function AiCompanionPage() {
  return (
    <div style={{ padding: '160px 24px 100px', maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{
        display: 'inline-block',
        padding: '6px 16px',
        background: 'rgba(0, 201, 167, 0.12)',
        border: '1px solid rgba(0, 201, 167, 0.3)',
        borderRadius: '20px',
        color: 'var(--teal)',
        fontSize: '12px',
        fontWeight: 700,
        letterSpacing: '2px',
        textTransform: 'uppercase',
        marginBottom: '20px'
      }}>
        ✨ AI Companion
      </div>
      <h1 style={{ fontSize: '48px', fontWeight: 800, color: '#fff', marginBottom: '20px', lineHeight: 1.1 }}>
        Teman Bicara &amp; Asisten Membaca Cerdas
      </h1>
      <p style={{ fontSize: '18px', color: 'var(--text-dim)', maxWidth: '640px', margin: '0 auto 40px', lineHeight: 1.6 }}>
        Tanyakan apapun seputar bab yang sedang kamu baca, dapatkan rangkuman instan, analisis karakter, dan diskusi interaktif berbasis kecerdasan buatan.
      </p>
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
        <Link href="/register">
          <button className="btn-cta" style={{ padding: '14px 32px', fontSize: '15px' }}>Coba BUKOO AI</button>
        </Link>
      </div>
    </div>
  );
}
