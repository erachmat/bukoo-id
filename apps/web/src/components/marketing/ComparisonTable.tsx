import React from 'react';

export function ComparisonTable() {
  return (
    <section className="comparison-section">
      <div className="text-center" style={{ marginBottom: '40px' }}>
        <span className="s-eyebrow">Bandingkan Fitur</span>
        <h2 className="s-h2">Detail Fitur Setiap Paket</h2>
      </div>

      <div className="compare-table-wrapper">
        <table className="compare-table">
          <thead>
            <tr>
              <th>Fitur &amp; Benefit</th>
              <th>Bebas</th>
              <th>Baca</th>
              <th>Plus ✦</th>
              <th>Premium</th>
              <th>Keluarga</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Akses Katalog Buku</td>
              <td>50 buku bulanan</td>
              <td>2.000+ judul</td>
              <td>2.000+ judul kurasi</td>
              <td>Seluruh katalog</td>
              <td>Seluruh katalog</td>
            </tr>
            <tr>
              <td>Audiobook</td>
              <td><span className="compare-cross">✗</span></td>
              <td><span className="compare-cross">✗</span></td>
              <td><span className="compare-check">✓</span></td>
              <td><span className="compare-check">✓</span></td>
              <td><span className="compare-check">✓</span></td>
            </tr>
            <tr>
              <td>Offline Reading</td>
              <td><span className="compare-cross">✗</span></td>
              <td><span className="compare-check">✓</span><span className="compare-text">Maks 10 judul</span></td>
              <td><span className="compare-check">✓</span><span className="compare-text">Unlimited</span></td>
              <td><span className="compare-check">✓</span><span className="compare-text">Unlimited</span></td>
              <td><span className="compare-check">✓</span><span className="compare-text">Unlimited</span></td>
            </tr>
            <tr>
              <td>Bukoo Assistant</td>
              <td><span className="compare-cross">✗</span></td>
              <td><span className="compare-cross">✗</span></td>
              <td><span className="compare-check">✓</span><span className="compare-text">Rekomendasi</span></td>
              <td><span className="compare-check">✓</span><span className="compare-text">Fitur Penuh</span></td>
              <td><span className="compare-check">✓</span><span className="compare-text">Fitur Penuh</span></td>
            </tr>
            <tr>
              <td>Kredit Buku Terbaru</td>
              <td><span className="compare-cross">✗</span></td>
              <td><span className="compare-cross">✗</span></td>
              <td><span className="compare-cross">✗</span></td>
              <td>3 per bulan</td>
              <td>5 per bulan</td>
            </tr>
            <tr>
              <td>Bebas Iklan</td>
              <td><span className="compare-cross">✗</span></td>
              <td><span className="compare-check">✓</span></td>
              <td><span className="compare-check">✓</span></td>
              <td><span className="compare-check">✓</span></td>
              <td><span className="compare-check">✓</span></td>
            </tr>
            <tr>
              <td>Profil Pengguna</td>
              <td>1 profil</td>
              <td>1 profil</td>
              <td>1 profil</td>
              <td>1 profil</td>
              <td>5 profil</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
