import Link from 'next/link';

export default function InvestorRelationsPage() {
  return (
    <>
      {/* Hero */}
      <section className="phero">
        <div className="phero-bg"></div>
        <div className="phero-grid"></div>
        <div className="wrap">
          <span className="eyebrow">Perusahaan · Investor Relations</span>
          <h1 className="ph-h1">Membangun masa depan <em>literasi Indonesia</em></h1>
          <p className="ph-lead">
            BUKOO menyasar pasar 229 juta pengguna internet Indonesia yang belum terlayani platform buku digital lokal berbayar yang kuat. Kami mengundang investor yang sejalan dengan misi untuk tumbuh bersama.
          </p>
          <div className="hero-ctas">
            <a href="mailto:invest@bukoo.id" className="btn-cta btn-lg">Minta materi investor →</a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="sec">
        <div className="wrap">
          <div className="statrow">
            <div className="st">
              <div className="st-n">229<small>Jt</small></div>
              <div className="st-l">Pengguna internet aktif Indonesia</div>
            </div>
            <div className="st">
              <div className="st-n">72<small>%</small></div>
              <div className="st-l">Lonjakan minat baca Gen Z (BPS 2024)</div>
            </div>
            <div className="st">
              <div className="st-n">Rp0</div>
              <div className="st-l">Kompetitor lokal berbayar yang kuat</div>
            </div>
            <div className="st">
              <div className="st-n">300<small>%</small></div>
              <div className="st-l">Pertumbuhan penjualan buku Gramedia e-commerce 2025</div>
            </div>
          </div>
        </div>
      </section>

      {/* Investment Thesis */}
      <section className="sec alt">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Tesis Investasi</span>
            <h2 className="h2">Kenapa <em>sekarang</em></h2>
          </div>
          <div className="grid3">
            <div className="fcard">
              <div className="ic">📈</div>
              <h4>Pasar yang matang</h4>
              <p>Populasi muda melek digital, smartphone di mana-mana, minat baca naik — belum ada yang memanen.</p>
            </div>
            <div className="fcard">
              <div className="ic">🏰</div>
              <h4>Moat yang dibangun</h4>
              <p>Eksklusivitas penerbit lokal, konten Originals, efek jaringan data, &amp; potensi kemitraan pemerintah.</p>
            </div>
            <div className="fcard">
              <div className="ic">🔍</div>
              <h4>Transparansi radikal</h4>
              <p>Kami mengelola bisnis dengan data yang tersumber &amp; berlabel — prinsip yang sama kami terapkan ke investor.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Notice */}
      <section className="sec">
        <div className="wrap">
          <div className="disc">
            <b>Catatan.</b> Detail putaran pendanaan, valuasi, proyeksi keuangan, dan struktur kepemilikan bersifat rahasia dan dibagikan langsung kepada investor terkualifikasi melalui materi khusus. Hubungi <a href="mailto:invest@bukoo.id" style={{ color: 'var(--amber)' }}>invest@bukoo.id</a> untuk mengaksesnya. Seluruh proyeksi disajikan sebagai asumsi, bukan jaminan.
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="sec">
        <div className="wrap">
          <div className="cband">
            <h3>Tertarik berinvestasi di BUKOO?</h3>
            <p>Minta deck investor &amp; jadwalkan diskusi dengan tim pendiri kami.</p>
            <a href="mailto:invest@bukoo.id" className="btn-cta btn-lg">Email invest@bukoo.id</a>
          </div>
        </div>
      </section>
    </>
  );
}
