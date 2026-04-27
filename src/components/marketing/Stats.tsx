import React from 'react';

export function Stats() {
  return (
    <div className="stats-section">
      <div className="stat-item">
        <div className="stat-num">229<span>Jt</span></div>
        <div className="stat-label">Potensi Pengguna Internet Indonesia</div>
      </div>
      <div className="stat-item">
        <div className="stat-num">200<span>k+</span></div>
        <div className="stat-label">Judul Buku Tersedia</div>
      </div>
      <div className="stat-item">
        <div className="stat-num">500<span>+</span></div>
        <div className="stat-label">Penerbit Mitra</div>
      </div>
      <div className="stat-item">
        <div className="stat-num">Rp<span>19rb</span></div>
        <div className="stat-label">Harga Langganan Mulai Dari</div>
      </div>
    </div>
  );
}
