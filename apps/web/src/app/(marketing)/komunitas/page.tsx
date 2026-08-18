import Link from 'next/link';

export default function KomunitasPage() {
  return (
    <>
      {/* Subnav */}
      <div className="subnav">
        <div className="subnav-in">
          <span className="subnav-tag">Produk</span>
          <Link href="/koleksi">Koleksi Buku</Link>
          <Link href="/audiobook">Audiobook</Link>
          <Link href="/originals">BUKOO Originals</Link>
          <Link href="/ai-companion">AI Companion</Link>
          <Link href="/komunitas" className="on">Komunitas</Link>
          <Link href="/pricing">Harga &amp; Paket</Link>
        </div>
      </div>

      {/* Hero */}
      <section className="phero">
        <div className="phero-bg"></div>
        <div className="phero-grid"></div>
        <div className="wrap">
          <span className="eyebrow">Produk · Komunitas</span>
          <h1 className="ph-h1">Membaca lebih seru <em>bersama</em></h1>
          <p className="ph-lead">
            Membaca tak harus sendirian. Bergabung dengan klub baca, ikut tantangan bulanan, bagikan kutipan favorit, dan temukan teman baca di komunitas BUKOO.
          </p>
          <div className="hero-ctas">
            <Link href="/pricing" className="btn-cta btn-lg">Mulai gratis →</Link>
          </div>
        </div>
      </section>

      {/* Community Features */}
      <section className="sec">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Fitur Komunitas</span>
            <h2 className="h2">Dari membaca <em>ke gerakan</em></h2>
          </div>
          <div className="grid3">
            <div className="fcard">
              <div className="ic">👥</div>
              <h4>Klub Baca</h4>
              <p>Buat atau gabung klub, diskusi lewat thread, dan temukan reading buddy untuk akuntabilitas.</p>
            </div>
            <div className="fcard">
              <div className="ic">🏆</div>
              <h4>Leaderboard mingguan</h4>
              <p>Total jam baca &amp; buku selesai, dengan filter teman atau publik. Segar tiap Senin.</p>
            </div>
            <div className="fcard">
              <div className="ic">🎯</div>
              <h4>Reading Challenge</h4>
              <p>Tantangan bulanan seperti &quot;Baca 5 buku Sastra Indonesia&quot; dengan reward poin.</p>
            </div>
            <div className="fcard">
              <div className="ic">📤</div>
              <h4>Bagikan kutipan</h4>
              <p>Ubah kutipan favorit jadi kartu visual untuk Instagram, TikTok, atau WhatsApp.</p>
            </div>
            <div className="fcard">
              <div className="ic">🔥</div>
              <h4>Streak &amp; badge</h4>
              <p>Jaga rentetan hari membaca dan kumpulkan badge milestone.</p>
            </div>
            <div className="fcard">
              <div className="ic">📊</div>
              <h4>Statistik pribadi</h4>
              <p>Lihat riwayat baca, jam membaca, dan genre favorit dalam grafik yang rapi.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Callout */}
      <section className="sec alt">
        <div className="wrap">
          <div className="callout">
            Akses komunitas dasar tersedia bahkan di tier <b>Bebas (Gratis)</b>. Social Reading penuh terbuka mulai tier Plus — karena membaca bersama adalah bagian dari <b>Indonesia Membaca Lagi</b>.
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="sec">
        <div className="wrap">
          <div className="cband">
            <h3>Temukan teman baca Anda</h3>
            <p>Mulai dari akun gratis dan rasakan serunya membaca bersama komunitas BUKOO.</p>
            <Link href="/pricing" className="btn-cta btn-lg">Coba gratis →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
