import Link from 'next/link';

export default function NewsroomPage() {
  return (
    <>
      {/* Hero */}
      <section className="phero">
        <div className="phero-bg"></div>
        <div className="phero-grid"></div>
        <div className="wrap">
          <span className="eyebrow">Perusahaan · Newsroom</span>
          <h1 className="ph-h1">Kabar terbaru <em>dari BUKOO</em></h1>
          <p className="ph-lead">
            Pengumuman resmi, siaran pers, dan tonggak perjalanan kami menuju Indonesia Membaca Lagi. Untuk permintaan media, hubungi newsroom@bukoo.id.
          </p>
          <div className="hero-ctas">
            <a href="mailto:newsroom@bukoo.id" className="btn-cta btn-lg">Hubungi media relations →</a>
          </div>
        </div>
      </section>

      {/* Press Releases */}
      <section className="sec">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Siaran Pers &amp; Pengumuman</span>
            <h2 className="h2">Perjalanan <em>kami</em></h2>
          </div>
          <div className="grid2">
            <div className="listcard">
              <div className="meta"><span>Sep 2026</span><span>·</span><span>Peluncuran</span></div>
              <h4>BUKOO resmi meluncur untuk publik Indonesia</h4>
              <p>Platform langganan buku digital dengan 2.000+ judul kurasi dan model royalti adil untuk penerbit lokal mulai dapat diakses.</p>
            </div>
            <div className="listcard">
              <div className="meta"><span>Ags 2026</span><span>·</span><span>Kemitraan</span></div>
              <h4>BUKOO membuka program kemitraan penerbit</h4>
              <p>Undangan kerjasama bagi penerbit Indonesia dengan bagi hasil 60–70% dan dashboard data pembaca real-time.</p>
            </div>
            <div className="listcard">
              <div className="meta"><span>Jul 2026</span><span>·</span><span>Produk</span></div>
              <h4>BUKOO Originals: ruang bagi suara baru Indonesia</h4>
              <p>Program penerbitan karya orisinal dengan mentoring editor senior dan promosi peluncuran khusus.</p>
            </div>
            <div className="listcard">
              <div className="meta"><span>Jun 2026</span><span>·</span><span>Misi</span></div>
              <h4>&quot;Indonesia Membaca Lagi&quot; — visi literasi BUKOO</h4>
              <p>Komitmen menjadikan akses buku sebagai hak dasar, bukan hak istimewa, bagi seluruh masyarakat Indonesia.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Media Kit Callout */}
      <section className="sec alt">
        <div className="wrap">
          <div className="callout">
            <b>Untuk jurnalis &amp; media:</b> kami menyediakan media kit, logo, dan wawancara. Hubungi <a href="mailto:newsroom@bukoo.id" style={{ color: 'var(--amber)' }}>newsroom@bukoo.id</a> — kami senang berbagi cerita tentang literasi Indonesia.
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="sec">
        <div className="wrap">
          <div className="cband">
            <h3>Ingin meliput BUKOO?</h3>
            <p>Tim media relations kami siap membantu dengan materi &amp; narasumber.</p>
            <a href="mailto:newsroom@bukoo.id" className="btn-cta btn-lg">Email newsroom@bukoo.id</a>
          </div>
        </div>
      </section>
    </>
  );
}
