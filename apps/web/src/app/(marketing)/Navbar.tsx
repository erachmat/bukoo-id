'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { signOut } from '@/app/(auth)/actions';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMobileSub, setActiveMobileSub] = useState<string | null>(null);
  const { status } = useSession();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = () => {
    signOut();
  };

  const toggleMobileSub = (key: string) => {
    setActiveMobileSub(activeMobileSub === key ? null : key);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setActiveMobileSub(null);
  };

  const renderAuthButtons = () => {
    if (status === 'loading') {
      return <div style={{ width: 160, height: 40 }} />;
    }
    if (status === 'authenticated') {
      return (
        <>
          <Link href="/library"><button className="btn-ghost">Library</button></Link>
          <button className="btn-cta" onClick={handleSignOut}>Keluar</button>
        </>
      );
    }
    return (
      <>
        <Link href="/login"><button className="btn-ghost">Masuk</button></Link>
        <Link href="/register"><button className="btn-cta">Coba Gratis</button></Link>
      </>
    );
  };

  return (
    <>
      <nav className={`nav ${scrolled ? 'scrolled' : ''}`} id="navbar">
        <Link href="/" className="nav-logo" style={{ textDecoration: 'none' }}>
          <img src="/bukoo-logo.svg" alt="BUKOO" className="nav-logo-img" />
          <span>BUKOO</span>
        </Link>

        <ul className="nav-links">
          {/* 1. Beranda */}
          <li className="nav-item">
            <Link href="/" className="nav-link">Beranda</Link>
          </li>

          {/* 2. Produk (Dropdown) */}
          <li className="nav-item">
            <span className="nav-link">
              Produk
              <svg className="nav-caret" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2.5 4.5L6 8L9.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div className="nav-dropdown">
              <Link href="/koleksi" className="nav-dropdown-item">
                Koleksi Buku
                <div className="nav-dropdown-desc">Ribuan e-book terlengkap</div>
              </Link>
              <Link href="/ai-companion" className="nav-dropdown-item">
                Bukoo Assistant
                <div className="nav-dropdown-desc">Asisten membaca pintar</div>
              </Link>
              <Link href="/komunitas" className="nav-dropdown-item">
                Komunitas
                <div className="nav-dropdown-desc">Klub baca &amp; ulasan</div>
              </Link>
              <Link href="/audiobook" className="nav-dropdown-item">
                Audiobook
                <div className="nav-dropdown-desc">Dengar narasi berkualitas</div>
                <span className="nav-dropdown-badge">Coming soon</span>
              </Link>
            </div>
          </li>

          {/* 3. Harga */}
          <li className="nav-item">
            <Link href="/pricing" className="nav-link">Harga</Link>
          </li>

          {/* 4. Untuk Penerbit */}
          <li className="nav-item">
            <a
              href="https://publisher.bukoo.id/publisher/daftar"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link"
            >
              Untuk Penerbit
            </a>
          </li>

          {/* 5. Perusahaan (Dropdown) */}
          <li className="nav-item">
            <span className="nav-link">
              Perusahaan
              <svg className="nav-caret" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2.5 4.5L6 8L9.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div className="nav-dropdown">
              <Link href="/tentang" className="nav-dropdown-item">Tentang Kami</Link>
              <Link href="/karir" className="nav-dropdown-item">Karir</Link>
              <Link href="/newsroom" className="nav-dropdown-item">Newsroom</Link>
              <Link href="/investor-relations" className="nav-dropdown-item">Investor Relations</Link>
              <Link href="/blog" className="nav-dropdown-item">Blog</Link>
              <Link href="/kontak" className="nav-dropdown-item">Kontak</Link>
            </div>
          </li>

          {/* 6. Bantuan (Dropdown) */}
          <li className="nav-item">
            <span className="nav-link">
              Bantuan
              <svg className="nav-caret" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2.5 4.5L6 8L9.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div className="nav-dropdown">
              <Link href="/bantuan" className="nav-dropdown-item">Pusat Bantuan</Link>
              <Link href="/langganan-bantuan" className="nav-dropdown-item">Langganan</Link>
              <Link href="/pembayaran" className="nav-dropdown-item">Pembayaran</Link>
              <Link href="/perangkat" className="nav-dropdown-item">Perangkat &amp; App</Link>
              <Link href="/faq" className="nav-dropdown-item">FAQ</Link>
            </div>
          </li>
        </ul>

        <div className="nav-right">
          {renderAuthButtons()}
        </div>

        <div className="nav-mobile-menu" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          )}
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-dropdown">
          <ul className="mobile-dropdown-links">
            <li>
              <Link href="/" onClick={closeMobileMenu}>Beranda</Link>
            </li>

            {/* Produk Submenu Accordion */}
            <li>
              <button className="mobile-nav-parent" onClick={() => toggleMobileSub('produk')}>
                <span>Produk</span>
                <svg className={`mobile-nav-caret ${activeMobileSub === 'produk' ? 'open' : ''}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2.5 4.5L6 8L9.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {activeMobileSub === 'produk' && (
                <ul className="mobile-nav-sub">
                  <li><Link href="/koleksi" onClick={closeMobileMenu}>Koleksi Buku</Link></li>
                  <li><Link href="/ai-companion" onClick={closeMobileMenu}>Bukoo Assistant</Link></li>
                  <li><Link href="/komunitas" onClick={closeMobileMenu}>Komunitas</Link></li>
                  <li><Link href="/audiobook" onClick={closeMobileMenu}>Audiobook <span className="mobile-nav-badge">Coming soon</span></Link></li>
                </ul>
              )}
            </li>

            <li>
              <Link href="/pricing" onClick={closeMobileMenu}>Harga</Link>
            </li>

            <li>
              <a
                href="https://publisher.bukoo.id/publisher/daftar"
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMobileMenu}
              >
                Untuk Penerbit
              </a>
            </li>

            {/* Perusahaan Submenu Accordion */}
            <li>
              <button className="mobile-nav-parent" onClick={() => toggleMobileSub('perusahaan')}>
                <span>Perusahaan</span>
                <svg className={`mobile-nav-caret ${activeMobileSub === 'perusahaan' ? 'open' : ''}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2.5 4.5L6 8L9.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {activeMobileSub === 'perusahaan' && (
                <ul className="mobile-nav-sub">
                  <li><Link href="/tentang" onClick={closeMobileMenu}>Tentang Kami</Link></li>
                  <li><Link href="/karir" onClick={closeMobileMenu}>Karir</Link></li>
                  <li><Link href="/newsroom" onClick={closeMobileMenu}>Newsroom</Link></li>
                  <li><Link href="/investor-relations" onClick={closeMobileMenu}>Investor Relations</Link></li>
                  <li><Link href="/blog" onClick={closeMobileMenu}>Blog</Link></li>
                  <li><Link href="/kontak" onClick={closeMobileMenu}>Kontak</Link></li>
                </ul>
              )}
            </li>

            {/* Bantuan Submenu Accordion */}
            <li>
              <button className="mobile-nav-parent" onClick={() => toggleMobileSub('bantuan')}>
                <span>Bantuan</span>
                <svg className={`mobile-nav-caret ${activeMobileSub === 'bantuan' ? 'open' : ''}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2.5 4.5L6 8L9.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {activeMobileSub === 'bantuan' && (
                <ul className="mobile-nav-sub">
                  <li><Link href="/bantuan" onClick={closeMobileMenu}>Pusat Bantuan</Link></li>
                  <li><Link href="/langganan-bantuan" onClick={closeMobileMenu}>Langganan</Link></li>
                  <li><Link href="/pembayaran" onClick={closeMobileMenu}>Pembayaran</Link></li>
                  <li><Link href="/perangkat" onClick={closeMobileMenu}>Perangkat &amp; App</Link></li>
                  <li><Link href="/faq" onClick={closeMobileMenu}>FAQ</Link></li>
                </ul>
              )}
            </li>
          </ul>

          <div className="mobile-dropdown-actions">
            {status === 'authenticated' ? (
              <>
                <Link href="/library" onClick={closeMobileMenu}>
                  <button className="btn-ghost" style={{ width: '100%', marginBottom: '8px' }}>Library</button>
                </Link>
                <button className="btn-cta" onClick={() => { handleSignOut(); closeMobileMenu(); }} style={{ width: '100%' }}>Keluar</button>
              </>
            ) : status === 'loading' ? (
              <div style={{ height: 80 }} />
            ) : (
              <>
                <Link href="/login" onClick={closeMobileMenu}>
                  <button className="btn-ghost" style={{ width: '100%', marginBottom: '8px' }}>Masuk</button>
                </Link>
                <Link href="/register" onClick={closeMobileMenu}>
                  <button className="btn-cta" style={{ width: '100%' }}>Coba Gratis</button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
