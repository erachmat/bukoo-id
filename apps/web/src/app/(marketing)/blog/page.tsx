import Link from 'next/link';

export default function BlogPage() {
  return (
    <>
      {/* Hero */}
      <section className="phero">
        <div className="phero-bg"></div>
        <div className="phero-grid"></div>
        <div className="wrap">
          <span className="eyebrow">Perusahaan · Blog</span>
          <h1 className="ph-h1">Cerita, tips, &amp; <em>wawasan membaca</em></h1>
          <p className="ph-lead">
            Rekomendasi buku, kebiasaan membaca, sorotan penulis Indonesia, dan pemikiran tentang literasi. Ditulis untuk Anda yang percaya membaca mengubah hidup.
          </p>
        </div>
      </section>

      {/* Articles */}
      <section className="sec">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Artikel Terbaru</span>
            <h2 className="h2">Bacaan <em>untuk pembaca</em></h2>
          </div>
          <div className="grid2">
            <div className="listcard">
              <div className="meta"><span>Rekomendasi</span><span>·</span><span>Ags 2026</span></div>
              <h4>7 Sastra Indonesia yang Wajib Dibaca Sekali Seumur Hidup</h4>
              <p>Dari Bumi Manusia sampai Laut Bercerita — daftar karya yang membentuk cara kita memandang bangsa sendiri.</p>
              <span className="more">Baca artikel →</span>
            </div>
            <div className="listcard">
              <div className="meta"><span>Kebiasaan</span><span>·</span><span>Ags 2026</span></div>
              <h4>Cara Membangun Kebiasaan Membaca 20 Menit Sehari</h4>
              <p>Trik sederhana berbasis sains untuk menjadikan membaca bagian rutin harian, bahkan di jadwal tersibuk.</p>
              <span className="more">Baca artikel →</span>
            </div>
            <div className="listcard">
              <div className="meta"><span>Literasi</span><span>·</span><span>Jul 2026</span></div>
              <h4>Kenapa Akses Buku Adalah Isu Keadilan</h4>
              <p>Menelisik hubungan antara harga buku, kesenjangan, dan mengapa akses membaca penting bagi semua.</p>
              <span className="more">Baca artikel →</span>
            </div>
            <div className="listcard">
              <div className="meta"><span>Penulis</span><span>·</span><span>Jul 2026</span></div>
              <h4>Mengenal Suara Baru dalam BUKOO Originals</h4>
              <p>Sorotan penulis Indonesia yang karyanya lahir dan tumbuh bersama komunitas pembaca BUKOO.</p>
              <span className="more">Baca artikel →</span>
            </div>
            <div className="listcard">
              <div className="meta"><span>Tips</span><span>·</span><span>Jun 2026</span></div>
              <h4>Digital vs Fisik: Kenapa Anda Tidak Harus Memilih</h4>
              <p>Bagaimana membaca digital justru bisa memperkaya koleksi buku fisik yang Anda cintai.</p>
              <span className="more">Baca artikel →</span>
            </div>
            <div className="listcard">
              <div className="meta"><span>Komunitas</span><span>·</span><span>Jun 2026</span></div>
              <h4>Serunya Ikut Klub Baca: Panduan untuk Pemula</h4>
              <p>Cara memulai atau bergabung klub baca dan menjadikan membaca aktivitas sosial yang menyenangkan.</p>
              <span className="more">Baca artikel →</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="sec">
        <div className="wrap">
          <div className="cband">
            <h3>Suka membaca cerita seperti ini?</h3>
            <p>Dapatkan lebih banyak wawasan membaca dan mulai perjalanan baca Anda di BUKOO.</p>
            <Link href="/pricing" className="btn-cta btn-lg">Coba gratis →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
