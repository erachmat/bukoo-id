'use client';
export default function LandingPage() {
  return (
    <>
      {/* ══════════════════════════════════════
     HERO
══════════════════════════════════════ */}
<section className="hero">
  <div className="hero-bg"></div>
  <div className="hero-grid"></div>
  <div className="hero-glow-1"></div>
  <div className="hero-glow-2"></div>

  <div className="hero-content">
    <div className="hero-badge">🇮🇩 Platform Buku Digital #1 Indonesia</div>

    <h1 className="hero-h1">
      Baca Tanpa Batas,
      <em>Mulai Hari Ini</em>
      <span>200.000+ Buku</span>
    </h1>

    <p className="hero-sub">
      Nikmati ratusan ribu judul dari penerbit Indonesia dan dunia —
      fiksi, non-fiksi, audiobook, sampai BUKOO Originals eksklusif.
      Harga mulai <strong style={{ color: 'var(--amber)' }}>Rp 19.900/bulan</strong>.
    </p>

    <div className="hero-input-row">
      <input className="hero-input" type="email" placeholder="Masukkan email kamu untuk memulai" />
      <button className="hero-btn">Mulai Gratis →</button>
    </div>
    <div className="hero-fine">Coba 7 hari gratis · Tanpa kartu kredit · Batalkan kapan saja</div>
  </div>

  {/* Book shelf */}
  <div className="hero-shelf">
    <div className="shelf-book bg-atomic"><div className="bk-shine"></div><div className="bk-edge"></div>
      <div style={{ position: 'absolute', inset: '0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6px' }}>
        <div style={{ width: '22px', height: '22px', border: '1.5px solid rgba(78,205,196,.8)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '3px' }}><div style={{ width: '10px', height: '10px', border: '1.5px solid rgba(78,205,196,1)', borderRadius: '50%' }}></div></div>
        <div style={{ fontSize: '5px', fontWeight: '700', color: 'rgba(78,205,196,.9)', textAlign: 'center', letterSpacing: '.3px' }}>ATOMIC<br />HABITS</div>
      </div>
    </div>
    <div className="shelf-book bg-laut"><div className="bk-shine"></div><div className="bk-edge"></div>
      <div style={{ position: 'absolute', inset: '0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5px' }}>
        <svg style={{ position: 'absolute', bottom: '0', left: '0', right: '0', width: '100%', height: '40%' }} viewBox="0 0 56 20" preserveAspectRatio="none"><path d="M0,12 Q14,4 28,12 Q42,20 56,12 L56,20 L0,20Z" fill="rgba(255,255,255,.12)"/></svg>
        <div style={{ fontSize: '5.5px', fontWeight: '700', color: 'rgba(255,255,255,.85)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '.3px' }}>LAUT<br />BERCERITA</div>
      </div>
    </div>
    <div className="shelf-book bg-think"><div className="bk-shine"></div><div className="bk-edge"></div>
      <div style={{ position: 'absolute', inset: '0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5px' }}>
        <div style={{ fontSize: '4.5px', fontWeight: '700', color: 'rgba(255,215,0,.7)', letterSpacing: '.3px', marginBottom: '1px' }}>N. HILL</div>
        <div style={{ width: '18px', height: '1px', background: 'rgba(255,215,0,.4)', marginBottom: '2px' }}></div>
        <div style={{ fontSize: '5.5px', fontWeight: '700', color: 'rgba(255,215,0,.9)', textAlign: 'center', lineHeight: '1.3' }}>THINK &<br />GROW RICH</div>
      </div>
    </div>
    <div className="shelf-book bg-sapiens"><div className="bk-shine"></div><div className="bk-edge"></div>
      <div style={{ position: 'absolute', inset: '0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5px' }}>
        <div style={{ fontSize: '4px', color: 'rgba(168,85,247,.8)', letterSpacing: '.8px', marginBottom: '2px' }}>Y.N. HARARI</div>
        <div style={{ fontSize: '10px', fontWeight: '700', color: '#fff', letterSpacing: '.8px' }}>SAPIENS</div>
      </div>
    </div>
    <div className="shelf-book bg-richdad"><div className="bk-shine"></div><div className="bk-edge"></div>
      <div style={{ position: 'absolute', inset: '0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5px' }}>
        <div style={{ fontSize: '5px', fontWeight: '700', color: 'rgba(100,220,130,.9)', textAlign: 'center', lineHeight: '1.3' }}>RICH DAD<br />POOR DAD</div>
        <div style={{ fontSize: '4px', color: 'rgba(255,255,255,.4)', marginTop: '2px' }}>KIYOSAKI</div>
      </div>
    </div>
    <div className="shelf-book bg-psych"><div className="bk-shine"></div><div className="bk-edge"></div>
      <div style={{ position: 'absolute', inset: '0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5px' }}>
        <div style={{ fontSize: '5px', fontWeight: '700', color: 'rgba(147,197,253,.9)', textAlign: 'center', lineHeight: '1.3' }}>PSYCH<br />OF MONEY</div>
        <div style={{ fontSize: '4px', color: 'rgba(255,255,255,.4)', marginTop: '1px' }}>M. HOUSEL</div>
      </div>
    </div>
    <div className="shelf-book bg-bumi"><div className="bk-shine"></div><div className="bk-edge"></div>
      <div style={{ position: 'absolute', inset: '0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5px' }}>
        <div style={{ fontSize: '5px', fontWeight: '700', color: 'rgba(255,200,100,.9)', textAlign: 'center', lineHeight: '1.3' }}>BUMI<br />MANUSIA</div>
        <div style={{ fontSize: '4px', color: 'rgba(255,255,255,.4)', marginTop: '2px' }}>PRAMOEDYA</div>
      </div>
    </div>
    <div className="shelf-book bg-deepwk"><div className="bk-shine"></div><div className="bk-edge"></div>
      <div style={{ position: 'absolute', inset: '0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5px' }}>
        <div style={{ fontSize: '6px', fontWeight: '700', color: 'rgba(255,255,255,.8)', textAlign: 'center', lineHeight: '1.3' }}>DEEP<br />WORK</div>
        <div style={{ fontSize: '4px', color: 'rgba(255,255,255,.4)', marginTop: '2px' }}>CAL NEWPORT</div>
      </div>
    </div>
    <div className="shelf-book bg-ikigai"><div className="bk-shine"></div><div className="bk-edge"></div>
      <div style={{ position: 'absolute', inset: '0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5px' }}>
        <div style={{ fontSize: '8px', fontWeight: '700', color: '#fff', letterSpacing: '.5px' }}>IKIGAI</div>
        <div style={{ fontSize: '11px', marginTop: '2px' }}>🌸</div>
      </div>
    </div>
    <div className="shelf-book bg-7hab"><div className="bk-shine"></div><div className="bk-edge"></div>
      <div style={{ position: 'absolute', inset: '0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5px' }}>
        <div style={{ fontSize: '5px', fontWeight: '700', color: 'rgba(100,220,130,.9)', textAlign: 'center', lineHeight: '1.3' }}>7<br />HABITS</div>
        <div style={{ fontSize: '4px', color: 'rgba(255,255,255,.4)', marginTop: '1px' }}>COVEY</div>
      </div>
    </div>
    <div className="shelf-book bg-alchm"><div className="bk-shine"></div><div className="bk-edge"></div>
      <div style={{ position: 'absolute', inset: '0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5px' }}>
        <div style={{ fontSize: '5.5px', fontWeight: '700', color: 'rgba(255,200,80,.9)', textAlign: 'center', lineHeight: '1.3' }}>THE<br />ALCHEMIST</div>
        <div style={{ fontSize: '4px', color: 'rgba(255,255,255,.35)', marginTop: '1px' }}>PAULO COELHO</div>
      </div>
    </div>
    <div className="shelf-book bg-zero"><div className="bk-shine"></div><div className="bk-edge"></div>
      <div style={{ position: 'absolute', inset: '0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5px' }}>
        <div style={{ fontSize: '5px', fontWeight: '700', color: 'rgba(147,197,253,.9)', textAlign: 'center', lineHeight: '1.3' }}>ZERO TO<br />ONE</div>
        <div style={{ fontSize: '4px', color: 'rgba(255,255,255,.35)', marginTop: '1px' }}>P. THIEL</div>
      </div>
    </div>
  </div>
</section>


{/* ══════════════════════════════════════
     MARQUEE STRIP
══════════════════════════════════════ */}
<div className="marquee-strip">
  <div className="marquee-inner">
    <span className="marquee-item">200.000+ Judul</span><span className="marquee-dot">✦</span>
    <span className="marquee-item">Penerbit Indonesia Terbaik</span><span className="marquee-dot">✦</span>
    <span className="marquee-item">Audiobook Tersedia</span><span className="marquee-dot">✦</span>
    <span className="marquee-item">AI Reading Companion</span><span className="marquee-dot">✦</span>
    <span className="marquee-item">Social Reading</span><span className="marquee-dot">✦</span>
    <span className="marquee-item">Offline Mode</span><span className="marquee-dot">✦</span>
    <span className="marquee-item">Mulai Rp 19.900/bln</span><span className="marquee-dot">✦</span>
    <span className="marquee-item">BUKOO Originals Eksklusif</span><span className="marquee-dot">✦</span>
    {/* repeat */}
    <span className="marquee-item">200.000+ Judul</span><span className="marquee-dot">✦</span>
    <span className="marquee-item">Penerbit Indonesia Terbaik</span><span className="marquee-dot">✦</span>
    <span className="marquee-item">Audiobook Tersedia</span><span className="marquee-dot">✦</span>
    <span className="marquee-item">AI Reading Companion</span><span className="marquee-dot">✦</span>
    <span className="marquee-item">Social Reading</span><span className="marquee-dot">✦</span>
    <span className="marquee-item">Offline Mode</span><span className="marquee-dot">✦</span>
    <span className="marquee-item">Mulai Rp 19.900/bln</span><span className="marquee-dot">✦</span>
    <span className="marquee-item">BUKOO Originals Eksklusif</span><span className="marquee-dot">✦</span>
  </div>
</div>


{/* ══════════════════════════════════════
     TRENDING NOW (Netflix-style row)
══════════════════════════════════════ */}
<section className="book-section">
  <div className="section-header">
    <div className="section-title-row">
      <h2 className="section-h2">🔥 Trending di Indonesia</h2>
      <span className="section-badge">Minggu Ini</span>
    </div>
    <span className="section-more">Lihat semua <span>→</span></span>
  </div>

  <div className="book-row" id="trending-row">
    {/* Book 1 */}
    <div className="book-card">
      <div className="rank-overlay">1</div>
      <div className="book-cover bg-laut">
        <div className="bk-shine"></div><div className="bk-edge"></div>
        <div className="book-cover-inner">
          <svg style={{ position: 'absolute', bottom: '0', left: '0', right: '0', width: '100%', height: '40%' }} viewBox="0 0 100 30" preserveAspectRatio="none"><path d="M0,18 Q25,8 50,18 Q75,28 100,18 L100,30 L0,30Z" fill="rgba(255,255,255,.12)"/></svg>
          <div style={{ position: 'relative', zIndex: '1', textAlign: 'center' }}>
            <div style={{ fontSize: '8px', fontWeight: '700', color: 'rgba(255,255,255,.85)', textTransform: 'uppercase', letterSpacing: '.5px', lineHeight: '1.4' }}>LAUT<br />BERCERITA</div>
            <div style={{ fontSize: '7px', color: 'rgba(255,255,255,.4)', marginTop: '2px' }}>LEILA S.C.</div>
          </div>
        </div>
        <div className="book-overlay"><div className="play-btn">▶</div></div>
      </div>
      <div className="book-tooltip">
        <div className="tt-title">Laut Bercerita</div>
        <div className="tt-author">Leila S. Chudori</div>
        <div className="tt-tags"><span className="tt-tag">🇮🇩 Sastra</span><span className="tt-tag">Novel</span><span className="tt-tag">Sejarah</span></div>
        <div className="tt-rating">⭐ 4.8 · 42.841 pembaca</div>
      </div>
      <div className="book-meta-below">
        <div className="bm-title">Laut Bercerita</div>
        <div className="bm-author">Leila S. Chudori</div>
        <div className="bm-rating">⭐ 4.8</div>
      </div>
    </div>

    {/* Book 2 */}
    <div className="book-card">
      <div className="rank-overlay">2</div>
      <div className="book-cover bg-atomic">
        <div className="bk-shine"></div><div className="bk-edge"></div>
        <div className="book-cover-inner">
          <div style={{ width: '32px', height: '32px', border: '2px solid rgba(78,205,196,.7)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' }}><div style={{ width: '16px', height: '16px', border: '2px solid rgba(78,205,196,.9)', borderRadius: '50%' }}></div></div>
          <div style={{ fontSize: '6.5px', fontWeight: '700', color: 'rgba(78,205,196,.9)', textAlign: 'center' }}>ATOMIC<br />HABITS</div>
          <div style={{ fontSize: '6px', color: 'rgba(255,255,255,.35)', marginTop: '2px' }}>JAMES CLEAR</div>
        </div>
        <div className="book-overlay"><div className="play-btn">▶</div></div>
      </div>
      <div className="book-tooltip">
        <div className="tt-title">Atomic Habits</div>
        <div className="tt-author">James Clear</div>
        <div className="tt-tags"><span className="tt-tag">Self-Dev</span><span className="tt-tag">Produktivitas</span></div>
        <div className="tt-rating">⭐ 4.9 · 38.124 pembaca</div>
      </div>
      <div className="book-meta-below">
        <div className="bm-title">Atomic Habits</div>
        <div className="bm-author">James Clear</div>
        <div className="bm-rating">⭐ 4.9</div>
      </div>
    </div>

    {/* Book 3 */}
    <div className="book-card">
      <div className="rank-overlay">3</div>
      <div className="book-cover bg-bumi">
        <div className="bk-shine"></div><div className="bk-edge"></div>
        <div className="book-cover-inner">
          <div style={{ fontSize: '7.5px', fontWeight: '700', color: 'rgba(255,200,100,.9)', textAlign: 'center', lineHeight: '1.4' }}>BUMI<br />MANUSIA</div>
          <div style={{ fontSize: '6px', color: 'rgba(255,255,255,.4)', marginTop: '3px' }}>PRAMOEDYA</div>
          <div style={{ marginTop: '4px', background: 'rgba(0,201,167,.7)', padding: '1px 6px', borderRadius: '2px', fontSize: '6px', fontWeight: '700', color: '#0D1117' }}>🇮🇩</div>
        </div>
        <div className="book-overlay"><div className="play-btn">▶</div></div>
      </div>
      <div className="book-tooltip">
        <div className="tt-title">Bumi Manusia</div>
        <div className="tt-author">Pramoedya Ananta Toer</div>
        <div className="tt-tags"><span className="tt-tag">🇮🇩 Sastra</span><span className="tt-tag">Klasik</span></div>
        <div className="tt-rating">⭐ 4.9 · 29.556 pembaca</div>
      </div>
      <div className="book-meta-below">
        <div className="bm-title">Bumi Manusia</div>
        <div className="bm-author">Pramoedya A.T.</div>
        <div className="bm-rating">⭐ 4.9</div>
      </div>
    </div>

    {/* Book 4 */}
    <div className="book-card">
      <div className="rank-overlay">4</div>
      <div className="book-cover bg-sapiens">
        <div className="bk-shine"></div><div className="bk-edge"></div>
        <div className="book-cover-inner">
          <div style={{ fontSize: '5.5px', color: 'rgba(168,85,247,.8)', letterSpacing: '.8px', marginBottom: '3px' }}>Y.N. HARARI</div>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff', letterSpacing: '.8px' }}>SAPIENS</div>
          <div style={{ fontSize: '5px', color: 'rgba(255,255,255,.4)', textAlign: 'center', marginTop: '2px' }}>A BRIEF HISTORY</div>
        </div>
        <div className="book-overlay"><div className="play-btn">▶</div></div>
      </div>
      <div className="book-tooltip">
        <div className="tt-title">Sapiens (Bahasa Indonesia)</div>
        <div className="tt-author">Yuval Noah Harari</div>
        <div className="tt-tags"><span className="tt-tag">Sains</span><span className="tt-tag">Sejarah</span></div>
        <div className="tt-rating">⭐ 4.8 · 24.210 pembaca</div>
      </div>
      <div className="book-meta-below">
        <div className="bm-title">Sapiens (ID)</div>
        <div className="bm-author">Yuval Noah Harari</div>
        <div className="bm-rating">⭐ 4.8</div>
      </div>
    </div>

    {/* Book 5 */}
    <div className="book-card">
      <div className="rank-overlay">5</div>
      <div className="book-cover bg-think">
        <div className="bk-shine"></div><div className="bk-edge"></div>
        <div className="book-cover-inner">
          <div style={{ fontSize: '5px', color: 'rgba(255,215,0,.7)', letterSpacing: '.5px', marginBottom: '2px' }}>N. HILL</div>
          <div style={{ width: '20px', height: '1px', background: 'rgba(255,215,0,.4)', marginBottom: '3px' }}></div>
          <div style={{ fontSize: '7px', fontWeight: '700', color: 'rgba(255,215,0,.9)', textAlign: 'center', lineHeight: '1.3' }}>THINK &<br />GROW RICH</div>
        </div>
        <div className="book-overlay"><div className="play-btn">▶</div></div>
      </div>
      <div className="book-tooltip">
        <div className="tt-title">Think & Grow Rich</div>
        <div className="tt-author">Napoleon Hill</div>
        <div className="tt-tags"><span className="tt-tag">Bisnis</span><span className="tt-tag">Self-Dev</span></div>
        <div className="tt-rating">⭐ 4.7 · 18.933 pembaca</div>
      </div>
      <div className="book-meta-below">
        <div className="bm-title">Think & Grow Rich</div>
        <div className="bm-author">Napoleon Hill</div>
        <div className="bm-rating">⭐ 4.7</div>
      </div>
    </div>

    {/* Book 6 */}
    <div className="book-card">
      <div className="rank-overlay">6</div>
      <div className="book-cover bg-psych">
        <div className="bk-shine"></div><div className="bk-edge"></div>
        <div className="book-cover-inner">
          <div style={{ fontSize: '5px', color: 'rgba(147,197,253,.8)', letterSpacing: '.5px', marginBottom: '2px' }}>MORGAN HOUSEL</div>
          <div style={{ fontSize: '7px', fontWeight: '700', color: 'rgba(147,197,253,.9)', textAlign: 'center', lineHeight: '1.3' }}>THE PSYCH<br />OF MONEY</div>
        </div>
        <div className="book-overlay"><div className="play-btn">▶</div></div>
      </div>
      <div className="book-tooltip">
        <div className="tt-title">The Psychology of Money</div>
        <div className="tt-author">Morgan Housel</div>
        <div className="tt-tags"><span className="tt-tag">Keuangan</span><span className="tt-tag">Bisnis</span></div>
        <div className="tt-rating">⭐ 4.8 · 17.445 pembaca</div>
      </div>
      <div className="book-meta-below">
        <div className="bm-title">Psychology of Money</div>
        <div className="bm-author">Morgan Housel</div>
        <div className="bm-rating">⭐ 4.8</div>
      </div>
    </div>

    {/* Book 7 */}
    <div className="book-card">
      <div className="rank-overlay">7</div>
      <div className="book-cover bg-alchm">
        <div className="bk-shine"></div><div className="bk-edge"></div>
        <div className="book-cover-inner">
          <div style={{ fontSize: '6px', fontWeight: '700', color: 'rgba(255,200,80,.9)', textAlign: 'center', lineHeight: '1.4' }}>THE<br />ALCHEMIST</div>
          <div style={{ fontSize: '5px', color: 'rgba(255,255,255,.4)', marginTop: '2px' }}>PAULO COELHO</div>
        </div>
        <div className="book-overlay"><div className="play-btn">▶</div></div>
      </div>
      <div className="book-tooltip">
        <div className="tt-title">The Alchemist (ID)</div>
        <div className="tt-author">Paulo Coelho</div>
        <div className="tt-tags"><span className="tt-tag">Fiksi</span><span className="tt-tag">Filosofi</span></div>
        <div className="tt-rating">⭐ 4.8 · 15.820 pembaca</div>
      </div>
      <div className="book-meta-below">
        <div className="bm-title">The Alchemist</div>
        <div className="bm-author">Paulo Coelho</div>
        <div className="bm-rating">⭐ 4.8</div>
      </div>
    </div>

    {/* Book 8 */}
    <div className="book-card">
      <div className="rank-overlay">8</div>
      <div className="book-cover bg-richdad">
        <div className="bk-shine"></div><div className="bk-edge"></div>
        <div className="book-cover-inner">
          <div style={{ fontSize: '6px', fontWeight: '700', color: 'rgba(100,220,130,.9)', textAlign: 'center', lineHeight: '1.4' }}>RICH DAD<br />POOR DAD</div>
          <div style={{ fontSize: '5px', color: 'rgba(255,255,255,.4)', marginTop: '2px' }}>KIYOSAKI</div>
        </div>
        <div className="book-overlay"><div className="play-btn">▶</div></div>
      </div>
      <div className="book-tooltip">
        <div className="tt-title">Rich Dad Poor Dad</div>
        <div className="tt-author">Robert Kiyosaki</div>
        <div className="tt-tags"><span className="tt-tag">Keuangan</span><span className="tt-tag">Bisnis</span></div>
        <div className="tt-rating">⭐ 4.7 · 14.220 pembaca</div>
      </div>
      <div className="book-meta-below">
        <div className="bm-title">Rich Dad Poor Dad</div>
        <div className="bm-author">Robert Kiyosaki</div>
        <div className="bm-rating">⭐ 4.7</div>
      </div>
    </div>

    {/* Book 9 */}
    <div className="book-card">
      <div className="rank-overlay">9</div>
      <div className="book-cover bg-deepwk">
        <div className="bk-shine"></div><div className="bk-edge"></div>
        <div className="book-cover-inner">
          <div style={{ fontSize: '8px', fontWeight: '700', color: 'rgba(255,255,255,.8)', textAlign: 'center', lineHeight: '1.3' }}>DEEP<br />WORK</div>
          <div style={{ fontSize: '5px', color: 'rgba(255,255,255,.35)', marginTop: '2px' }}>CAL NEWPORT</div>
        </div>
        <div className="book-overlay"><div className="play-btn">▶</div></div>
      </div>
      <div className="book-tooltip">
        <div className="tt-title">Deep Work</div>
        <div className="tt-author">Cal Newport</div>
        <div className="tt-tags"><span className="tt-tag">Produktivitas</span><span className="tt-tag">Self-Dev</span></div>
        <div className="tt-rating">⭐ 4.7 · 12.108 pembaca</div>
      </div>
      <div className="book-meta-below">
        <div className="bm-title">Deep Work</div>
        <div className="bm-author">Cal Newport</div>
        <div className="bm-rating">⭐ 4.7</div>
      </div>
    </div>

    {/* Book 10 */}
    <div className="book-card">
      <div className="rank-overlay" style={{ fontSize: '54px' }}>10</div>
      <div className="book-cover bg-ikigai">
        <div className="bk-shine"></div><div className="bk-edge"></div>
        <div className="book-cover-inner">
          <div style={{ fontSize: '9px', fontWeight: '700', color: '#fff', letterSpacing: '.5px' }}>IKIGAI</div>
          <div style={{ fontSize: '14px', marginTop: '2px' }}>🌸</div>
          <div style={{ fontSize: '5px', color: 'rgba(255,255,255,.4)', marginTop: '2px' }}>GARCIA & MIRALLES</div>
        </div>
        <div className="book-overlay"><div className="play-btn">▶</div></div>
      </div>
      <div className="book-tooltip">
        <div className="tt-title">Ikigai</div>
        <div className="tt-author">H. Garcia & F. Miralles</div>
        <div className="tt-tags"><span className="tt-tag">Filosofi</span><span className="tt-tag">Gaya Hidup</span></div>
        <div className="tt-rating">⭐ 4.7 · 11.503 pembaca</div>
      </div>
      <div className="book-meta-below">
        <div className="bm-title">Ikigai</div>
        <div className="bm-author">Garcia & Miralles</div>
        <div className="bm-rating">⭐ 4.7</div>
      </div>
    </div>
  </div>
</section>


{/* BUKOO ORIGINALS Row */}
<section className="book-section" style={{ paddingTop: '0' }}>
  <div className="section-header">
    <div className="section-title-row">
      <h2 className="section-h2">✦ BUKOO Originals</h2>
      <span className="section-badge" style={{ color: 'var(--teal)', borderColor: 'rgba(0,201,167,.3)' }}>Eksklusif</span>
    </div>
    <span className="section-more">Lihat semua <span>→</span></span>
  </div>
  <div className="book-row">
    <div className="book-card">
      <div className="book-cover bg-orig"><div className="bk-shine"></div><div className="bk-edge"></div>
        <div className="book-cover-inner">
          <div style={{ background: 'var(--amber)', color: 'var(--forest-dd)', fontSize: '6px', fontWeight: '700', padding: '2px 6px', borderRadius: '2px', marginBottom: '5px' }}>ORIGINAL</div>
          <div style={{ fontSize: '6.5px', fontWeight: '700', color: '#fff', textAlign: 'center', lineHeight: '1.4' }}>TANAH<br />&amp; KATA</div>
          <div style={{ fontSize: '5.5px', color: 'rgba(255,255,255,.4)', marginTop: '2px' }}>PUTHUT EA</div>
        </div>
        <div className="book-overlay"><div className="play-btn">▶</div></div>
      </div>
      <div className="book-meta-below"><div className="bm-title">Tanah &amp; Kata</div><div className="bm-author">Puthut EA</div><div className="bm-rating" style={{ color: 'var(--teal)' }}>✦ Original</div></div>
    </div>
    <div className="book-card">
      <div className="book-cover bg-show"><div className="bk-shine"></div><div className="bk-edge"></div>
        <div className="book-cover-inner">
          <div style={{ background: 'var(--amber)', color: 'var(--forest-dd)', fontSize: '6px', fontWeight: '700', padding: '2px 6px', borderRadius: '2px', marginBottom: '5px' }}>ORIGINAL</div>
          <div style={{ fontSize: '6.5px', fontWeight: '700', color: '#fff', textAlign: 'center', lineHeight: '1.4' }}>GENERASI<br />LAYAR</div>
          <div style={{ fontSize: '5.5px', color: 'rgba(255,255,255,.4)', marginTop: '2px' }}>CLARA SHINTA</div>
        </div>
        <div className="book-overlay"><div className="play-btn">▶</div></div>
      </div>
      <div className="book-meta-below"><div className="bm-title">Generasi Layar</div><div className="bm-author">Clara Shinta</div><div className="bm-rating" style={{ color: 'var(--teal)' }}>✦ Original</div></div>
    </div>
    <div className="book-card">
      <div className="book-cover bg-noa"><div className="bk-shine"></div><div className="bk-edge"></div>
        <div className="book-cover-inner">
          <div style={{ background: 'var(--amber)', color: 'var(--forest-dd)', fontSize: '6px', fontWeight: '700', padding: '2px 6px', borderRadius: '2px', marginBottom: '5px' }}>ORIGINAL</div>
          <div style={{ fontSize: '6.5px', fontWeight: '700', color: '#fff', textAlign: 'center', lineHeight: '1.4' }}>MIMPI<br />DI JAKARTA</div>
          <div style={{ fontSize: '5.5px', color: 'rgba(255,255,255,.4)', marginTop: '2px' }}>RIO ALFIANO</div>
        </div>
        <div className="book-overlay"><div className="play-btn">▶</div></div>
      </div>
      <div className="book-meta-below"><div className="bm-title">Mimpi di Jakarta</div><div className="bm-author">Rio Alfiano</div><div className="bm-rating" style={{ color: 'var(--teal)' }}>✦ Original</div></div>
    </div>
    <div className="book-card">
      <div className="book-cover bg-power"><div className="bk-shine"></div><div className="bk-edge"></div>
        <div className="book-cover-inner">
          <div style={{ background: 'var(--amber)', color: 'var(--forest-dd)', fontSize: '6px', fontWeight: '700', padding: '2px 6px', borderRadius: '2px', marginBottom: '5px' }}>ORIGINAL</div>
          <div style={{ fontSize: '6.5px', fontWeight: '700', color: '#fff', textAlign: 'center', lineHeight: '1.4' }}>SENJA<br />NUSANTARA</div>
          <div style={{ fontSize: '5.5px', color: 'rgba(255,255,255,.4)', marginTop: '2px' }}>DEE LESTARI</div>
        </div>
        <div className="book-overlay"><div className="play-btn">▶</div></div>
      </div>
      <div className="book-meta-below"><div className="bm-title">Senja Nusantara</div><div className="bm-author">Dee Lestari</div><div className="bm-rating" style={{ color: 'var(--teal)' }}>✦ Original</div></div>
    </div>
    <div className="book-card">
      <div className="book-cover bg-flow"><div className="bk-shine"></div><div className="bk-edge"></div>
        <div className="book-cover-inner">
          <div style={{ background: 'var(--amber)', color: 'var(--forest-dd)', fontSize: '6px', fontWeight: '700', padding: '2px 6px', borderRadius: '2px', marginBottom: '5px' }}>ORIGINAL</div>
          <div style={{ fontSize: '6.5px', fontWeight: '700', color: '#fff', textAlign: 'center', lineHeight: '1.4' }}>RASA<br />INDONESIA</div>
          <div style={{ fontSize: '5.5px', color: 'rgba(255,255,255,.4)', marginTop: '2px' }}>ALANDA KARIZA</div>
        </div>
        <div className="book-overlay"><div className="play-btn">▶</div></div>
      </div>
      <div className="book-meta-below"><div className="bm-title">Rasa Indonesia</div><div className="bm-author">Alanda Kariza</div><div className="bm-rating" style={{ color: 'var(--teal)' }}>✦ Original</div></div>
    </div>
    <div className="book-card">
      <div className="book-cover bg-zero"><div className="bk-shine"></div><div className="bk-edge"></div>
        <div className="book-cover-inner">
          <div style={{ background: 'var(--amber)', color: 'var(--forest-dd)', fontSize: '6px', fontWeight: '700', padding: '2px 6px', borderRadius: '2px', marginBottom: '5px' }}>ORIGINAL</div>
          <div style={{ fontSize: '6.5px', fontWeight: '700', color: '#fff', textAlign: 'center', lineHeight: '1.4' }}>KODE<br />RAHASIA</div>
          <div style={{ fontSize: '5.5px', color: 'rgba(255,255,255,.4)', marginTop: '2px' }}>AZHAR NURUN ALA</div>
        </div>
        <div className="book-overlay"><div className="play-btn">▶</div></div>
      </div>
      <div className="book-meta-below"><div className="bm-title">Kode Rahasia</div><div className="bm-author">Azhar Nurun Ala</div><div className="bm-rating" style={{ color: 'var(--teal)' }}>✦ Original</div></div>
    </div>
  </div>
</section>


{/* ══════════════════════════════════════
     STATS
══════════════════════════════════════ */}
<div className="stats-section">
  <div className="stat-item">
    <div className="stat-num">229<span>Jt</span></div>
    <div className="stat-label">Potensi Pengguna Internet Indonesia</div>
  </div>
  <div className="stat-item">
    <div className="stat-num">200<span>k+</span></div>
    <div className="stat-label">Judul Buku Tersedia</div>
  </div>
  <div className="stat-item">
    <div className="stat-num">500<span>+</span></div>
    <div className="stat-label">Penerbit Mitra</div>
  </div>
  <div className="stat-item">
    <div className="stat-num">Rp<span>19rb</span></div>
    <div className="stat-label">Harga Langganan Mulai Dari</div>
  </div>
</div>


{/* ══════════════════════════════════════
     FEATURES (Netflix-style sections)
══════════════════════════════════════ */}
<div className="features-divider"></div>

<section style={{ padding: '0 60px' }}>

  {/* Feature 1: Baca di mana saja */}
  <div className="feature-row">
    <div className="feature-text">
      <div className="feature-label">📱 Multi-Platform</div>
      <h2 className="feature-h2">Baca di Semua<br />Perangkat Kamu</h2>
      <p className="feature-p">Mulai membaca di smartphone, lanjutkan di tablet, selesaikan di laptop. Semua tersinkronisasi secara otomatis — bahkan saat offline.</p>
      <div className="feature-bullets">
        <div className="feature-bullet"><div className="bullet-icon">✓</div><span>Sinkronisasi otomatis posisi baca, highlight, dan catatan</span></div>
        <div className="feature-bullet"><div className="bullet-icon">✓</div><span>Download unlimited untuk baca offline tanpa internet</span></div>
        <div className="feature-bullet"><div className="bullet-icon">✓</div><span>iOS, Android, Web browser — satu akun untuk semua</span></div>
      </div>
    </div>
    <div className="feature-visual">
      <div style={{ position: 'relative' }}>
        {/* Floating device mockups */}
        <div style={{ background: '#0A0A0A', borderRadius: '36px', padding: '10px', boxShadow: '0 40px 80px rgba(0,0,0,0.6)', width: '220px', margin: '0 auto', position: 'relative', zIndex: '2' }}>
          <div style={{ background: '#0D1117', borderRadius: '28px', height: '380px', overflow: 'hidden', position: 'relative' }}>
            <div style={{ background: 'linear-gradient(135deg,var(--forest-l),var(--forest-ll))', height: '140px', display: 'flex', alignItems: 'flex-end', padding: '14px' }}>
              <div><div style={{ fontSize: '7px', color: 'rgba(255,255,255,.5)', marginBottom: '2px' }}>SEDANG DIBACA</div><div style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>Laut Bercerita</div><div style={{ fontSize: '9px', color: 'rgba(255,255,255,.5)' }}>Leila S. Chudori · 34%</div></div>
            </div>
            <div style={{ padding: '14px' }}>
              <div style={{ height: '4px', background: 'rgba(255,255,255,.1)', borderRadius: '2px', overflow: 'hidden', marginBottom: '14px' }}><div style={{ width: '34%', height: '100%', background: 'var(--amber)' }}></div></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                <div style={{ background: 'rgba(255,255,255,.04)', borderRadius: '7px', padding: '10px', textAlign: 'center' }}><div style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>47</div><div style={{ fontSize: '7px', color: 'rgba(0,201,167,.8)' }}>Selesai</div></div>
                <div style={{ background: 'rgba(255,255,255,.04)', borderRadius: '7px', padding: '10px', textAlign: 'center' }}><div style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>21</div><div style={{ fontSize: '7px', color: 'var(--amber)' }}>Streak 🔥</div></div>
              </div>
              <div style={{ fontSize: '9px', fontWeight: '700', color: 'rgba(255,255,255,.5)', marginBottom: '7px' }}>Rak Buku</div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <div style={{ width: '36px', height: '52px', borderRadius: '4px', overflow: 'hidden' }} className="bg-atomic"><div className="bk-shine"></div></div>
                <div style={{ width: '36px', height: '52px', borderRadius: '4px', overflow: 'hidden' }} className="bg-sapiens"><div className="bk-shine"></div></div>
                <div style={{ width: '36px', height: '52px', borderRadius: '4px', overflow: 'hidden' }} className="bg-think"><div className="bk-shine"></div></div>
                <div style={{ width: '36px', height: '52px', borderRadius: '4px', overflow: 'hidden' }} className="bg-psych"><div className="bk-shine"></div></div>
              </div>
            </div>
          </div>
        </div>
        {/* Float badges */}
        <div className="feat-float" style={{ top: '20px', right: '-40px', zIndex: '3' }}>
          <div className="feat-float-title">OFFLINE MODE</div>
          <div className="feat-float-val">✓ Siap</div>
          <div className="feat-float-sub">127 halaman tersimpan</div>
        </div>
        <div className="feat-float" style={{ bottom: '40px', left: '-50px', zIndex: '3' }}>
          <div className="feat-float-title">SYNC STATUS</div>
          <div className="feat-float-val">🔄 Hal. 89</div>
          <div className="feat-float-sub">2 perangkat sinkron</div>
        </div>
      </div>
    </div>
  </div>

  <div style={{ borderBottom: '6px solid var(--forest-d)' }}></div>

  {/* Feature 2: AI Companion */}
  <div className="feature-row reverse">
    <div className="feature-text">
      <div className="feature-label">🤖 Kecerdasan Buatan</div>
      <h2 className="feature-h2">AI yang Mengenal<br />Selera Bacamu</h2>
      <p className="feature-p">BUKOO AI Companion bukan sekadar merekomendasikan buku — ia membangun peta baca personal, merangkum bab, dan menjawab pertanyaan tentang buku yang kamu baca.</p>
      <div className="feature-bullets">
        <div className="feature-bullet"><div className="bullet-icon">✓</div><span>Rekomendasi personal berdasarkan riwayat dan mood baca</span></div>
        <div className="feature-bullet"><div className="bullet-icon">✓</div><span>Rangkuman bab otomatis dan insight kunci dari setiap buku</span></div>
        <div className="feature-bullet"><div className="bullet-icon">✓</div><span>Peta baca: AI kurasi jalur membaca sesuai tujuanmu</span></div>
      </div>
    </div>
    <div className="feature-visual">
      <div style={{ position: 'relative' }}>
        <div style={{ background: '#0A1018', border: '1px solid rgba(0,201,167,.15)', borderRadius: '16px', padding: '24px', maxWidth: '340px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,var(--teal),var(--teal-d))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🤖</div>
            <div><div style={{ fontSize: '12px', fontWeight: '700', color: '#fff' }}>BUKOO AI</div><div style={{ fontSize: '10px', color: 'var(--teal)' }}>● Online · Analisis buku selesai</div></div>
          </div>
          {/* AI chat bubbles */}
          <div style={{ background: 'rgba(0,201,167,.08)', border: '1px solid rgba(0,201,167,.12)', borderRadius: '10px', padding: '12px', marginBottom: '8px' }}>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.7)', lineHeight: '1.6' }}>Berdasarkan kebiasaan bacamu, kamu akan selesai <strong style={{ color: '#fff' }}>Atomic Habits</strong> dalam 3 hari. Setelah itu, aku rekomendasikan <strong style={{ color: '#fff' }}>Deep Work</strong> karena cocok dengan profilmu. 📚</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,.04)', borderRadius: '10px', padding: '12px', marginBottom: '14px', textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.6)', lineHeight: '1.6' }}>Apa inti dari bab 4 Atomic Habits?</div>
          </div>
          <div style={{ background: 'rgba(0,201,167,.08)', border: '1px solid rgba(0,201,167,.12)', borderRadius: '10px', padding: '12px', marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.7)', lineHeight: '1.6' }}><strong style={{ color: 'var(--teal)' }}>Bab 4 — Hukum Ketiga:</strong> "Buat Itu Mudah". Clear menjelaskan bahwa frekuensi lebih penting dari waktu. 20 latihan singkat &gt; 1 latihan panjang. <span style={{ color: 'var(--amber)' }}>💡 Insight kunci: lingkungan = motivasi.</span></div>
          </div>
          {/* Input bar */}
          <div style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '8px', height: '38px', display: 'flex', alignItems: 'center', padding: '0 12px', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,.25)' }}>Tanya tentang buku ini...</span>
            <span style={{ fontSize: '14px', color: 'var(--teal)' }}>↑</span>
          </div>
        </div>
        <div className="feat-float" style={{ top: '-20px', right: '-20px', zIndex: '3' }}>
          <div className="feat-float-title">MATCH SCORE</div>
          <div className="feat-float-val" style={{ color: 'var(--teal)' }}>98%</div>
          <div className="feat-float-sub">Cocok dengan profilmu</div>
        </div>
      </div>
    </div>
  </div>

  <div style={{ borderBottom: '6px solid var(--forest-d)' }}></div>

  {/* Feature 3: Komunitas */}
  <div className="feature-row">
    <div className="feature-text">
      <div className="feature-label">👥 Social Reading</div>
      <h2 className="feature-h2">Membaca Lebih<br />Menyenangkan Bersama</h2>
      <p className="feature-p">Bergabunglah dengan jutaan pembaca Indonesia. Ikut tantangan baca, bagikan insight, dan temukan teman baca yang punya selera serupa.</p>
      <div className="feature-bullets">
        <div className="feature-bullet"><div className="bullet-icon">✓</div><span>Club Baca virtual & tantangan membaca bulanan</span></div>
        <div className="feature-bullet"><div className="bullet-icon">✓</div><span>Bagikan highlight, catatan, dan review langsung dari buku</span></div>
        <div className="feature-bullet"><div className="bullet-icon">✓</div><span>Profil pembaca dengan streak, badge, dan statistik personal</span></div>
      </div>
    </div>
    <div className="feature-visual">
      <div style={{ position: 'relative', maxWidth: '340px', margin: '0 auto' }}>
        {/* Community feed mock */}
        <div style={{ background: '#0A1018', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>📚 Baca Bareng Februari</div>
            <div style={{ background: 'var(--amber)', color: 'var(--forest-dd)', fontSize: '9px', fontWeight: '700', padding: '3px 9px', borderRadius: '3px' }}>AKTIF</div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: '48px', height: '68px', borderRadius: '5px', overflow: 'hidden', flexShrink: '0' }} className="bg-atomic"><div className="bk-shine"></div><div style={{ position: 'absolute', inset: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: '16px', height: '16px', border: '1.5px solid rgba(78,205,196,.9)', borderRadius: '50%' }}></div></div></div>
            <div style={{ flex: '1' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff', marginBottom: '2px' }}>Atomic Habits</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,.4)', marginBottom: '8px' }}>James Clear</div>
              <div style={{ fontSize: '9px', color: 'var(--amber)', marginBottom: '4px' }}>4.201 pembaca bergabung</div>
              <div style={{ height: '5px', background: 'rgba(255,255,255,.08)', borderRadius: '3px', overflow: 'hidden' }}><div style={{ width: '62%', height: '100%', background: 'var(--amber)' }}></div></div>
              <div style={{ fontSize: '8.5px', color: 'rgba(255,255,255,.3)', marginTop: '2px' }}>62% komunitas selesai</div>
            </div>
          </div>
          {/* Avatars */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
            <div style={{ display: 'flex' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg,var(--amber),#8B6000)', border: '2px solid #0A1018', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '700', color: '#fff', marginRight: '-8px' }}>A</div>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg,var(--teal),#006B5A)', border: '2px solid #0A1018', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '700', color: '#fff', marginRight: '-8px' }}>R</div>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg,#8B2FC9,#4A0D80)', border: '2px solid #0A1018', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '700', color: '#fff', marginRight: '-8px' }}>D</div>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,.1)', border: '2px solid #0A1018', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', color: 'rgba(255,255,255,.5)' }}>+</div>
            </div>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,.4)' }}>Andi, Rara, Dinda +4.197 lainnya</span>
          </div>
          {/* Post */}
          <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.05)', borderRadius: '8px', padding: '10px' }}>
            <div style={{ fontSize: '10px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>Andi S. · 2j lalu</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,.6)', lineHeight: '1.5', marginBottom: '6px' }}>"Bab habit stacking benar-benar game changer! 🔥 Siapa yang udah coba?"</div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '9px', color: 'rgba(255,255,255,.3)' }}>
              <span>❤️ 24</span><span>💬 6</span><span>🔖 Simpan</span>
            </div>
          </div>
        </div>
        <div className="feat-float" style={{ bottom: '-20px', right: '-30px', zIndex: '3' }}>
          <div className="feat-float-title">KOMUNITAS AKTIF</div>
          <div className="feat-float-val" style={{ color: 'var(--amber)' }}>4.201</div>
          <div className="feat-float-sub">pembaca bulan ini</div>
        </div>
      </div>
    </div>
  </div>
</section>

<div style={{ borderBottom: '6px solid var(--forest-d)' }}></div>


{/* ══════════════════════════════════════
     PUBLISHER LOGOS
══════════════════════════════════════ */}
<div className="publisher-section">
  <div className="publisher-label">500+ Penerbit Terpercaya dari Seluruh Dunia</div>
  <div className="publisher-logos">
    <div className="pub-logo">Gramedia Pustaka</div>
    <div className="pub-logo">Mizan Group</div>
    <div className="pub-logo">Bentang Pustaka</div>
    <div className="pub-logo">Erlangga</div>
    <div className="pub-logo">Buku Kompas</div>
    <div className="pub-logo">Penguin Random</div>
    <div className="pub-logo">HarperCollins</div>
    <div className="pub-logo">Simon &amp; Schuster</div>
  </div>
</div>


{/* ══════════════════════════════════════
     PRICING
══════════════════════════════════════ */}
<section className="pricing-section" id="pricing">
  <div className="pricing-header">
    <span className="s-eyebrow" style={{ display: 'block', textAlign: 'center' }}>Harga &amp; Paket</span>
    <h2 className="pricing-h2">Pilih Paket yang Tepat<br />untuk Kamu</h2>
    <p className="pricing-sub">Mulai gratis, upgrade kapan saja. Tidak ada biaya tersembunyi.</p>
  </div>

  <div className="pricing-grid">
    {/* FREE */}
    <div className="price-card">
      <div className="price-tier-num">TIER 0</div>
      <div className="price-name">Bebas</div>
      <div className="price-target">Untuk pemula</div>
      <div className="price-amount price-amount-gratis">Gratis</div>
      <div className="price-period">Selamanya</div>
      <ul className="price-features">
        <li className="pf-item"><span className="pf-check">✓</span>50 buku rotasi bulanan</li>
        <li className="pf-item"><span className="pf-check">✓</span>Preview 1 bab semua koleksi</li>
        <li className="pf-item"><span className="pf-check">✓</span>Akses komunitas dasar</li>
        <li className="pf-item"><span className="pf-cross">✗</span>Ada iklan ringan</li>
        <li className="pf-item"><span className="pf-cross">✗</span>Audiobook</li>
        <li className="pf-item"><span className="pf-cross">✗</span>Offline reading</li>
      </ul>
      <button className="price-cta-btn price-cta-outline">Mulai Gratis</button>
    </div>

    {/* BACA */}
    <div className="price-card">
      <div className="price-tier-num">TIER 1</div>
      <div className="price-name">Baca</div>
      <div className="price-target">Pelajar &amp; Mahasiswa</div>
      <div className="price-amount price-amount-paid">19.900</div>
      <div className="price-period">per bulan</div>
      <ul className="price-features">
        <li className="pf-item"><span className="pf-check">✓</span>50.000+ judul pilihan</li>
        <li className="pf-item"><span className="pf-check">✓</span>Koleksi lokal penuh</li>
        <li className="pf-item"><span className="pf-check">✓</span>Offline 10 judul</li>
        <li className="pf-item"><span className="pf-check">✓</span>Tanpa iklan</li>
        <li className="pf-item"><span className="pf-cross">✗</span>Audiobook</li>
        <li className="pf-item"><span className="pf-cross">✗</span>AI Companion</li>
      </ul>
      <button className="price-cta-btn price-cta-outline">Mulai Sekarang</button>
    </div>

    {/* PLUS (featured) */}
    <div className="price-card featured">
      <div className="price-pop-badge">✦ Terpopuler</div>
      <div className="price-tier-num">TIER 2</div>
      <div className="price-name">Plus</div>
      <div className="price-target">Profesional muda</div>
      <div className="price-amount price-amount-paid">49.900</div>
      <div className="price-period">per bulan</div>
      <ul className="price-features">
        <li className="pf-item"><span className="pf-check">✓</span>200.000+ judul global</li>
        <li className="pf-item"><span className="pf-check">✓</span>Audiobook Indonesia</li>
        <li className="pf-item"><span className="pf-check">✓</span>Offline unlimited</li>
        <li className="pf-item"><span className="pf-check">✓</span>AI Rekomendasi</li>
        <li className="pf-item"><span className="pf-check">✓</span>Social Reading penuh</li>
        <li className="pf-item"><span className="pf-cross">✗</span>Kredit buku terbaru</li>
      </ul>
      <button className="price-cta-btn price-cta-filled">Coba 7 Hari Gratis →</button>
    </div>

    {/* PREMIUM */}
    <div className="price-card">
      <div className="price-tier-num">TIER 3</div>
      <div className="price-name">Premium</div>
      <div className="price-target">Pembaca serius</div>
      <div className="price-amount price-amount-paid">79.900</div>
      <div className="price-period">per bulan</div>
      <ul className="price-features">
        <li className="pf-item"><span className="pf-check">✓</span>Seluruh katalog global</li>
        <li className="pf-item"><span className="pf-check">✓</span>3 kredit buku terbaru</li>
        <li className="pf-item"><span className="pf-check">✓</span>AI Companion penuh</li>
        <li className="pf-item"><span className="pf-check">✓</span>BUKOO Originals</li>
        <li className="pf-item"><span className="pf-check">✓</span>Majalah &amp; jurnal</li>
        <li className="pf-item"><span className="pf-check">✓</span>Priority support</li>
      </ul>
      <button className="price-cta-btn price-cta-outline">Mulai Sekarang</button>
    </div>

    {/* KELUARGA */}
    <div className="price-card">
      <div className="price-tier-num">TIER 4</div>
      <div className="price-name">Keluarga</div>
      <div className="price-target">5 akun · Hemat 40%</div>
      <div className="price-amount price-amount-paid">99.900</div>
      <div className="price-period">per bulan · 5 akun</div>
      <ul className="price-features">
        <li className="pf-item"><span className="pf-check">✓</span>Semua fitur Premium</li>
        <li className="pf-item"><span className="pf-check">✓</span>5 profil terpisah</li>
        <li className="pf-item"><span className="pf-check">✓</span>Konten anak</li>
        <li className="pf-item"><span className="pf-check">✓</span>Parental control</li>
        <li className="pf-item"><span className="pf-check">✓</span>Rak buku keluarga</li>
        <li className="pf-item"><span className="pf-check">✓</span>Hemat vs 5× Premium</li>
      </ul>
      <button className="price-cta-btn price-cta-outline">Mulai Sekarang</button>
    </div>
  </div>

  <p className="pricing-note">Semua paket dilengkapi 7 hari percobaan gratis · Batalkan kapan saja · Tanpa kartu kredit untuk mulai</p>
</section>


{/* ══════════════════════════════════════
     TESTIMONIALS
══════════════════════════════════════ */}
<section className="testi-section">
  <div className="text-center">
    <span className="s-eyebrow">Apa Kata Mereka</span>
    <h2 className="s-h2">Jutaan Pembaca<br />Sudah Merasakan Manfaatnya</h2>
  </div>

  <div className="testi-grid">
    <div className="testi-card">
      <div className="testi-quote-icon">"</div>
      <p className="testi-text">BUKOO benar-benar mengubah cara saya membaca. Dulu beli buku mahal dan habis dibaca sekali. Sekarang saya bisa baca 3–4 buku per bulan dengan harga segelas kopi kekinian. AI Companion-nya bikin saya temukan buku yang tadinya tidak pernah terpikirkan!</p>
      <div className="testi-author">
        <div className="testi-avatar" style={{ background: 'linear-gradient(135deg,var(--amber),#8B6000)' }}>A</div>
        <div>
          <div className="testi-name">Andi Setiawan</div>
          <div className="testi-role">Software Engineer · Jakarta</div>
          <div className="testi-stars">★★★★★</div>
        </div>
      </div>
    </div>

    <div className="testi-card" style={{ borderColor: 'rgba(201,149,42,.25)' }}>
      <div className="testi-quote-icon">"</div>
      <p className="testi-text">Sebagai mahasiswa, dulu saya selalu kesulitan akses buku akademik yang mahal. Dengan BUKOO tier Baca seharga Rp 19.900, saya bisa baca buku-buku yang biasanya ratusan ribu. Fitur komunitas juga seru, bisa diskusi bareng pembaca lain!</p>
      <div className="testi-author">
        <div className="testi-avatar" style={{ background: 'linear-gradient(135deg,var(--teal),#006B5A)' }}>R</div>
        <div>
          <div className="testi-name">Rara Puspita</div>
          <div className="testi-role">Mahasiswi Sastra · Yogyakarta</div>
          <div className="testi-stars">★★★★★</div>
        </div>
      </div>
    </div>

    <div className="testi-card">
      <div className="testi-quote-icon">"</div>
      <p className="testi-text">Koleksi buku Indonesia-nya luar biasa lengkap! Dari Pramoedya sampai penulis-penulis baru yang belum saya kenal. Fitur offline-nya sangat berguna saat saya traveling ke daerah yang sinyal susah. BUKOO Originals juga fresh banget kontennya!</p>
      <div className="testi-author">
        <div className="testi-avatar" style={{ background: 'linear-gradient(135deg,#8B2FC9,#4A0D80)' }}>D</div>
        <div>
          <div className="testi-name">Dinda Maharani</div>
          <div className="testi-role">Content Creator · Bandung</div>
          <div className="testi-stars">★★★★★</div>
        </div>
      </div>
    </div>
  </div>
</section>


{/* ══════════════════════════════════════
     FAQ
══════════════════════════════════════ */}
<section className="faq-section">
  <div className="text-center" style={{ marginBottom: '48px' }}>
    <span className="s-eyebrow">Pertanyaan Umum</span>
    <h2 className="s-h2">Ada yang Ingin<br />Kamu Tanyakan?</h2>
  </div>

  <div className="faq-item open">
    <button className="faq-q" onClick={(e) => { const item = e.currentTarget.parentElement; if (item) { const isOpen = item.classList.contains("open"); document.querySelectorAll(".faq-item").forEach(i => i.classList.remove("open")); if (!isOpen) item.classList.add("open"); } }} >
      Apa itu BUKOO dan bagaimana cara kerjanya?
      <div className="faq-icon">+</div>
    </button>
    <div className="faq-a">BUKOO adalah platform langganan buku digital yang memungkinkan kamu mengakses 200.000+ judul buku dari ratusan penerbit Indonesia dan internasional. Cukup bayar satu biaya langganan bulanan, dan nikmati bacaan sepuasnya — mirip Netflix tapi untuk buku. Tersedia di iOS, Android, dan web browser.</div>
  </div>

  <div className="faq-item">
    <button className="faq-q" onClick={(e) => { const item = e.currentTarget.parentElement; if (item) { const isOpen = item.classList.contains("open"); document.querySelectorAll(".faq-item").forEach(i => i.classList.remove("open")); if (!isOpen) item.classList.add("open"); } }} >
      Apakah saya bisa membaca offline tanpa internet?
      <div className="faq-icon">+</div>
    </button>
    <div className="faq-a">Ya! Semua tier berbayar mendukung offline reading. Tier Baca (Rp 19.900) memungkinkan download hingga 10 judul, sementara tier Plus ke atas mendapatkan offline unlimited tanpa batasan. Sangat cocok untuk daerah dengan koneksi internet tidak stabil.</div>
  </div>

  <div className="faq-item">
    <button className="faq-q" onClick={(e) => { const item = e.currentTarget.parentElement; if (item) { const isOpen = item.classList.contains("open"); document.querySelectorAll(".faq-item").forEach(i => i.classList.remove("open")); if (!isOpen) item.classList.add("open"); } }} >
      Apakah ada kontrak jangka panjang?
      <div className="faq-icon">+</div>
    </button>
    <div className="faq-a">Tidak sama sekali. BUKOO menggunakan model langganan bulanan tanpa kontrak. Kamu bisa upgrade, downgrade, atau membatalkan langganan kapan saja tanpa biaya penalti. Pembatalan berlaku di akhir periode billing yang sudah dibayar.</div>
  </div>

  <div className="faq-item">
    <button className="faq-q" onClick={(e) => { const item = e.currentTarget.parentElement; if (item) { const isOpen = item.classList.contains("open"); document.querySelectorAll(".faq-item").forEach(i => i.classList.remove("open")); if (!isOpen) item.classList.add("open"); } }} >
      Buku apa saja yang tersedia di BUKOO?
      <div className="faq-icon">+</div>
    </button>
    <div className="faq-a">BUKOO memiliki 200.000+ judul mencakup berbagai genre: self-development, fiksi dan sastra Indonesia, bisnis dan keuangan, sains, akademik, hingga buku anak. Kami bermitra dengan 500+ penerbit termasuk Gramedia Pustaka Utama, Mizan, Bentang, Penguin Random House, dan banyak lagi. BUKOO Originals menambahkan konten eksklusif dari penulis-penulis terbaik Indonesia.</div>
  </div>

  <div className="faq-item">
    <button className="faq-q" onClick={(e) => { const item = e.currentTarget.parentElement; if (item) { const isOpen = item.classList.contains("open"); document.querySelectorAll(".faq-item").forEach(i => i.classList.remove("open")); if (!isOpen) item.classList.add("open"); } }} >
      Apa itu BUKOO AI Companion?
      <div className="faq-icon">+</div>
    </button>
    <div className="faq-a">AI Companion adalah asisten membaca personal yang ada di tier Plus ke atas. Ia bisa merekomendasikan buku sesuai selera, membuat rangkuman bab, menjawab pertanyaan tentang isi buku, dan membangun "Peta Baca" — jalur membaca yang dikurasi AI berdasarkan tujuan dan minatmu.</div>
  </div>

  <div className="faq-item">
    <button className="faq-q" onClick={(e) => { const item = e.currentTarget.parentElement; if (item) { const isOpen = item.classList.contains("open"); document.querySelectorAll(".faq-item").forEach(i => i.classList.remove("open")); if (!isOpen) item.classList.add("open"); } }} >
      Bagaimana sistem pembayaran BUKOO?
      <div className="faq-icon">+</div>
    </button>
    <div className="faq-a">BUKOO menerima berbagai metode pembayaran yang umum di Indonesia: kartu kredit/debit (Visa, Mastercard), transfer bank, GoPay, OVO, Dana, ShopeePay, dan Indomaret/Alfamart. Semua transaksi dalam Rupiah — tidak ada biaya kurs dolar!</div>
  </div>
</section>


{/* ══════════════════════════════════════
     FINAL CTA
══════════════════════════════════════ */}
<section className="cta-final">
  <div className="cta-final-bg"></div>
  <h2 className="cta-h2">Mulai Petualangan<br />Membacamu <em>Hari Ini</em></h2>
  <p className="cta-sub">Bergabung dengan jutaan pembaca Indonesia. 7 hari pertama gratis — tidak perlu kartu kredit.</p>
  <div className="cta-input-row">
    <input className="hero-input" type="email" placeholder="Masukkan email kamu" />
    <button className="hero-btn">Mulai Gratis →</button>
  </div>
  <div className="cta-fine">Dengan mendaftar, kamu menyetujui Syarat &amp; Ketentuan dan Kebijakan Privasi BUKOO</div>
</section>


{/* ══════════════════════════════════════
     FOOTER
══════════════════════════════════════ */}
    </>
  )
}
