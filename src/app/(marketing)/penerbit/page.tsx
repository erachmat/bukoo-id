import { CallToAction } from '@/components/marketing/CallToAction';

export default function PenerbitPage() {
  return (
    <>
      {/* ══════════════════════════════════════
     PENERBIT HERO
══════════════════════════════════════ */}
      <section style={{ 
        padding: '160px 24px 60px', 
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)',
          width: '800px', height: '400px', background: 'radial-gradient(circle, rgba(0,201,167,0.1) 0%, transparent 70%)',
          zIndex: 0, pointerEvents: 'none'
        }}></div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ 
            display: 'inline-block',
            padding: '6px 16px',
            background: 'rgba(0,201,167,0.1)',
            border: '1px solid rgba(0,201,167,0.3)',
            borderRadius: '20px',
            color: 'var(--teal)',
            fontSize: '12px',
            fontWeight: '700',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginBottom: '24px'
          }}>
            BUKOO UNTUK PENERBIT
          </div>
          
          <h1 style={{
            fontSize: '56px',
            fontWeight: '800',
            color: '#fff',
            lineHeight: '1.1',
            letterSpacing: '-1.5px',
            marginBottom: '24px'
          }}>
            Jangkau Jutaan Pembaca<br />
            di <span style={{ color: 'var(--teal)' }}>Seluruh Indonesia</span>
          </h1>
          <p style={{
            fontSize: '20px',
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '40px',
            lineHeight: '1.6',
            maxWidth: '650px',
            margin: '0 auto 48px'
          }}>
            Distribusikan katalog buku Anda secara digital dengan sistem bagi hasil yang transparan, analitik real-time, dan proteksi anti-pembajakan terbaik.
          </p>

          <button className="price-cta-btn price-cta-filled" style={{ width: 'auto', padding: '16px 40px', fontSize: '18px', display: 'inline-block' }}>
            Daftar Sebagai Mitra
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════
     BENEFITS GRID
══════════════════════════════════════ */}
      <section style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
          
          <div style={{ background: 'var(--surface)', padding: '40px', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: 'rgba(0,201,167,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', color: 'var(--teal)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>Dashboard Analitik</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>Pantau performa penjualan, demografi pembaca, dan durasi baca secara real-time untuk setiap judul buku Anda.</p>
          </div>

          <div style={{ background: 'var(--surface)', padding: '40px', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: 'rgba(201,149,42,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', color: 'var(--amber)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>Transparansi Royalti</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>Sistem bagi hasil yang adil berdasarkan metrik halaman yang dibaca. Penarikan dana otomatis setiap bulan.</p>
          </div>

          <div style={{ background: 'var(--surface)', padding: '40px', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', color: '#EF4444' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>Proteksi Anti-Pembajakan</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>Teknologi DRM (Digital Rights Management) standar industri untuk mencegah screenshot, screen-recording, dan redistribusi ilegal.</p>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════
     DASHBOARD SNEAK PEEK
══════════════════════════════════════ */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', background: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
          {/* Header */}
          <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#EF4444' }}></div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#F59E0B' }}></div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10B981' }}></div>
            </div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)' }}>BUKOO Publisher Hub</div>
            <div></div>
          </div>
          
          {/* Dashboard Body */}
          <div style={{ padding: '40px 32px', background: '#0d1117' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
              <div>
                <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>Performa Bulan Ini</h3>
                <div style={{ color: 'var(--teal)', fontWeight: '600', fontSize: '14px' }}>+12.4% dari bulan lalu</div>
              </div>
              <div style={{ fontSize: '32px', fontWeight: '800', color: '#fff' }}>Rp 42.500.000</div>
            </div>

            {/* Mock Chart Area */}
            <div style={{ height: '200px', width: '100%', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-end', gap: '16px', paddingBottom: '16px' }}>
              {[40, 60, 45, 80, 55, 90, 75, 100, 85, 120, 105, 140].map((h, i) => (
                <div key={i} style={{ flex: 1, background: 'linear-gradient(180deg, var(--teal) 0%, rgba(0,201,167,0) 100%)', height: `${h}px`, borderRadius: '4px 4px 0 0', opacity: 0.8 }}></div>
              ))}
            </div>
            
            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginTop: '32px' }}>
              <div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Total Halaman Dibaca</div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#fff' }}>1.2M+</div>
              </div>
              <div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Pembaca Aktif</div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#fff' }}>45.2K</div>
              </div>
              <div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Buku Terpopuler</div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>Seni Berpikir Positif</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
     B2B CTA
══════════════════════════════════════ */}
      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', background: 'linear-gradient(135deg, rgba(0,201,167,0.1), rgba(13,17,23,1))', border: '1px solid var(--teal)', borderRadius: '24px', padding: '64px 32px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#fff', marginBottom: '16px' }}>Siap Menerbitkan Karya Anda?</h2>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.7)', marginBottom: '40px', lineHeight: '1.6', maxWidth: '600px', margin: '0 auto 40px' }}>
            Bergabunglah dengan ratusan penerbit dan penulis independen lainnya yang telah mempercayakan karyanya pada BUKOO.
          </p>
          <div className="penerbit-cta-btns">
            <button className="price-cta-btn price-cta-filled" style={{ width: 'auto', padding: '16px 40px', fontSize: '18px' }}>Isi Formulir Kemitraan</button>
            <button className="price-cta-btn price-cta-outline" style={{ width: 'auto', padding: '16px 40px', fontSize: '18px' }}>Pelajari Lebih Lanjut</button>
          </div>
        </div>
      </section>
    </>
  );
}
