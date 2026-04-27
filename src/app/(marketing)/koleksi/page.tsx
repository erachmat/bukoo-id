import { BookRow } from '@/components/marketing/BookRow';
import { CallToAction } from '@/components/marketing/CallToAction';
import { 
  trendingBooks, 
  originalBooks, 
  sastraIndonesiaBooks, 
  selfDevBooks 
} from '@/components/marketing/bookData';

export default function KoleksiPage() {
  return (
    <>
      {/* ══════════════════════════════════════
     KOLEKSI HERO
══════════════════════════════════════ */}
      <section style={{ 
        padding: '160px 24px 60px', 
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Simple background glows */}
        <div style={{
          position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)',
          width: '600px', height: '400px', background: 'radial-gradient(circle, rgba(0,201,167,0.1) 0%, transparent 70%)',
          zIndex: 0, pointerEvents: 'none'
        }}></div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: '700',
            color: '#fff',
            lineHeight: '1.2',
            letterSpacing: '-1px',
            marginBottom: '16px'
          }}>
            Eksplorasi <em style={{ color: 'var(--amber)', fontStyle: 'normal' }}>Koleksi</em> Kami
          </h1>
          <p style={{
            fontSize: '18px',
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '40px',
            lineHeight: '1.6'
          }}>
            Jelajahi lebih dari 200.000 judul dari berbagai genre. Temukan bacaan favoritmu berikutnya.
          </p>

          {/* Category Pills */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <span style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.1)', borderRadius: '20px', fontSize: '14px', color: '#fff', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.2)' }}>Semua</span>
            <span style={{ padding: '8px 16px', background: 'rgba(0,201,167,0.1)', color: 'var(--teal)', borderRadius: '20px', fontSize: '14px', cursor: 'pointer', border: '1px solid rgba(0,201,167,0.3)' }}>Fiksi</span>
            <span style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', fontSize: '14px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}>Non-Fiksi</span>
            <span style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', fontSize: '14px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}>Self-Development</span>
            <span style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', fontSize: '14px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}>Bisnis</span>
            <span style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', fontSize: '14px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}>Sejarah</span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
     BOOK ROWS
══════════════════════════════════════ */}
      <BookRow 
        title="🔥 Sedang Trending" 
        badge="Terpopuler" 
        books={trendingBooks} 
      />

      <BookRow 
        title="✦ BUKOO Originals" 
        badge="Eksklusif" 
        badgeColor="var(--teal)"
        badgeBorderColor="rgba(0,201,167,.3)"
        books={originalBooks} 
      />

      <BookRow 
        title="🇮🇩 Sastra Indonesia Terbaik" 
        badge="Pilihan Editor" 
        badgeColor="#A855F7"
        badgeBorderColor="rgba(168,85,247,.3)"
        books={sastraIndonesiaBooks} 
      />

      <BookRow 
        title="🧠 Self-Development Populer" 
        books={selfDevBooks} 
      />

      {/* ══════════════════════════════════════
     FINAL CTA
══════════════════════════════════════ */}
      <div style={{ marginTop: '80px' }}>
        <CallToAction />
      </div>
    </>
  );
}
