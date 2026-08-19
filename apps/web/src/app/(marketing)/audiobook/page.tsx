import Link from 'next/link';

export default function AudiobookPage() {
  return (
    <>
      {/* Hero */}
      <section className="phero">
        <div className="phero-bg"></div>
        <div className="phero-grid"></div>
        <div className="wrap">
          <span className="eyebrow">Produk · Audiobook</span>
          <h1 className="ph-h1">Dengarkan buku, <em>di mana saja</em></h1>
          <p className="ph-lead">
            Ubah waktu perjalanan, olahraga, atau bersantai menjadi waktu membaca. Audiobook Indonesia dengan narasi profesional, tersedia di tier Plus ke atas.
          </p>
          <div className="hero-ctas">
            <Link href="/pricing" className="btn-cta btn-lg">Ada di tier Plus →</Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="sec">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Kenapa Audiobook</span>
            <h2 className="h2">Buku untuk telinga, <em>bukan hanya mata</em></h2>
          </div>
          <div className="grid3">
            <div className="fcard">
              <span className="tag">Kualitas</span>
              <div className="ic">🎙️</div>
              <h4>Narasi profesional</h4>
              <p>Dibacakan oleh narator berpengalaman — nikmat didengar berjam-jam.</p>
            </div>
            <div className="fcard">
              <span className="tag">Offline</span>
              <div className="ic">📥</div>
              <h4>Unduh &amp; dengar offline</h4>
              <p>Simpan audiobook untuk didengar tanpa kuota, cocok untuk perjalanan.</p>
            </div>
            <div className="fcard">
              <span className="tag">Seamless</span>
              <div className="ic">🔁</div>
              <h4>Sinkron baca ↔ dengar</h4>
              <p>Berpindah mulus antara membaca teks dan mendengar audio di judul yang didukung.</p>
            </div>
            <div className="fcard">
              <span className="tag">Kontrol</span>
              <div className="ic">⏱️</div>
              <h4>Atur kecepatan</h4>
              <p>Dengarkan pada 0,8×–2× sesuai ritme Anda, dengan sleep timer.</p>
            </div>
            <div className="fcard">
              <span className="tag">Praktis</span>
              <div className="ic">🚗</div>
              <h4>Untuk hari sibuk</h4>
              <p>Selesaikan lebih banyak buku di sela commuting, memasak, atau berolahraga.</p>
            </div>
            <div className="fcard">
              <span className="tag">Lokal</span>
              <div className="ic">🇮🇩</div>
              <h4>Katalog Indonesia</h4>
              <p>Fokus pada audiobook berbahasa Indonesia yang masih langka di platform lain.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Callout */}
      <section className="sec alt">
        <div className="wrap">
          <div className="callout">
            Audiobook Indonesia hampir tidak tersedia di platform lain. BUKOO menghadirkannya sebagai bagian dari misi <b>akses membaca untuk semua</b> — termasuk mereka yang lebih nyaman mendengar daripada membaca.
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="sec">
        <div className="wrap">
          <div className="cband">
            <h3>Mulai mendengarkan di tier Plus</h3>
            <p>Rp 49.900/bulan sudah termasuk audiobook, offline unlimited, dan AI Rekomendasi.</p>
            <Link href="/pricing" className="btn-cta btn-lg">Lihat paket Plus →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
