import Link from 'next/link';

export default function PembayaranPage() {
  return (
    <>
      {/* Hero */}
      <section className="phero">
        <div className="phero-bg"></div>
        <div className="phero-grid"></div>
        <div className="wrap">
          <span className="eyebrow">Bantuan · Pembayaran</span>
          <h1 className="ph-h1">Bayar mudah, <em>semua Rupiah</em></h1>
          <p className="ph-lead">
            BUKOO mendukung metode pembayaran paling populer di Indonesia — tanpa biaya kurs dolar, dengan transaksi yang aman dan terenkripsi.
          </p>
        </div>
      </section>

      {/* Payment Methods */}
      <section className="sec">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Metode Pembayaran</span>
            <h2 className="h2">Pilih yang <em>paling nyaman</em></h2>
          </div>
          <div className="chips">
            <span className="chip"><span className="ic">📱</span>GoPay</span>
            <span className="chip"><span className="ic">💳</span>OVO</span>
            <span className="chip"><span className="ic">💙</span>Dana</span>
            <span className="chip"><span className="ic">🛍️</span>ShopeePay</span>
            <span className="chip"><span className="ic">📷</span>QRIS</span>
            <span className="chip"><span className="ic">🏦</span>VA BCA</span>
            <span className="chip"><span className="ic">🏦</span>VA Mandiri</span>
            <span className="chip"><span className="ic">🏦</span>VA BNI</span>
            <span className="chip"><span className="ic">🏦</span>VA BRI</span>
            <span className="chip"><span className="ic">💳</span>Kartu Kredit/Debit</span>
            <span className="chip"><span className="ic">🏪</span>Indomaret</span>
            <span className="chip"><span className="ic">🏪</span>Alfamart</span>
          </div>
        </div>
      </section>

      {/* Security & Billing */}
      <section className="sec alt">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Keamanan &amp; Tagihan</span>
            <h2 className="h2">Transaksi yang <em>bisa dipercaya</em></h2>
          </div>
          <div className="grid3">
            <div className="fcard">
              <div className="ic">🔒</div>
              <h4>Aman &amp; terenkripsi</h4>
              <p>Transaksi diproses lewat payment gateway tepercaya. Data kartu tidak kami simpan.</p>
            </div>
            <div className="fcard">
              <div className="ic">🧾</div>
              <h4>Invoice otomatis</h4>
              <p>Setiap pembayaran menghasilkan invoice yang bisa Anda akses di pengaturan akun.</p>
            </div>
            <div className="fcard">
              <div className="ic">↩️</div>
              <h4>Kebijakan refund jelas</h4>
              <p>Ketentuan pengembalian dana transparan sesuai syarat &amp; ketentuan yang berlaku.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="sec">
        <div className="wrap">
          <div className="sec-head center">
            <span className="eyebrow">Pertanyaan Umum</span>
            <h2 className="h2">Soal <em>pembayaran</em></h2>
          </div>
          <div className="faq center">
            <div className="faq-i">
              <button className="faq-q">
                Apakah data kartu saya disimpan?
              </button>
              <div className="faq-a" style={{ maxHeight: 'none' }}>
                <p>Tidak. Pembayaran diproses oleh payment gateway bersertifikat. BUKOO tidak menyimpan detail kartu Anda.</p>
              </div>
            </div>
            <div className="faq-i">
              <button className="faq-q">
                Kapan tagihan berikutnya ditarik?
              </button>
              <div className="faq-a" style={{ maxHeight: 'none' }}>
                <p>Untuk langganan bulanan, tagihan ditarik pada tanggal yang sama setiap bulan. Anda bisa melihat tanggal billing berikutnya di pengaturan.</p>
              </div>
            </div>
            <div className="faq-i">
              <button className="faq-q">
                Bagaimana jika pembayaran gagal?
              </button>
              <div className="faq-a" style={{ maxHeight: 'none' }}>
                <p>Sistem akan mencoba ulang otomatis dan memberi tahu Anda. Akses tetap aman hingga masalah pembayaran diselesaikan.</p>
              </div>
            </div>
            <div className="faq-i">
              <button className="faq-q">
                Bisakah saya minta refund?
              </button>
              <div className="faq-a" style={{ maxHeight: 'none' }}>
                <p>Ketentuan refund mengikuti syarat &amp; ketentuan. Untuk kasus khusus, hubungi dukungan lewat halaman Kontak.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="sec">
        <div className="wrap">
          <div className="cband">
            <h3>Ada kendala pembayaran?</h3>
            <p>Tim dukungan kami siap membantu menyelesaikannya.</p>
            <Link href="/kontak" className="btn-cta btn-lg">Hubungi kami →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
