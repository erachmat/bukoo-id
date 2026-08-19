import Link from 'next/link';

export default function LanggananBantuanPage() {
  return (
    <>
      {/* Hero */}
      <section className="phero">
        <div className="phero-bg"></div>
        <div className="phero-grid"></div>
        <div className="wrap">
          <span className="eyebrow">Bantuan · Cara Berlangganan</span>
          <h1 className="ph-h1">Mulai membaca dalam <em>3 menit</em></h1>
          <p className="ph-lead">
            Berlangganan BUKOO semudah beberapa ketukan. Ikuti langkah berikut dan buka akses ke ribuan judul hari ini.
          </p>
          <div className="hero-ctas">
            <Link href="/pricing" className="btn-cta btn-lg">Lihat paket →</Link>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="sec">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Langkah Berlangganan</span>
            <h2 className="h2">Empat langkah <em>saja</em></h2>
          </div>
          <div className="steps">
            <div className="steps-line"></div>
            <div className="step">
              <div className="d">01</div>
              <h4>Unduh aplikasi</h4>
              <p>Pasang BUKOO dari App Store atau Google Play, atau buka via web.</p>
            </div>
            <div className="step">
              <div className="d">02</div>
              <h4>Buat akun</h4>
              <p>Daftar dengan email, Google, atau Apple. Cepat dan gratis.</p>
            </div>
            <div className="step">
              <div className="d">03</div>
              <h4>Pilih paket</h4>
              <p>Pilih tier yang cocok — mulai dari Bebas (gratis) hingga Keluarga.</p>
            </div>
            <div className="step">
              <div className="d">04</div>
              <h4>Bayar &amp; baca</h4>
              <p>Selesaikan pembayaran, dan langsung mulai membaca tanpa batas.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="sec alt">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Fleksibel</span>
            <h2 className="h2">Anda <em>yang pegang kendali</em></h2>
          </div>
          <div className="grid3">
            <div className="fcard">
              <div className="ic">🆓</div>
              <h4>Coba gratis dulu</h4>
              <p>Tier Plus punya 7 hari percobaan gratis tanpa kartu kredit — rasakan sebelum membayar.</p>
            </div>
            <div className="fcard">
              <div className="ic">🔄</div>
              <h4>Ganti paket kapan saja</h4>
              <p>Upgrade atau downgrade sesuai kebutuhan, langsung dari pengaturan akun.</p>
            </div>
            <div className="fcard">
              <div className="ic">🚫</div>
              <h4>Batalkan tanpa ribet</h4>
              <p>Tanpa kontrak, tanpa penalti. Batalkan kapan saja dalam kurang dari 30 detik.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="sec">
        <div className="wrap">
          <div className="sec-head center">
            <span className="eyebrow">Pertanyaan Umum</span>
            <h2 className="h2">Soal <em>berlangganan</em></h2>
          </div>
          <div className="faq center">
            <div className="faq-i">
              <button className="faq-q">
                Bagaimana cara upgrade dari Baca ke Plus?
              </button>
              <div className="faq-a" style={{ maxHeight: 'none' }}>
                <p>Buka Pengaturan → Langganan → Ganti Paket, pilih Plus, dan konfirmasi. Perubahan berlaku segera dan biaya disesuaikan secara prorata.</p>
              </div>
            </div>
            <div className="faq-i">
              <button className="faq-q">
                Apakah percobaan gratis otomatis jadi berbayar?
              </button>
              <div className="faq-a" style={{ maxHeight: 'none' }}>
                <p>Di hari ke-5 percobaan, kami mengingatkan Anda. Anda bisa membatalkan sebelum hari ke-7 tanpa dikenai biaya.</p>
              </div>
            </div>
            <div className="faq-i">
              <button className="faq-q">
                Bagaimana cara membatalkan langganan?
              </button>
              <div className="faq-a" style={{ maxHeight: 'none' }}>
                <p>Buka Pengaturan → Langganan → Batalkan. Akses tetap aktif sampai akhir periode yang sudah dibayar.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="sec">
        <div className="wrap">
          <div className="cband">
            <h3>Siap mulai membaca?</h3>
            <p>Pilih paket Anda dan coba gratis 7 hari hari ini.</p>
            <Link href="/pricing" className="btn-cta btn-lg">Coba Gratis →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
