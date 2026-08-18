import Link from 'next/link';

export default function PerangkatPage() {
  return (
    <div style={{ padding: '160px 24px 100px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
      <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#fff', marginBottom: '16px' }}>
        Baca di Seluruh Perangkat Favoritmu
      </h1>
      <p style={{ fontSize: '16px', color: 'var(--text-dim)', marginBottom: '40px', lineHeight: 1.6 }}>
        Progres membaca, penanda halaman, dan catatan kamu tersinkronisasi secara otomatis antar smartphone, tablet, dan web browser.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>📱</div>
          <h3 style={{ color: '#fff', fontSize: '18px', marginBottom: '6px' }}>Android &amp; iOS</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: '13px' }}>Aplikasi mobile BUKOO siap diunduh di Google Play &amp; App Store.</p>
        </div>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>💻</div>
          <h3 style={{ color: '#fff', fontSize: '18px', marginBottom: '6px' }}>Web Reader</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: '13px' }}>Baca langsung di Chrome, Safari, atau Edge tanpa instalasi.</p>
        </div>
      </div>

      <Link href="/register">
        <button className="btn-cta">Coba BUKOO Sekarang</button>
      </Link>
    </div>
  );
}
