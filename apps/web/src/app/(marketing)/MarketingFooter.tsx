'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function MarketingFooter() {
  const isHomepage = usePathname() === '/'

  return (
    <footer className="footer">
      <div className={`footer-grid${isHomepage ? ' footer-grid-home' : ''}`}>
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
            <p className="footer-tagline">Platform langganan buku digital Indonesia. Baca tanpa batas, mulai dari Rp 29.900/bulan.</p>
          )}
          <div className="social-row">
            <a className="social-btn" href="https://www.instagram.com/bukooid" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a className="social-btn" href="https://www.linkedin.com/company/bukoo-indonesia/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7.5 10v7" />
                <circle cx="7.5" cy="7" r="1.2" fill="currentColor" stroke="none" />
                <path d="M11.5 17v-7" />
                <path d="M11.5 13.2c0-1.8 1.2-3.2 3-3.2s3 1.4 3 3.2V17" />
              </svg>
            </a>
            <a className="social-btn" href="https://www.tiktok.com/@bukooid" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 4v10.5a3.5 3.5 0 1 1-3.5-3.5" />
                <path d="M14.5 6.5c.8 1.6 2.2 2.6 4 2.8" />
              </svg>
            </a>
            <a className="social-btn" href="https://www.youtube.com/@bukooid" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
                <path d="M10.5 9.5l5 2.5-5 2.5v-5z" fill="currentColor" stroke="none" />
              </svg>
            </a>
          </div>
        </div>

        {isHomepage ? (
          <>
            <div>
              <div className="footer-col-title">Perusahaan</div>
              <ul className="footer-links"><li><Link href="/">Homepage Pembaca</Link></li><li><Link href="/tentang">Tentang BUKOO</Link></li><li><Link href="/newsroom">Newsroom</Link></li><li><Link href="/kontak">Kontak</Link></li></ul>
            </div>
            <div>
              <div className="footer-col-title">Penerbit</div>
              <ul className="footer-links"><li><a href="https://publisher.bukoo.id/">Daftar Penerbit</a></li><li><a href="https://publisher.bukoo.id/publisher/dashboard">Dashboard</a></li><li><a href="https://publisher.bukoo.id/publisher/submit">Submit judul</a></li><li><a href="https://publisher.bukoo.id/publisher/royalti">Kebijakan Royalti</a></li><li><a href="https://publisher.bukoo.id/publisher/panduan">Panduan Penerbit</a></li></ul>
            </div>
          </>
        ) : (
          <>
            <div><div className="footer-col-title">Produk</div><ul className="footer-links"><li><Link href="/koleksi">Koleksi Buku</Link></li><li><Link href="/ai-companion">Bukoo Assistant</Link></li><li><Link href="/komunitas">Komunitas</Link></li><li><Link href="/audiobook">Audiobook</Link></li><li><Link href="/pricing">Harga &amp; Paket</Link></li></ul></div>
            <div><div className="footer-col-title">Perusahaan</div><ul className="footer-links"><li><Link href="/tentang">Tentang BUKOO</Link></li><li><Link href="/karir">Karir</Link></li><li><Link href="/newsroom">Newsroom</Link></li><li><Link href="/kontak">Kontak</Link></li></ul></div>
            <div><div className="footer-col-title">Untuk Penerbit</div><ul className="footer-links"><li><a href="https://publisher.bukoo.id/">Daftar Penerbit</a></li><li><a href="https://publisher.bukoo.id/publisher/panduan">Panduan Penerbit</a></li></ul></div>
          </>
        )}
      </div>
      <div className="footer-bottom"><div className="footer-copy">© 2026 PT BUKOO DIGITAL INDONESIA · Semua hak dilindungi</div><div className="footer-legal"><Link href="/syarat-ketentuan">Syarat &amp; Ketentuan</Link><Link href="/privasi">Privasi</Link><Link href="/privasi#cookie">Cookie</Link><Link href="/privasi#aksesibilitas">Aksesibilitas</Link></div></div>
    </footer>
  )
}
