import Link from 'next/link';

export default function AiCompanionPage() {
  return (
    <>
      {/* Hero */}
      <section className="phero">
        <div className="phero-bg"></div>
        <div className="phero-grid"></div>
        <div className="wrap">
          <span className="eyebrow">Produk · AI Companion</span>
          <h1 className="ph-h1">Asisten baca <em>personal</em> Anda</h1>
          <p className="ph-lead">
            AI Companion menemani setiap halaman: merekomendasikan buku sesuai selera, merangkum bab, menjawab pertanyaan tentang isi buku, dan menyusun jalur baca yang dipersonalisasi. Tersedia di tier Plus ke atas.
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
            <span className="eyebrow">Fitur AI Companion</span>
            <h2 className="h2">Teknologi yang <em>memahami</em> cara Anda membaca</h2>
          </div>
          <div className="grid3">
            <div className="fcard">
              <span className="tag">Plus+</span>
              <div className="ic">🎯</div>
              <h4>Rekomendasi personal</h4>
              <p>Saran buku yang benar-benar cocok dengan selera &amp; tujuan baca Anda, diperbarui setiap hari.</p>
            </div>
            <div className="fcard">
              <span className="tag">Plus+</span>
              <div className="ic">📝</div>
              <h4>Rangkuman per bab</h4>
              <p>Ringkasan 3–5 paragraf tiap bab, dengan toggle anti-spoiler agar tak merusak keseruan.</p>
            </div>
            <div className="fcard">
              <span className="tag">Premium</span>
              <div className="ic">💬</div>
              <h4>Diskusi isi buku</h4>
              <p>Tanya apa saja tentang buku yang sedang dibaca — &quot;apa makna bab ini?&quot; — dijawab kontekstual.</p>
            </div>
            <div className="fcard">
              <span className="tag">Premium</span>
              <div className="ic">🗺️</div>
              <h4>Peta Baca</h4>
              <p>Beri tujuan (&quot;belajar sejarah Indonesia&quot;), AI menyusun 10 buku berurutan untuk Anda.</p>
            </div>
            <div className="fcard">
              <span className="tag">Plus+</span>
              <div className="ic">💡</div>
              <h4>Kutipan jadi insight</h4>
              <p>Highlight teks, AI mengubahnya jadi insight satu kalimat yang tersimpan di jurnal pribadi.</p>
            </div>
            <div className="fcard">
              <span className="tag">Semua</span>
              <div className="ic">🔒</div>
              <h4>Privasi terjaga</h4>
              <p>Data baca Anda memperkaya rekomendasi, dengan kontrol privasi di tangan Anda.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Notice */}
      <section className="sec alt">
        <div className="wrap">
          <div className="disc">
            <b>Catatan.</b> Fitur AI dirancang untuk membantu memahami dan menemukan buku — bukan menggantikan pengalaman membaca itu sendiri. Ketepatan rangkuman &amp; jawaban terus kami tingkatkan seiring pengembangan.
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="sec">
        <div className="wrap">
          <div className="cband">
            <h3>Aktifkan AI Companion Anda</h3>
            <p>Mulai dari tier Plus Rp 49.900/bulan untuk rekomendasi &amp; insight cerdas.</p>
            <Link href="/pricing" className="btn-cta btn-lg">Lihat paket →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
