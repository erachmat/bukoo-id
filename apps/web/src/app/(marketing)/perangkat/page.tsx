import Link from 'next/link';

export default function PerangkatPage() {
  return (
    <>
      {/* Hero */}
      <section className="phero">
        <div className="phero-bg"></div>
        <div className="phero-grid"></div>
        <div className="wrap">
          <span className="eyebrow">Bantuan · Perangkat &amp; App</span>
          <h1 className="ph-h1">Baca di <em>semua perangkat</em></h1>
          <p className="ph-lead">
            Mulai membaca di ponsel saat commuting, lanjutkan di tablet malam hari. BUKOO menyinkronkan progres Anda mulus di semua perangkat.
          </p>
        </div>
      </section>

      {/* Supported Devices */}
      <section className="sec">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Perangkat Didukung</span>
            <h2 className="h2">Di mana pun <em>Anda membaca</em></h2>
          </div>
          <div className="grid3">
            <div className="fcard">
              <div className="ic">🤖</div>
              <h4>Android</h4>
              <p>Aplikasi BUKOO di Google Play untuk ponsel &amp; tablet Android.</p>
            </div>
            <div className="fcard">
              <div className="ic">🍎</div>
              <h4>iOS</h4>
              <p>Aplikasi BUKOO di App Store untuk iPhone &amp; iPad.</p>
            </div>
            <div className="fcard">
              <div className="ic">💻</div>
              <h4>Web</h4>
              <p>Baca langsung dari browser desktop tanpa perlu instalasi.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Reading Experience */}
      <section className="sec alt">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Pengalaman Membaca</span>
            <h2 className="h2">Mulus di <em>setiap layar</em></h2>
          </div>
          <ul className="checklist" style={{ maxWidth: '640px' }}>
            <li><b>Sinkronisasi otomatis</b> — progres baca, bookmark, dan catatan tersimpan lintas perangkat.</li>
            <li><b>Offline reading</b> — unduh buku untuk dibaca tanpa internet (10 judul di Baca, unlimited di Plus+).</li>
            <li><b>Kustomisasi tampilan</b> — atur ukuran font, tema terang/gelap, dan jarak baris.</li>
            <li><b>Lanjutkan di mana Anda berhenti</b> — buka perangkat lain, langsung ke halaman terakhir.</li>
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="sec">
        <div className="wrap">
          <div className="sec-head center">
            <span className="eyebrow">Pertanyaan Umum</span>
            <h2 className="h2">Soal <em>perangkat &amp; app</em></h2>
          </div>
          <div className="faq center">
            <div className="faq-i">
              <button className="faq-q">
                Berapa perangkat yang bisa saya gunakan?
              </button>
              <div className="faq-a" style={{ maxHeight: 'none' }}>
                <p>Satu akun dapat login di beberapa perangkat. Tier Keluarga menyediakan 5 profil terpisah untuk anggota keluarga.</p>
              </div>
            </div>
            <div className="faq-i">
              <button className="faq-q">
                Bagaimana cara membaca offline?
              </button>
              <div className="faq-a" style={{ maxHeight: 'none' }}>
                <p>Buka buku yang diinginkan, ketuk ikon unduh, dan buku tersimpan untuk dibaca tanpa koneksi. Jumlah unduhan tergantung tier Anda.</p>
              </div>
            </div>
            <div className="faq-i">
              <button className="faq-q">
                Apakah progres saya otomatis tersinkron?
              </button>
              <div className="faq-a" style={{ maxHeight: 'none' }}>
                <p>Ya. Selama terhubung internet, progres baca, bookmark, dan catatan otomatis tersinkron ke seluruh perangkat.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="sec">
        <div className="wrap">
          <div className="cband">
            <h3>Belum punya aplikasinya?</h3>
            <p>Unduh BUKOO dan mulai membaca di perangkat favorit Anda.</p>
            <Link href="/pricing" className="btn-cta btn-lg">Coba gratis →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
