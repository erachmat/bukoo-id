import Link from 'next/link';

export default function TentangPage() {
  return (
    <>
      {/* Hero */}
      <section className="phero">
        <div className="phero-bg"></div>
        <div className="phero-grid"></div>
        <div className="wrap">
          <span className="eyebrow">Perusahaan · Tentang BUKOO</span>
          <h1 className="ph-h1">Akses buku adalah <em>hak dasar</em>, bukan hak istimewa</h1>
          <p className="ph-lead">
            BUKOO lahir dari satu keyakinan: tidak ada orang Indonesia yang boleh kehilangan akses ke pengetahuan hanya karena harga sebuah buku. Kami membangun gerakan, bukan sekadar platform.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="sec">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Cerita Kami</span>
            <h2 className="h2">Kenapa <em>BUKOO</em> ada</h2>
          </div>
          <div className="story">
            <p>
              Semuanya bermula di <strong>Toko Buku</strong>. Seseorang memegang novel Pramoedya, membacanya sebentar, lalu meletakkannya kembali. Harganya <strong>Rp 95.000</strong> — setara anggaran makan seminggu. Bukan karena tak ingin membaca, tapi karena harus memilih.
            </p>
            <p className="pull">
              &quot;Membaca adalah perjalanan. Tapi hari ini, satu buku fisik bisa menjadi pembatas antara seseorang dan pengetahuan. Kami tidak menerima itu.&quot;
            </p>
            <p>
              BUKOO ada untuk membongkar pembatas itu — lewat harga terjangkau mulai <strong>Rp 29.900/bulan</strong>, koleksi yang dikurasi, teknologi yang ramah, dan ekosistem yang adil bagi penerbit. Kami tidak menjual platform. Kami membangun gerakan: <strong>Indonesia Membaca Lagi</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* Statrow */}
      <section className="sec">
        <div className="wrap">
          <div className="statrow">
            <div className="st">
              <div className="st-n">2026</div>
              <div className="st-l">Tahun peluncuran (3 September)</div>
            </div>
            <div className="st">
              <div className="st-n">1<small>Jt</small></div>
              <div className="st-l">Target subscriber 36 bulan</div>
            </div>
            <div className="st">
              <div className="st-n">50</div>
              <div className="st-l">Target penerbit mitra</div>
            </div>
            <div className="st">
              <div className="st-n">2.000<small>+</small></div>
              <div className="st-l">Target judul kurasi</div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="sec alt">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Nilai Kami</span>
            <h2 className="h2">Enam nilai yang <em>memandu</em></h2>
          </div>
          <div className="vchips">
            <span className="vchip">Obsesi pada Pembaca</span>
            <span className="vchip">Transparansi Radikal</span>
            <span className="vchip">Bias Towards Action</span>
            <span className="vchip">Literasi untuk Semua</span>
            <span className="vchip">Tim Kecil, Dampak Besar</span>
            <span className="vchip">Rayakan Kemenangan Kecil</span>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="sec">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Tim Kami</span>
            <h2 className="h2">Orang di balik <em>gerakan</em></h2>
          </div>
          <div className="team">
            <div className="tm">
              <div className="tm-av">RA</div>
              <h4>Rizqi Baihaqi Ahmadi</h4>
              <p>Founder &amp; Chief Executive Officer</p>
            </div>
            <div className="tm">
              <div className="tm-av">ER</div>
              <h4>Eko Rahmat</h4>
              <p>Chief Technology Officer &amp; Co-Founder</p>
            </div>
            <div className="tm">
              <div className="tm-av">AS</div>
              <h4>Ahmad Syarifudin</h4>
              <p>Head of Marketing &amp; Communications</p>
            </div>
            <div className="tm">
              <div className="tm-av">RP</div>
              <h4>M. Rizky Pontoh</h4>
              <p>Head of Legal &amp; Compliance</p>
            </div>
            <div className="tm">
              <div className="tm-av">MM</div>
              <h4>Muhammad Mustofa</h4>
              <p>Head of Publisher Relations</p>
            </div>
            <div className="tm">
              <div className="tm-av">AM</div>
              <h4>Ahmad Mustafa</h4>
              <p>Komisaris</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="sec">
        <div className="wrap">
          <div className="cband">
            <h3>Ingin tumbuh bersama kami?</h3>
            <p>Lihat peluang berkarier, atau hubungi tim kami langsung.</p>
            <Link href="/karir" className="btn-cta btn-lg">Lihat karir →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
