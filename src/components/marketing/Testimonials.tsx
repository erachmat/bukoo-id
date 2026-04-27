import React from 'react';

export function Testimonials() {
  return (
    <section className="testi-section">
      <div className="text-center">
        <span className="s-eyebrow">Apa Kata Mereka</span>
        <h2 className="s-h2">Jutaan Pembaca<br />Sudah Merasakan Manfaatnya</h2>
      </div>

      <div className="testi-grid">
        <div className="testi-card">
          <div className="testi-quote-icon">"</div>
          <p className="testi-text">BUKOO benar-benar mengubah cara saya membaca. Dulu beli buku mahal dan habis dibaca sekali. Sekarang saya bisa baca 3–4 buku per bulan dengan harga segelas kopi kekinian. AI Companion-nya bikin saya temukan buku yang tadinya tidak pernah terpikirkan!</p>
          <div className="testi-author">
            <div className="testi-avatar" style={{ background: 'linear-gradient(135deg,var(--amber),#8B6000)' }}>A</div>
            <div>
              <div className="testi-name">Andi Setiawan</div>
              <div className="testi-role">Software Engineer · Jakarta</div>
              <div className="testi-stars">★★★★★</div>
            </div>
          </div>
        </div>

        <div className="testi-card" style={{ borderColor: 'rgba(201,149,42,.25)' }}>
          <div className="testi-quote-icon">"</div>
          <p className="testi-text">Sebagai mahasiswa, dulu saya selalu kesulitan akses buku akademik yang mahal. Dengan BUKOO tier Baca seharga Rp 19.900, saya bisa baca buku-buku yang biasanya ratusan ribu. Fitur komunitas juga seru, bisa diskusi bareng pembaca lain!</p>
          <div className="testi-author">
            <div className="testi-avatar" style={{ background: 'linear-gradient(135deg,var(--teal),#006B5A)' }}>R</div>
            <div>
              <div className="testi-name">Rara Puspita</div>
              <div className="testi-role">Mahasiswi Sastra · Yogyakarta</div>
              <div className="testi-stars">★★★★★</div>
            </div>
          </div>
        </div>

        <div className="testi-card">
          <div className="testi-quote-icon">"</div>
          <p className="testi-text">Koleksi buku Indonesia-nya luar biasa lengkap! Dari Pramoedya sampai penulis-penulis baru yang belum saya kenal. Fitur offline-nya sangat berguna saat saya traveling ke daerah yang sinyal susah. BUKOO Originals juga fresh banget kontennya!</p>
          <div className="testi-author">
            <div className="testi-avatar" style={{ background: 'linear-gradient(135deg,#8B2FC9,#4A0D80)' }}>D</div>
            <div>
              <div className="testi-name">Dinda Maharani</div>
              <div className="testi-role">Content Creator · Bandung</div>
              <div className="testi-stars">★★★★★</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
