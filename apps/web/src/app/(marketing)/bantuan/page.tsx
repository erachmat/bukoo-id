import Link from 'next/link';

export default function BantuanPage() {
  return (
    <>
      {/* Hero */}
      <section className="phero">
        <div className="phero-bg"></div>
        <div className="phero-grid"></div>
        <div className="wrap">
          <div className="hsearch" style={{ marginBottom: '28px' }}>
            <span className="ic">🔍</span>
            <input type="text" placeholder="Cari topik bantuan… (mis. cara membatalkan langganan)" />
          </div>
          <span className="eyebrow">Bantuan · Pusat Bantuan</span>
          <h1 className="ph-h1">Ada yang bisa <em>kami bantu?</em></h1>
          <p className="ph-lead">
            Temukan jawaban cepat seputar akun, langganan, pembayaran, dan cara membaca di BUKOO. Jika masih butuh bantuan, tim kami siap membantu.
          </p>
        </div>
      </section>

      {/* Help Categories */}
      <section className="sec">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Kategori Bantuan</span>
            <h2 className="h2">Pilih <em>topik</em> Anda</h2>
          </div>
          <div className="grid3">
            <Link href="/langganan-bantuan" className="hcat">
              <div className="ic">📦</div>
              <h4>Langganan &amp; Paket</h4>
              <p>Mulai, upgrade, downgrade, atau batalkan langganan Anda.</p>
            </Link>
            <Link href="/pembayaran" className="hcat">
              <div className="ic">💳</div>
              <h4>Pembayaran &amp; Tagihan</h4>
              <p>Metode bayar, invoice, refund, dan keamanan transaksi.</p>
            </Link>
            <Link href="/perangkat" className="hcat">
              <div className="ic">📱</div>
              <h4>Perangkat &amp; Aplikasi</h4>
              <p>Instalasi, offline reading, dan sinkronisasi antar perangkat.</p>
            </Link>
            <Link href="/faq" className="hcat">
              <div className="ic">👥</div>
              <h4>Komunitas &amp; Fitur</h4>
              <p>Klub baca, tantangan, leaderboard, dan privasi.</p>
            </Link>
            <Link href="/kontak" className="hcat">
              <div className="ic">💬</div>
              <h4>Hubungi Dukungan</h4>
              <p>Belum menemukan jawaban? Bicara langsung dengan tim kami.</p>
            </Link>
            <a href="https://publisher.bukoo.id" target="_blank" rel="noopener noreferrer" className="hcat">
              <div className="ic">📚</div>
              <h4>Untuk Penerbit</h4>
              <p>Panduan lengkap bagi mitra penerbit BUKOO.</p>
            </a>
          </div>
        </div>
      </section>

      {/* Popular FAQ */}
      <section className="sec alt">
        <div className="wrap">
          <div className="sec-head center">
            <span className="eyebrow">Pertanyaan Populer</span>
            <h2 className="h2">Jawaban <em>cepat</em></h2>
          </div>
          <div className="faq center">
            <div className="faq-i">
              <button className="faq-q">
                Bagaimana cara memulai langganan BUKOO?
              </button>
              <div className="faq-a" style={{ maxHeight: 'none' }}>
                <p>Unduh aplikasi BUKOO, buat akun dengan email/Google/Apple, pilih paket, dan mulai baca. Tier Plus punya 7 hari percobaan gratis tanpa kartu kredit. Detail di halaman Cara Berlangganan.</p>
              </div>
            </div>
            <div className="faq-i">
              <button className="faq-q">
                Bisakah membaca tanpa koneksi internet?
              </button>
              <div className="faq-a" style={{ maxHeight: 'none' }}>
                <p>Bisa. Tier Baca memungkinkan download hingga 10 judul, sedangkan tier Plus ke atas mendapat offline unlimited — cocok untuk daerah dengan koneksi tidak stabil.</p>
              </div>
            </div>
            <div className="faq-i">
              <button className="faq-q">
                Apakah ada kontrak jangka panjang?
              </button>
              <div className="faq-a" style={{ maxHeight: 'none' }}>
                <p>Tidak. Langganan bulanan tanpa kontrak. Upgrade, downgrade, atau batalkan kapan saja tanpa penalti.</p>
              </div>
            </div>
            <div className="faq-i">
              <button className="faq-q">
                Metode pembayaran apa yang didukung?
              </button>
              <div className="faq-a" style={{ maxHeight: 'none' }}>
                <p>GoPay, OVO, Dana, ShopeePay, QRIS, virtual account (BCA, Mandiri, BNI, BRI), kartu kredit/debit, hingga Indomaret/Alfamart. Semua dalam Rupiah.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="sec">
        <div className="wrap">
          <div className="cband">
            <h3>Masih butuh bantuan?</h3>
            <p>Tim dukungan BUKOO siap membantu lewat email atau WhatsApp.</p>
            <Link href="/kontak" className="btn-cta btn-lg">Hubungi kami →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
