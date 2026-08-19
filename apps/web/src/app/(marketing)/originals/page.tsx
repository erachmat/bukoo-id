import Link from 'next/link';

export default function OriginalsPage() {
  return (
    <>
      {/* Hero */}
      <section className="phero">
        <div className="phero-bg"></div>
        <div className="phero-grid"></div>
        <div className="wrap">
          <span className="eyebrow">Produk · BUKOO Originals</span>
          <h1 className="ph-h1">Karya eksklusif, <em>hanya di BUKOO</em></h1>
          <p className="ph-lead">
            BUKOO Originals adalah karya penulis Indonesia yang hanya bisa Anda baca di sini. Kami tidak sekadar mendistribusikan buku — kami membantu melahirkannya.
          </p>
          <div className="hero-ctas">
            <Link href="/pricing" className="btn-cta btn-lg">Baca di Premium →</Link>
            <Link href="/bantuan#kontak" className="btn-ghost btn-lg">Untuk penulis</Link>
          </div>
        </div>
      </section>

      {/* What is Originals */}
      <section className="sec">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Apa Itu Originals</span>
            <h2 className="h2">Bukan mendistribusikan — <em>melahirkan</em> karya</h2>
          </div>
          <div className="grid3">
            <div className="fcard">
              <div className="ic">✍️</div>
              <h4>Suara baru Indonesia</h4>
              <p>Ruang bagi penulis berbakat untuk menerbitkan karya orisinal ke jutaan pembaca.</p>
            </div>
            <div className="fcard">
              <div className="ic">🎓</div>
              <h4>Mentoring editor senior</h4>
              <p>Program pendampingan bersama editor berpengalaman agar karya matang.</p>
            </div>
            <div className="fcard">
              <div className="ic">📣</div>
              <h4>Promosi premium</h4>
              <p>Peluncuran khusus &amp; sorotan untuk debut, bukan sekadar diunggah lalu dilupakan.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="sec alt">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Perjalanan Sebuah Original</span>
            <h2 className="h2">Dari naskah ke <em>pembaca</em></h2>
          </div>
          <div className="steps">
            <div className="steps-line"></div>
            <div className="step">
              <div className="d">01</div>
              <h4>Call for submissions</h4>
              <p>Dibuka dua kali setahun untuk naskah orisinal terpilih.</p>
            </div>
            <div className="step">
              <div className="d">02</div>
              <h4>Kurasi &amp; mentoring</h4>
              <p>Naskah terpilih didampingi editor senior hingga siap terbit.</p>
            </div>
            <div className="step">
              <div className="d">03</div>
              <h4>Rilis eksklusif</h4>
              <p>Terbit perdana di BUKOO dengan promosi peluncuran khusus.</p>
            </div>
            <div className="step">
              <div className="d">04</div>
              <h4>Jalur ke fisik</h4>
              <p>Setelah jendela eksklusif, karya dapat didistribusikan ke penerbit fisik.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Callout */}
      <section className="sec">
        <div className="wrap">
          <div className="callout">
            Untuk pembaca: BUKOO Originals tersedia di tier <b>Premium</b>. Untuk penulis: kami membuka jalur penerbitan yang adil, dengan pendampingan dan promosi — <b>bicara dengan tim kami</b> lewat halaman Kontak.
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="sec">
        <div className="wrap">
          <div className="cband">
            <h3>Baca karya yang tak ada di tempat lain</h3>
            <p>BUKOO Originals hadir eksklusif di tier Premium, Rp 79.900/bulan.</p>
            <Link href="/pricing" className="btn-cta btn-lg">Lihat paket Premium →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
