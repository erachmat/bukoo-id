import './redesign.css'
import Link from 'next/link'

import Navbar from './Navbar'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="marketing-body">
      <Navbar />
      <main>
        {children}
      </main>
      <footer className="footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">BUKOO</div>
            <p className="footer-tagline">Platform langganan buku digital #1 Indonesia. Baca tanpa batas, mulai dari Rp 19.900/bulan.</p>
            <div className="social-row">
              <div className="social-btn">📘</div>
              <div className="social-btn">📷</div>
              <div className="social-btn">🎵</div>
              <div className="social-btn">🐦</div>
              <div className="social-btn">▶</div>
            </div>
          </div>

          <div>
            <div className="footer-col-title">Produk</div>
            <ul className="footer-links">
              <li><a href="#">Koleksi Buku</a></li>
              <li><a href="#">Audiobook</a></li>
              <li><a href="#">BUKOO Originals</a></li>
              <li><a href="#">AI Companion</a></li>
              <li><a href="#">Komunitas</a></li>
              <li><a href="#">Harga &amp; Paket</a></li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Perusahaan</div>
            <ul className="footer-links">
              <li><a href="#">Tentang BUKOO</a></li>
              <li><a href="#">Karir</a></li>
              <li><a href="#">Newsroom</a></li>
              <li><a href="#">Investor Relations</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Kontak</a></li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Untuk Penerbit</div>
            <ul className="footer-links">
              <li><a href="#">Daftar Penerbit</a></li>
              <li><a href="#">Publisher Dashboard</a></li>
              <li><a href="#">Kebijakan Royalti</a></li>
              <li><a href="#">Submit Judul</a></li>
              <li><a href="#">Panduan Penerbit</a></li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Bantuan</div>
            <ul className="footer-links">
              <li><a href="#">Pusat Bantuan</a></li>
              <li><a href="#">Cara Berlangganan</a></li>
              <li><a href="#">Pembayaran</a></li>
              <li><a href="#">Perangkat &amp; App</a></li>
              <li><a href="#">Komunitas FAQ</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-copy">© 2025 PT BUKOO DIGITAL INDONESIA · Semua hak dilindungi</div>
          <div className="footer-legal">
            <a href="#">Syarat &amp; Ketentuan</a>
            <a href="#">Privasi</a>
            <a href="#">Cookie</a>
            <a href="#">Aksesibilitas</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
