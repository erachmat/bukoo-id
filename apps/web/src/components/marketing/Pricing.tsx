import React from 'react';

export function Pricing() {
  return (
    <section className="pricing-section" id="pricing">
      <div className="pricing-header">
        <span className="s-eyebrow" style={{ display: 'block', textAlign: 'center' }}>Harga &amp; Paket</span>
        <h2 className="pricing-h2">Pilih Paket yang Tepat<br />untuk Kamu</h2>
        <p className="pricing-sub">Mulai gratis, upgrade kapan saja. Tidak ada biaya tersembunyi.</p>
      </div>

      <div className="pricing-grid">
        {/* FREE */}
        <div className="price-card">
          <div className="price-tier-num">TIER 0</div>
          <div className="price-name">Bebas</div>
          <div className="price-target">Untuk pemula</div>
          <div className="price-amount price-amount-gratis">Gratis</div>
          <div className="price-period">Selamanya</div>
          <ul className="price-features">
            <li className="pf-item"><span className="pf-check">✓</span>50 buku rotasi bulanan</li>
            <li className="pf-item"><span className="pf-check">✓</span>Preview 1 bab semua koleksi</li>
            <li className="pf-item"><span className="pf-check">✓</span>Akses komunitas dasar</li>
            <li className="pf-item"><span className="pf-cross">✗</span>Ada iklan ringan</li>
            <li className="pf-item"><span className="pf-cross">✗</span>Audiobook</li>
            <li className="pf-item"><span className="pf-cross">✗</span>Offline reading</li>
          </ul>
          <button className="price-cta-btn price-cta-outline">Mulai Gratis</button>
        </div>

        {/* BACA */}
        <div className="price-card">
          <div className="price-tier-num">TIER 1</div>
          <div className="price-name">Baca</div>
          <div className="price-target">Pelajar &amp; Mahasiswa</div>
          <div className="price-amount price-amount-paid">29.900</div>
          <div className="price-period">per bulan</div>
          <ul className="price-features">
            <li className="pf-item"><span className="pf-check">✓</span>2.000+ judul kurasi</li>
            <li className="pf-item"><span className="pf-check">✓</span>Koleksi lokal penuh</li>
            <li className="pf-item"><span className="pf-check">✓</span>Offline 10 judul</li>
            <li className="pf-item"><span className="pf-check">✓</span>Tanpa iklan</li>
            <li className="pf-item"><span className="pf-cross">✗</span>Audiobook</li>
            <li className="pf-item"><span className="pf-cross">✗</span>AI Companion</li>
          </ul>
          <button className="price-cta-btn price-cta-outline">Mulai Sekarang</button>
        </div>

        {/* PLUS (featured) */}
        <div className="price-card featured">
          <div className="price-pop-badge">✦ Terpopuler</div>
          <div className="price-tier-num">TIER 2</div>
          <div className="price-name">Plus</div>
          <div className="price-target">Profesional muda</div>
          <div className="price-amount price-amount-paid">49.900</div>
          <div className="price-period">per bulan</div>
          <ul className="price-features">
            <li className="pf-item"><span className="pf-check">✓</span>2.000+ judul kurasi</li>
            <li className="pf-item"><span className="pf-check">✓</span>Audiobook Indonesia</li>
            <li className="pf-item"><span className="pf-check">✓</span>Offline unlimited</li>
            <li className="pf-item"><span className="pf-check">✓</span>AI Rekomendasi</li>
            <li className="pf-item"><span className="pf-check">✓</span>Social Reading penuh</li>
            <li className="pf-item"><span className="pf-cross">✗</span>Kredit buku terbaru</li>
          </ul>
          <button className="price-cta-btn price-cta-filled">Coba 7 Hari Gratis →</button>
        </div>

        {/* PREMIUM */}
        <div className="price-card">
          <div className="price-tier-num">TIER 3</div>
          <div className="price-name">Premium</div>
          <div className="price-target">Pembaca serius</div>
          <div className="price-amount price-amount-paid">79.900</div>
          <div className="price-period">per bulan</div>
          <ul className="price-features">
            <li className="pf-item"><span className="pf-check">✓</span>Seluruh katalog global</li>
            <li className="pf-item"><span className="pf-check">✓</span>3 kredit buku terbaru</li>
            <li className="pf-item"><span className="pf-check">✓</span>AI Companion penuh</li>
            <li className="pf-item"><span className="pf-check">✓</span>BUKOO Originals</li>
            <li className="pf-item"><span className="pf-check">✓</span>Majalah &amp; jurnal</li>
            <li className="pf-item"><span className="pf-check">✓</span>Priority support</li>
          </ul>
          <button className="price-cta-btn price-cta-outline">Mulai Sekarang</button>
        </div>

        {/* KELUARGA */}
        <div className="price-card">
          <div className="price-tier-num">TIER 4</div>
          <div className="price-name">Keluarga</div>
          <div className="price-target">5 akun · Hemat 40%</div>
          <div className="price-amount price-amount-paid">99.900</div>
          <div className="price-period">per bulan · 5 akun</div>
          <ul className="price-features">
            <li className="pf-item"><span className="pf-check">✓</span>Semua fitur Premium</li>
            <li className="pf-item"><span className="pf-check">✓</span>5 profil terpisah</li>
            <li className="pf-item"><span className="pf-check">✓</span>Konten anak</li>
            <li className="pf-item"><span className="pf-check">✓</span>Parental control</li>
            <li className="pf-item"><span className="pf-check">✓</span>Rak buku keluarga</li>
            <li className="pf-item"><span className="pf-check">✓</span>Hemat vs 5× Premium</li>
          </ul>
          <button className="price-cta-btn price-cta-outline">Mulai Sekarang</button>
        </div>
      </div>

      <p className="pricing-note">Semua paket dilengkapi 7 hari percobaan gratis · Batalkan kapan saja · Tanpa kartu kredit untuk mulai</p>
    </section>
  );
}
