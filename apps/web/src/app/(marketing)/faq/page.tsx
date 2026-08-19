import Link from 'next/link';

export default function FaqPage() {
  return (
    <>
      {/* Hero */}
      <section className="phero">
        <div className="phero-bg"></div>
        <div className="phero-grid"></div>
        <div className="wrap">
          <span className="eyebrow">Bantuan · Komunitas FAQ</span>
          <h1 className="ph-h1">Serba-serbi <em>komunitas BUKOO</em></h1>
          <p className="ph-lead">
            Semua yang perlu Anda tahu tentang klub baca, tantangan, leaderboard, dan cara menjaga pengalaman komunitas tetap aman &amp; menyenangkan.
          </p>
          <div className="hero-ctas">
            <Link href="/komunitas" className="btn-cta btn-lg">Jelajahi fitur komunitas →</Link>
          </div>
        </div>
      </section>

      {/* FAQ List */}
      <section className="sec">
        <div className="wrap">
          <div className="sec-head center">
            <span className="eyebrow">Pertanyaan Komunitas</span>
            <h2 className="h2">Jawaban <em>lengkap</em></h2>
          </div>
          <div className="faq center">
            <div className="faq-i">
              <button className="faq-q">
                Bagaimana cara bergabung atau membuat klub baca?
              </button>
              <div className="faq-a" style={{ maxHeight: 'none' }}>
                <p>Buka tab Komunitas, telusuri klub yang ada, dan ketuk &quot;Gabung&quot; — atau buat klub sendiri, beri nama &amp; tema, lalu undang teman. Diskusi berlangsung lewat thread di dalam klub.</p>
              </div>
            </div>
            <div className="faq-i">
              <button className="faq-q">
                Bagaimana leaderboard dihitung?
              </button>
              <div className="faq-a" style={{ maxHeight: 'none' }}>
                <p>Leaderboard mingguan mengukur total jam baca dan jumlah buku selesai. Anda bisa memfilter tampilan teman-saja atau publik. Papan peringkat disegarkan setiap Senin pukul 00:00.</p>
              </div>
            </div>
            <div className="faq-i">
              <button className="faq-q">
                Apa itu Reading Challenge?
              </button>
              <div className="faq-a" style={{ maxHeight: 'none' }}>
                <p>Tantangan membaca bulanan bertema, misalnya &quot;Baca 5 buku Sastra Indonesia bulan ini&quot;. Menyelesaikannya memberi poin yang bisa ditukar dengan benefit langganan.</p>
              </div>
            </div>
            <div className="faq-i">
              <button className="faq-q">
                Bagaimana cara membagikan kutipan?
              </button>
              <div className="faq-a" style={{ maxHeight: 'none' }}>
                <p>Saat membaca, highlight teks favorit dan pilih &quot;Bagikan&quot; untuk membuat kartu visual yang bisa diunggah ke Instagram, TikTok, atau WhatsApp.</p>
              </div>
            </div>
            <div className="faq-i">
              <button className="faq-q">
                Bagaimana BUKOO menjaga komunitas tetap aman?
              </button>
              <div className="faq-a" style={{ maxHeight: 'none' }}>
                <p>Kami menerapkan pedoman komunitas dan moderasi. Konten yang melanggar dapat dilaporkan, dan Anda dapat mengatur profil menjadi publik atau privat kapan saja.</p>
              </div>
            </div>
            <div className="faq-i">
              <button className="faq-q">
                Bisakah saya menyembunyikan aktivitas baca saya?
              </button>
              <div className="faq-a" style={{ maxHeight: 'none' }}>
                <p>Bisa. Di pengaturan privasi, atur profil publik/privat dan aktifkan atau nonaktifkan berbagi data aktivitas sesuai kenyamanan Anda.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="sec">
        <div className="wrap">
          <div className="cband">
            <h3>Masih ada pertanyaan?</h3>
            <p>Kunjungi Pusat Bantuan atau hubungi tim dukungan kami.</p>
            <Link href="/bantuan" className="btn-cta btn-lg">Ke Pusat Bantuan →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
