import Link from 'next/link';

export default function KoleksiPage() {
  return (
    <>
      {/* Subnav */}
      <div className="subnav">
        <div className="subnav-in">
          <span className="subnav-tag">Produk</span>
          <Link href="/koleksi" className="on">Koleksi Buku</Link>
          <Link href="/audiobook">Audiobook</Link>
          <Link href="/originals">BUKOO Originals</Link>
          <Link href="/ai-companion">AI Companion</Link>
          <Link href="/komunitas">Komunitas</Link>
          <Link href="/pricing">Harga &amp; Paket</Link>
        </div>
      </div>

      {/* Hero */}
      <section className="phero">
        <div className="phero-bg"></div>
        <div className="phero-grid"></div>
        <div className="wrap">
          <span className="eyebrow">Produk · Koleksi Buku</span>
          <h1 className="ph-h1">Ribuan judul kurasi, <em>satu langganan</em></h1>
          <p className="ph-lead">
            Lebih dari 2.000 judul pilihan tim editorial BUKOO — dari sastra Indonesia terbaik hingga non-fiksi kontemporer dunia. Bukan katalog acak, tapi koleksi yang dikurasi dengan cinta.
          </p>
          <div className="hero-ctas">
            <Link href="/pricing" className="btn-cta btn-lg">Lihat paket →</Link>
            <Link href="/register" className="btn-ghost btn-lg">Coba gratis</Link>
          </div>
        </div>
      </section>

      {/* Statrow */}
      <section className="sec">
        <div className="wrap">
          <div className="statrow">
            <div className="st">
              <div className="st-n">2.000<small>+</small></div>
              <div className="st-l">Judul kurasi di katalog (target)</div>
            </div>
            <div className="st">
              <div className="st-n">50</div>
              <div className="st-l">Penerbit mitra &amp; target mitra</div>
            </div>
            <div className="st">
              <div className="st-n">8<small>+</small></div>
              <div className="st-l">Genre utama</div>
            </div>
            <div className="st">
              <div className="st-n">100<small>%</small></div>
              <div className="st-l">Lokalisasi Rupiah</div>
            </div>
          </div>
        </div>
      </section>

      {/* Genre Grid */}
      <section className="sec">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Jelajahi Genre</span>
            <h2 className="h2">Koleksi untuk <em>setiap pembaca</em></h2>
            <p className="sec-desc">Apa pun minat baca Anda, ada rak yang menunggu untuk dijelajahi.</p>
          </div>
          <div className="grid3">
            <div className="fcard">
              <div className="ic">📖</div>
              <h4>Sastra Indonesia</h4>
              <p>Laut Bercerita, Bumi Manusia, Gadis Kretek, Laskar Pelangi — karya sastra terbaik bangsa dalam satu rak.</p>
            </div>
            <div className="fcard">
              <div className="ic">🚀</div>
              <h4>Self-development</h4>
              <p>Atomic Habits, Psychology of Money, Deep Work dalam edisi Indonesia — bertumbuh setiap hari.</p>
            </div>
            <div className="fcard">
              <div className="ic">💼</div>
              <h4>Bisnis &amp; Keuangan</h4>
              <p>Wawasan bisnis, investasi, dan karier dari penulis lokal maupun internasional.</p>
            </div>
            <div className="fcard">
              <div className="ic">🔬</div>
              <h4>Sains &amp; Akademik</h4>
              <p>Buku sains populer hingga referensi akademik untuk pelajar &amp; mahasiswa.</p>
            </div>
            <div className="fcard">
              <div className="ic">🧒</div>
              <h4>Anak &amp; Remaja</h4>
              <p>Koleksi yang aman &amp; mendidik, lengkap dengan parental control di tier Keluarga.</p>
            </div>
            <div className="fcard">
              <div className="ic">📜</div>
              <h4>Sejarah &amp; Biografi</h4>
              <p>Kisah tokoh &amp; peristiwa yang membentuk Indonesia dan dunia.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial curation */}
      <section className="sec alt">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Cara Kami Mengkurasi</span>
            <h2 className="h2">Kualitas <em>di atas</em> kuantitas</h2>
          </div>
          <div className="grid3">
            <div className="fcard">
              <div className="ic">🎯</div>
              <h4>Dikurasi, bukan dikumpulkan</h4>
              <p>Setiap buku dipilih tim editorial yang membaca — kualitas selalu di atas kuantitas.</p>
            </div>
            <div className="fcard">
              <div className="ic">🇮🇩</div>
              <h4>Fokus konten lokal</h4>
              <p>Prioritas pada literatur Indonesia &amp; royalti adil untuk penerbit lokal.</p>
            </div>
            <div className="fcard">
              <div className="ic">🔄</div>
              <h4>Selalu bertambah</h4>
              <p>Judul baru masuk rutin dari 50 penerbit mitra &amp; target mitra kami.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="sec">
        <div className="wrap">
          <div className="cband">
            <h3>Mulai jelajahi ribuan judul hari ini</h3>
            <p>Coba gratis 7 hari, tanpa kartu kredit. Batalkan kapan saja.</p>
            <Link href="/pricing" className="btn-cta btn-lg">Lihat semua paket →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
