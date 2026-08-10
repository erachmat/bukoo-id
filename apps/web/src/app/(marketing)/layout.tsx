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
            <p className="footer-tagline">Platform langganan buku digital #1 Indonesia. Baca tanpa batas, mulai dari Rp 29.900/bulan.</p>
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
              <li><Link href="/koleksi">Koleksi Buku</Link></li>
              <li><a href="#">Audiobook</a></li>
              <li><Link href="/originals">BUKOO Originals</Link></li>
              <li><a href="#">AI Companion</a></li>
              <li><Link href="/komunitas">Komunitas</Link></li>
              <li><Link href="/pricing">Harga &amp; Paket</Link></li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Perusahaan</div>
            <ul className="footer-links">
              <li><Link href="/tentang">Tentang BUKOO</Link></li>
              <li><Link href="/karir">Karir</Link></li>
              <li><Link href="/newsroom">Newsroom</Link></li>
              <li><Link href="/investor-relations">Investor Relations</Link></li>
              <li><Link href="/blog">Blog</Link></li>
              <li><Link href="/bantuan#kontak">Kontak</Link></li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Untuk Penerbit</div>
            <ul className="footer-links">
              <li><Link href="/penerbit">Daftar Penerbit</Link></li>
              <li><a href="#">Publisher Dashboard</a></li>
              <li><a href="#">Kebijakan Royalti</a></li>
              <li><a href="#">Submit Judul</a></li>
              <li><a href="#">Panduan Penerbit</a></li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Bantuan</div>
            <ul className="footer-links">
              <li><Link href="/bantuan">Pusat Bantuan</Link></li>
              <li><Link href="/pricing">Cara Berlangganan</Link></li>
              <li><a href="#">Pembayaran</a></li>
              <li><a href="#">Perangkat &amp; App</a></li>
              <li><Link href="/komunitas">Komunitas FAQ</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-copy">© 2026 PT BUKOO DIGITAL INDONESIA · Semua hak dilindungi</div>
          <div className="footer-legal">
            <Link href="/syarat-ketentuan">Syarat &amp; Ketentuan</Link>
            <Link href="/privasi">Privasi</Link>
            <Link href="/privasi#cookie">Cookie</Link>
            <Link href="/privasi#aksesibilitas">Aksesibilitas</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
