import { BookRow } from '@/components/marketing/BookRow';
import { CallToAction } from '@/components/marketing/CallToAction';
import { originalBooks } from '@/components/marketing/bookData';

export default function OriginalsPage() {
  const terbaru = originalBooks.slice(0, 3);
  const segeraHadir = originalBooks.slice(3, 6);

  return (
    <>
      {/* ══════════════════════════════════════
     CINEMATIC HERO
══════════════════════════════════════ */}
      <section style={{ 
        padding: '180px 24px 80px', 
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: '#0a0a0a' // Darker cinematic background
      }}>
        {/* Cinematic glow */}
        <div style={{
          position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)',
          width: '800px', height: '500px', 
          background: 'radial-gradient(ellipse at top, rgba(201,149,42,0.15) 0%, transparent 60%)',
          zIndex: 0, pointerEvents: 'none'
        }}></div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ 
            display: 'inline-block',
            padding: '6px 16px',
            background: 'rgba(201,149,42,0.1)',
            border: '1px solid rgba(201,149,42,0.3)',
            borderRadius: '20px',
            color: 'var(--amber)',
            fontSize: '12px',
            fontWeight: '700',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginBottom: '24px'
          }}>
            Hanya di BUKOO
          </div>
          
          <h1 style={{
            fontSize: '56px',
            fontWeight: '800',
            color: '#fff',
            lineHeight: '1.1',
            letterSpacing: '-1.5px',
            marginBottom: '24px'
          }}>
            Karya Eksklusif<br />
            <em style={{ color: 'var(--amber)', fontStyle: 'normal' }}>Penulis Terbaik Indonesia</em>
          </h1>
          <p style={{
            fontSize: '20px',
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '40px',
            lineHeight: '1.6',
            maxWidth: '600px',
            margin: '0 auto 48px'
          }}>
            Nikmati cerita-cerita baru yang belum pernah diterbitkan di mana pun. Dikurasi ketat untuk pengalaman membaca premium.
          </p>

          <button className="price-cta-btn price-cta-filled" style={{ 
            display: 'inline-block',
            background: 'var(--amber)', 
            color: 'var(--forest-dd)', 
            width: 'auto', 
            padding: '16px 40px',
            fontSize: '18px',
            border: 'none',
            boxShadow: '0 10px 30px rgba(201,149,42,0.3)'
          }}>
            Mulai Baca Sekarang
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════
     WHY ORIGINALS
══════════════════════════════════════ */}
      <section style={{ padding: '80px 24px', background: 'var(--bg)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
          
          <div style={{ padding: '32px', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>✍️</div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#fff', marginBottom: '12px' }}>Penulis Ternama</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>Karya original dari penulis best-seller Indonesia seperti Dee Lestari, Puthut EA, dan banyak lagi.</p>
          </div>
          
          <div style={{ padding: '32px', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>✨</div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#fff', marginBottom: '12px' }}>Kualitas Kurasi Ketat</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>Setiap naskah melewati proses editing profesional untuk memastikan standar literasi tertinggi.</p>
          </div>
          
          <div style={{ padding: '32px', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>🎧</div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#fff', marginBottom: '12px' }}>Tersedia Audiobook</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>Sebagian besar BUKOO Originals langsung rilis beserta versi audiobook eksklusifnya.</p>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════
     BOOK ROWS
══════════════════════════════════════ */}
      <div style={{ background: '#0a0a0a', paddingTop: '40px', paddingBottom: '40px' }}>
        <BookRow 
          title="✦ Rilis Bulan Ini" 
          badge="Terbaru" 
          badgeColor="var(--amber)"
          badgeBorderColor="rgba(201,149,42,0.3)"
          books={terbaru} 
        />

        <BookRow 
          title="Segera Hadir" 
          badge="Pre-Save" 
          badgeColor="rgba(255,255,255,0.8)"
          badgeBorderColor="rgba(255,255,255,0.2)"
          books={segeraHadir} 
        />
      </div>

      {/* ══════════════════════════════════════
     FINAL CTA
══════════════════════════════════════ */}
      <div style={{ marginTop: '80px' }}>
        <CallToAction />
      </div>
    </>
  );
}
