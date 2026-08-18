import Link from 'next/link';

export default function KarirPage() {
  return (
    <>
      {/* Subnav */}
      <div className="subnav">
        <div className="subnav-in">
          <span className="subnav-tag">Perusahaan</span>
          <Link href="/tentang">Tentang BUKOO</Link>
          <Link href="/karir" className="on">Karir</Link>
          <Link href="/newsroom">Newsroom</Link>
          <Link href="/investor-relations">Investor Relations</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/bantuan#kontak">Kontak</Link>
        </div>
      </div>

      {/* Hero */}
      <section className="phero">
        <div className="phero-bg"></div>
        <div className="phero-grid"></div>
        <div className="wrap">
          <span className="eyebrow">Perusahaan · Karir</span>
          <h1 className="ph-h1">Bangun <em>gerakan literasi</em> Indonesia</h1>
          <p className="ph-lead">
            Kami tim kecil dengan misi besar: membuat setiap orang Indonesia bisa membaca tanpa terbebani harga. Jika itu menggerakkan Anda, mari bicara.
          </p>
          <div className="hero-ctas">
            <a href="#posisi" className="btn-cta btn-lg">Lihat posisi terbuka →</a>
          </div>
        </div>
      </section>

      {/* Why BUKOO */}
      <section className="sec">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Kenapa BUKOO</span>
            <h2 className="h2">Kerja yang <em>terasa penting</em></h2>
          </div>
          <div className="grid3">
            <div className="fcard">
              <div className="ic">🎯</div>
              <h4>Misi yang berarti</h4>
              <p>Setiap baris kode &amp; keputusan kami membuka akses buku bagi lebih banyak orang.</p>
            </div>
            <div className="fcard">
              <div className="ic">🚀</div>
              <h4>Tim kecil, dampak besar</h4>
              <p>Ruang untuk berdampak nyata sejak hari pertama, bukan sekrup di mesin raksasa.</p>
            </div>
            <div className="fcard">
              <div className="ic">🌱</div>
              <h4>Tumbuh cepat</h4>
              <p>Bergabung di fase awal berarti tumbuh bersama perusahaan yang sedang membangun.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="sec alt" id="posisi">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Posisi Terbuka</span>
            <h2 className="h2">Peran yang <em>kami cari</em></h2>
            <p className="sec-desc">
              Sebagai startup pra-peluncuran, kebutuhan kami berkembang. Tidak melihat peran Anda? Kirim saja profil Anda ke karir@bukoo.id.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <a href="mailto:karir@bukoo.id?subject=Lamaran%20-%20Backend%20Engineer" className="listcard">
              <div className="job">
                <div>
                  <div className="meta">Engineering</div>
                  <h4>Backend Engineer</h4>
                  <p>Remote / Jakarta</p>
                </div>
                <div className="r">
                  <span className="pill">Full-time</span>
                  <div className="job-type" style={{ marginTop: '8px' }}>Lamar →</div>
                </div>
              </div>
            </a>
            <a href="mailto:karir@bukoo.id?subject=Lamaran%20-%20Mobile%20Engineer%20(Flutter)" className="listcard">
              <div className="job">
                <div>
                  <div className="meta">Engineering</div>
                  <h4>Mobile Engineer (Flutter)</h4>
                  <p>Remote / Jakarta</p>
                </div>
                <div className="r">
                  <span className="pill">Full-time</span>
                  <div className="job-type" style={{ marginTop: '8px' }}>Lamar →</div>
                </div>
              </div>
            </a>
            <a href="mailto:karir@bukoo.id?subject=Lamaran%20-%20Editor%20/%20Kurator%20Konten" className="listcard">
              <div className="job">
                <div>
                  <div className="meta">Editorial</div>
                  <h4>Editor / Kurator Konten</h4>
                  <p>Jakarta</p>
                </div>
                <div className="r">
                  <span className="pill">Full-time</span>
                  <div className="job-type" style={{ marginTop: '8px' }}>Lamar →</div>
                </div>
              </div>
            </a>
            <a href="mailto:karir@bukoo.id?subject=Lamaran%20-%20Publisher%20Relations" className="listcard">
              <div className="job">
                <div>
                  <div className="meta">Kemitraan</div>
                  <h4>Publisher Relations</h4>
                  <p>Jakarta</p>
                </div>
                <div className="r">
                  <span className="pill">Full-time</span>
                  <div className="job-type" style={{ marginTop: '8px' }}>Lamar →</div>
                </div>
              </div>
            </a>
            <a href="mailto:karir@bukoo.id?subject=Lamaran%20-%20Product%20Designer" className="listcard">
              <div className="job">
                <div>
                  <div className="meta">Design</div>
                  <h4>Product Designer</h4>
                  <p>Remote / Jakarta</p>
                </div>
                <div className="r">
                  <span className="pill">Full-time</span>
                  <div className="job-type" style={{ marginTop: '8px' }}>Lamar →</div>
                </div>
              </div>
            </a>
            <a href="mailto:karir@bukoo.id?subject=Lamaran%20-%20Growth%20%26%20Community" className="listcard">
              <div className="job">
                <div>
                  <div className="meta">Marketing</div>
                  <h4>Growth &amp; Community</h4>
                  <p>Jakarta</p>
                </div>
                <div className="r">
                  <span className="pill">Full-time</span>
                  <div className="job-type" style={{ marginTop: '8px' }}>Lamar →</div>
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="sec">
        <div className="wrap">
          <div className="cband">
            <h3>Tidak menemukan peran yang pas?</h3>
            <p>Kami selalu ingin bertemu orang hebat yang percaya pada misi ini. Kirim profil Anda.</p>
            <a href="mailto:karir@bukoo.id" className="btn-cta btn-lg">Email karir@bukoo.id</a>
          </div>
        </div>
      </section>
    </>
  );
}
