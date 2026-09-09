'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function MarketingFooter() {
  const isHomepage = usePathname() === '/'

  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="footer-logo">
            <img src="/bukoo-logo.svg" alt="BUKOO" className="footer-logo-img" />
            <span>BUKOO</span>
          </div>
          {isHomepage ? (
            <>
              <p className="footer-tagline">Pustaka Dalam Genggaman</p>
              <p className="footer-description">Platform langganan buku digital Indonesia. Baca tanpa batas, mulai dari Rp 29.900/bulan.</p>
            </>
          ) : (
            <p className="footer-tagline">Platform langganan buku digital #1 Indonesia. Baca tanpa batas, mulai dari Rp 29.900/bulan.</p>
          )}
          <div className="social-row"><div className="social-btn">📘</div><div className="social-btn">📷</div><div className="social-btn">🎵</div><div className="social-btn">▶</div></div>
        </div>

        {isHomepage ? (
          <>
            <div>
              <div className="footer-col-title">Perusahaan</div>
              <ul className="footer-links"><li><Link href="/tentang">Tentang BUKOO</Link></li><li><Link href="/newsroom">Newsroom</Link></li><li><Link href="/kontak">Kontak</Link></li></ul>
            </div>
            <div>
              <div className="footer-col-title">Penerbit</div>
              <ul className="footer-links"><li><a href="https://publisher.bukoo.id/publisher/daftar">Daftar Penerbit</a></li><li><a href="https://publisher.bukoo.id/publisher/panduan">Panduan Penerbit</a></li></ul>
            </div>
          </>
        ) : (
          <>
            <div><div className="footer-col-title">Produk</div><ul className="footer-links"><li><Link href="/koleksi">Koleksi Buku</Link></li><li><Link href="/ai-companion">Bukoo Assistant</Link></li><li><Link href="/komunitas">Komunitas</Link></li><li><Link href="/audiobook">Audiobook</Link></li><li><Link href="/pricing">Harga &amp; Paket</Link></li></ul></div>
            <div><div className="footer-col-title">Perusahaan</div><ul className="footer-links"><li><Link href="/tentang">Tentang BUKOO</Link></li><li><Link href="/karir">Karir</Link></li><li><Link href="/newsroom">Newsroom</Link></li><li><Link href="/kontak">Kontak</Link></li></ul></div>
            <div><div className="footer-col-title">Untuk Penerbit</div><ul className="footer-links"><li><a href="https://publisher.bukoo.id/publisher/daftar">Daftar Penerbit</a></li><li><a href="https://publisher.bukoo.id/publisher/panduan">Panduan Penerbit</a></li></ul></div>
          </>
        )}
      </div>
      <div className="footer-bottom"><div className="footer-copy">© 2026 PT BUKOO DIGITAL INDONESIA · Semua hak dilindungi</div><div className="footer-legal"><Link href="/syarat-ketentuan">Syarat &amp; Ketentuan</Link><Link href="/privasi">Privasi</Link><Link href="/privasi#cookie">Cookie</Link><Link href="/privasi#aksesibilitas">Aksesibilitas</Link></div></div>
    </footer>
  )
}
