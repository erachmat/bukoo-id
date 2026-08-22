import Link from 'next/link';

export default function PricingPage() {
  return (
    <>
      {/* Hero */}
      <section className="phero">
        <div className="phero-bg"></div>
        <div className="phero-grid"></div>
        <div className="wrap">
          <span className="eyebrow">Produk · Harga &amp; Paket</span>
          <h1 className="ph-h1">Harga <em>jujur</em>, tanpa jebakan</h1>
          <p className="ph-lead">
            Lima paket untuk setiap kebutuhan — dari akun gratis hingga keluarga. Mulai Rp 29.900/bulan, tanpa kontrak panjang, batalkan kapan saja. Kami transparan soal harga, sekarang dan selamanya.
          </p>
        </div>
      </section>

      {/* Pricing Grid */}
      <section className="sec">
        <div className="wrap">
          <div className="pgrid">
            {/* Tier 0 */}
            <div className="pcard">
              <div className="ptier">TIER 0</div>
              <div className="pname">Bebas</div>
              <div className="ptarget">Untuk pemula</div>
              <div className="pamt free">Gratis</div>
              <div className="pper">Selamanya</div>
              <ul className="pfeat">
                <li><span className="y">✓</span>50 buku rotasi bulanan</li>
                <li><span className="y">✓</span>Preview 1 bab semua koleksi</li>
                <li><span className="y">✓</span>Akses komunitas dasar</li>
                <li><span className="n">✗</span>Ada iklan ringan</li>
                <li><span className="n">✗</span>Audiobook</li>
                <li><span className="n">✗</span>Offline reading</li>
              </ul>
              <Link href="/register" className="pbtn">Mulai Gratis</Link>
            </div>

            {/* Tier 1 */}
            <div className="pcard">
              <div className="ptier">TIER 1</div>
              <div className="pname">Baca</div>
              <div className="ptarget">Pelajar &amp; Mahasiswa</div>
              <div className="pamt"><span className="rp">Rp</span> 29.900</div>
              <div className="pper">per bulan</div>
              <ul className="pfeat">
                <li><span className="y">✓</span>2.000+ judul kurasi</li>
                <li><span className="y">✓</span>Koleksi lokal penuh</li>
                <li><span className="y">✓</span>Offline 10 judul</li>
                <li><span className="y">✓</span>Tanpa iklan</li>
                <li><span className="n">✗</span>Audiobook</li>
                <li><span className="n">✗</span>Bukoo Assistant</li>
              </ul>
              <Link href="/register" className="pbtn">Mulai Sekarang</Link>
            </div>

            {/* Tier 2 (Featured) */}
            <div className="pcard feat">
              <span className="pbadge">✦ Terpopuler</span>
              <div className="ptier">TIER 2</div>
              <div className="pname">Plus</div>
              <div className="ptarget">Profesional muda</div>
              <div className="pamt"><span className="rp">Rp</span> 49.900</div>
              <div className="pper">per bulan</div>
              <ul className="pfeat">
                <li><span className="y">✓</span>2.000+ judul kurasi</li>
                <li><span className="y">✓</span>Audiobook Indonesia</li>
                <li><span className="y">✓</span>Offline unlimited</li>
                <li><span className="y">✓</span>AI Rekomendasi</li>
                <li><span className="y">✓</span>Social Reading penuh</li>
                <li><span className="n">✗</span>Kredit buku terbaru</li>
              </ul>
              <Link href="/register" className="pbtn fill">Coba 7 Hari Gratis →</Link>
            </div>

            {/* Tier 3 */}
            <div className="pcard">
              <div className="ptier">TIER 3</div>
              <div className="pname">Premium</div>
              <div className="ptarget">Pembaca serius</div>
              <div className="pamt"><span className="rp">Rp</span> 79.900</div>
              <div className="pper">per bulan</div>
              <ul className="pfeat">
                <li><span className="y">✓</span>Seluruh katalog global</li>
                <li><span className="y">✓</span>3 kredit buku terbaru</li>
                <li><span className="y">✓</span>Bukoo Assistant penuh</li>
                <li><span className="y">✓</span>Majalah &amp; jurnal</li>
                <li><span className="y">✓</span>Priority support</li>
              </ul>
              <Link href="/register" className="pbtn">Mulai Sekarang</Link>
            </div>

            {/* Tier 4 */}
            <div className="pcard">
              <div className="ptier">TIER 4</div>
              <div className="pname">Keluarga</div>
              <div className="ptarget">5 akun · Hemat 40%</div>
              <div className="pamt"><span className="rp">Rp</span> 99.900</div>
              <div className="pper">per bulan · 5 akun</div>
              <ul className="pfeat">
                <li><span className="y">✓</span>Semua fitur Premium</li>
                <li><span className="y">✓</span>5 profil terpisah</li>
                <li><span className="y">✓</span>Konten anak</li>
                <li><span className="y">✓</span>Parental control</li>
                <li><span className="y">✓</span>Rak buku keluarga</li>
                <li><span className="y">✓</span>Hemat vs 5× Premium</li>
              </ul>
              <Link href="/register" className="pbtn">Mulai Sekarang</Link>
            </div>
          </div>
          <p className="pnote">
            Semua paket dilengkapi 7 hari percobaan gratis · Batalkan kapan saja · Tanpa kartu kredit untuk mulai
          </p>
        </div>
      </section>

      {/* Payment methods */}
      <section className="sec alt">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Pembayaran</span>
            <h2 className="h2">Bayar mudah, <em>semua Rupiah</em></h2>
            <p className="sec-desc">Tanpa biaya kurs dolar. Pilih metode yang paling nyaman untuk Anda.</p>
          </div>
          <div className="chips">
            <span className="chip"><span className="ic">📱</span>GoPay</span>
            <span className="chip"><span className="ic">💳</span>OVO</span>
            <span className="chip"><span className="ic">💙</span>Dana</span>
            <span className="chip"><span className="ic">🛍️</span>ShopeePay</span>
            <span className="chip"><span className="ic">📷</span>QRIS</span>
            <span className="chip"><span className="ic">🏦</span>Virtual Account</span>
            <span className="chip"><span className="ic">💳</span>Kartu Kredit/Debit</span>
            <span className="chip"><span className="ic">🏪</span>Indomaret/Alfamart</span>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="sec">
        <div className="wrap">
          <div className="sec-head center">
            <span className="eyebrow">Pertanyaan Umum</span>
            <h2 className="h2">Soal <em>harga &amp; paket</em></h2>
          </div>
          <div className="faq center">
            <div className="faq-i">
              <button className="faq-q">
                Apakah benar-benar bisa dibatalkan kapan saja?
              </button>
              <div className="faq-a" style={{ maxHeight: 'none' }}>
                <p>Ya. Semua paket berbayar tanpa kontrak. Anda bisa upgrade, downgrade, atau batalkan kapan saja tanpa penalti. Pembatalan berlaku di akhir periode billing yang sudah dibayar.</p>
              </div>
            </div>
            <div className="faq-i">
              <button className="faq-q">
                Bagaimana cara kerja percobaan gratis 7 hari?
              </button>
              <div className="faq-a" style={{ maxHeight: 'none' }}>
                <p>Tier Plus menyediakan 7 hari percobaan gratis tanpa kartu kredit. Di hari ke-5, kami mengingatkan sebelum periode berbayar dimulai.</p>
              </div>
            </div>
            <div className="faq-i">
              <button className="faq-q">
                Apa beda tier Baca dan Plus?
              </button>
              <div className="faq-a" style={{ maxHeight: 'none' }}>
                <p>Baca (Rp 29.900) memberi akses 2.000+ judul &amp; offline 10 judul, cocok untuk pelajar. Plus (Rp 49.900) menambah Audiobook, offline unlimited, AI Rekomendasi, dan Social Reading penuh.</p>
              </div>
            </div>
            <div className="faq-i">
              <button className="faq-q">
                Apakah paket Keluarga benar-benar hemat?
              </button>
              <div className="faq-a" style={{ maxHeight: 'none' }}>
                <p>Ya. Rp 99.900 untuk 5 profil terpisah jauh lebih hemat dibanding 5 langganan Premium terpisah, lengkap dengan konten anak &amp; parental control.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="sec">
        <div className="wrap">
          <div className="cband">
            <h3>Mulai membaca hari ini</h3>
            <p>Coba gratis 7 hari. Tanpa kartu kredit untuk mulai.</p>
            <Link href="/register" className="btn-cta btn-lg">Coba Gratis →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
