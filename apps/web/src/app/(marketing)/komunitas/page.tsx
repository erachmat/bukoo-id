import { CallToAction } from '@/components/marketing/CallToAction';

export default function KomunitasPage() {
  return (
    <>
      {/* ══════════════════════════════════════
     KOMUNITAS HERO
══════════════════════════════════════ */}
      <section style={{
        padding: '160px 24px 60px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow */}
        <div style={{
          position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)',
          width: '600px', height: '400px', background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)',
          zIndex: 0, pointerEvents: 'none'
        }}></div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: '52px',
            fontWeight: '800',
            color: '#fff',
            lineHeight: '1.2',
            letterSpacing: '-1.5px',
            marginBottom: '16px'
          }}>
            Membaca Tak Lagi <em style={{ color: '#A855F7', fontStyle: 'normal' }}>Sepi</em>
          </h1>
          <p style={{
            fontSize: '18px',
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '40px',
            lineHeight: '1.6',
            maxWidth: '500px',
            margin: '0 auto'
          }}>
            Bergabunglah dengan ratusan ribu pembaca Indonesia. Diskusikan buku favoritmu, ikuti klub baca, dan temukan teman sefrekuensi.
          </p>

          <div className="komunitas-hero-btns">
            <button className="price-cta-btn price-cta-filled" style={{ background: '#A855F7', color: '#fff', border: 'none', width: 'auto', padding: '12px 32px' }}>
              Gabung Komunitas
            </button>
            <button className="price-cta-btn price-cta-outline" style={{ width: 'auto', padding: '12px 32px', borderColor: 'rgba(168,85,247,0.5)', color: '#A855F7' }}>
              Jelajahi Klub
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
     MAIN LAYOUT GRID
══════════════════════════════════════ */}
      <section style={{ padding: '40px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="komunitas-main-grid">

          {/* LEFT: Live Feed */}
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#fff', marginBottom: '24px' }}>🔴 Live Feed</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Post 1 */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg,var(--teal),#006B5A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: '#fff' }}>D</div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff' }}>Dinda Maharani</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Baru saja menyelesaikan sebuah buku</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '16px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '48px', height: '68px', borderRadius: '4px', background: 'var(--teal)' }} className="bg-laut"><div className="bk-shine"></div></div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>Laut Bercerita</div>
                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>⭐⭐⭐⭐⭐ 5/5</div>
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', marginTop: '8px', fontStyle: 'italic' }}>&quot;Buku yang sangat mengharukan. Membuka mata tentang sejarah gelap yang tak boleh dilupakan.&quot;</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>
                  <span style={{ cursor: 'pointer' }}>❤️ 124 Suka</span>
                  <span style={{ cursor: 'pointer' }}>💬 12 Komentar</span>
                </div>
              </div>

              {/* Post 2 */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg,var(--amber),#8B6000)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: '#fff' }}>A</div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff' }}>Andi Setiawan</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Membagikan highlight dari buku</div>
                  </div>
                </div>
                <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.9)', lineHeight: '1.6', marginBottom: '16px', borderLeft: '3px solid var(--amber)', paddingLeft: '16px' }}>
                  &quot;You do not rise to the level of your goals. You fall to the level of your systems.&quot;
                </p>
                <div style={{ fontSize: '13px', color: 'var(--amber)', fontWeight: '600', marginBottom: '16px' }}>— Atomic Habits, Halaman 42</div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>
                  <span style={{ cursor: 'pointer' }}>❤️ 89 Suka</span>
                  <span style={{ cursor: 'pointer' }}>💬 4 Komentar</span>
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT: Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

            {/* Active Clubs */}
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>Klub Baca Aktif</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff' }}>📚 Fiksi Klasik ID</div>
                    <div style={{ fontSize: '11px', background: 'rgba(168,85,247,0.2)', color: '#A855F7', padding: '2px 8px', borderRadius: '10px', fontWeight: '700' }}>AKTIF</div>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>Sedang membaca: Bumi Manusia</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'red', border: '2px solid var(--surface)' }}></div>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'blue', border: '2px solid var(--surface)', marginLeft: '-8px' }}></div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '8px' }}>+4.2k Member</div>
                    </div>
                    <button style={{ background: 'transparent', border: '1px solid var(--border)', color: '#fff', borderRadius: '6px', padding: '4px 12px', fontSize: '12px', cursor: 'pointer' }}>Gabung</button>
                  </div>
                </div>

                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff' }}>💼 1% Better Every Day</div>
                    <div style={{ fontSize: '11px', background: 'rgba(168,85,247,0.2)', color: '#A855F7', padding: '2px 8px', borderRadius: '10px', fontWeight: '700' }}>AKTIF</div>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>Sedang membaca: Atomic Habits</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'green', border: '2px solid var(--surface)' }}></div>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'yellow', border: '2px solid var(--surface)', marginLeft: '-8px' }}></div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '8px' }}>+8.9k Member</div>
                    </div>
                    <button style={{ background: 'transparent', border: '1px solid var(--border)', color: '#fff', borderRadius: '6px', padding: '4px 12px', fontSize: '12px', cursor: 'pointer' }}>Gabung</button>
                  </div>
                </div>

              </div>
            </div>

            {/* Leaderboard */}
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>🏆 Top Reviewer Minggu Ini</h3>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--amber)', width: '20px' }}>1</div>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#8B2FC9,#4A0D80)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: '#fff', fontSize: '14px' }}>D</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>Dinda Maharani</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>4 Review</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: '#C0C0C0', width: '20px' }}>2</div>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,var(--teal),#006B5A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: '#fff', fontSize: '14px' }}>R</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>Reza Pahlevi</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>3 Review</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '12px' }}>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: '#CD7F32', width: '20px' }}>3</div>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,var(--amber),#8B6000)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: '#fff', fontSize: '14px' }}>A</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>Andi Setiawan</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>2 Review</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
     FINAL CTA
══════════════════════════════════════ */}
      <div style={{ marginTop: '80px' }}>
        <CallToAction />
      </div>
    </>
  );
}
