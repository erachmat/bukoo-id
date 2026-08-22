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
            <div className="footer-logo">
              <img src="/bukoo-logo.svg" alt="BUKOO" className="footer-logo-img" />
              <span>BUKOO</span>
            </div>
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
              <li><Link href="/ai-companion">Bukoo Assistant</Link></li>
              <li><Link href="/komunitas">Komunitas</Link></li>
              <li><Link href="/audiobook">Audiobook <span className="footer-badge">Coming soon</span></Link></li>
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
              <li><Link href="/kontak">Kontak</Link></li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Untuk Penerbit</div>
            <ul className="footer-links">
              <li><a href="https://publisher.bukoo.id/publisher/daftar" target="_blank" rel="noopener noreferrer">Daftar Penerbit</a></li>
              <li><a href="https://publisher.bukoo.id/publisher/dashboard" target="_blank" rel="noopener noreferrer">Publisher Dashboard</a></li>
              <li><a href="https://publisher.bukoo.id/publisher/royalti" target="_blank" rel="noopener noreferrer">Kebijakan Royalti</a></li>
              <li><a href="https://publisher.bukoo.id/publisher/submit" target="_blank" rel="noopener noreferrer">Submit Judul</a></li>
              <li><a href="https://publisher.bukoo.id/publisher/panduan" target="_blank" rel="noopener noreferrer">Panduan Penerbit</a></li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Bantuan</div>
            <ul className="footer-links">
              <li><Link href="/bantuan">Pusat Bantuan</Link></li>
              <li><Link href="/langganan-bantuan">Cara Berlangganan</Link></li>
              <li><Link href="/pembayaran">Pembayaran</Link></li>
              <li><Link href="/perangkat">Perangkat &amp; App</Link></li>
              <li><Link href="/faq">Komunitas FAQ</Link></li>
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
