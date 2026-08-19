import React from 'react';

export function Features() {
  return (
    <>
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
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.7)', lineHeight: '1.6' }}><strong style={{ color: 'var(--teal)' }}>Bab 4 — Hukum Ketiga:</strong> “Buat Itu Mudah”. Clear menjelaskan bahwa frekuensi lebih penting dari waktu. 20 latihan singkat &gt; 1 latihan panjang. <span style={{ color: 'var(--amber)' }}>💡 Insight kunci: lingkungan = motivasi.</span></div>
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
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,.6)', lineHeight: '1.5', marginBottom: '6px' }}>“Bab habit stacking benar-benar game changer! 🔥 Siapa yang udah coba?”</div>
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
    </>
  );
}
