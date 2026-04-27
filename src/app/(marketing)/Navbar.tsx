'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    // run once to set initial state
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav className={`nav ${scrolled ? 'scrolled' : ''}`} id="navbar">
        <div className="nav-logo">BUKOO</div>
        <ul className="nav-links">
          <li><Link href="/">Beranda</Link></li>
          <li><Link href="/koleksi">Koleksi</Link></li>
          <li><Link href="/originals">BUKOO Originals</Link></li>
          <li><Link href="/pricing">Harga</Link></li>
          <li><Link href="/komunitas">Komunitas</Link></li>
          <li><Link href="/penerbit">Untuk Penerbit</Link></li>
        </ul>
        <div className="nav-right">
          <Link href="/login"><button className="btn-ghost">Masuk</button></Link>
          <Link href="/register"><button className="btn-cta">Coba Gratis</button></Link>
        </div>
        <div className="nav-mobile-menu" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          )}
        </div>
      </nav>
      {mobileMenuOpen && (
        <div className="mobile-dropdown">
          <ul className="mobile-dropdown-links">
            <li><Link href="/" onClick={() => setMobileMenuOpen(false)}>Beranda</Link></li>
            <li><Link href="/koleksi" onClick={() => setMobileMenuOpen(false)}>Koleksi</Link></li>
            <li><Link href="/originals" onClick={() => setMobileMenuOpen(false)}>BUKOO Originals</Link></li>
            <li><Link href="/pricing" onClick={() => setMobileMenuOpen(false)}>Harga</Link></li>
            <li><Link href="/komunitas" onClick={() => setMobileMenuOpen(false)}>Komunitas</Link></li>
            <li><Link href="/penerbit" onClick={() => setMobileMenuOpen(false)}>Untuk Penerbit</Link></li>
          </ul>
          <div className="mobile-dropdown-actions">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}><button className="btn-ghost">Masuk</button></Link>
            <Link href="/register" onClick={() => setMobileMenuOpen(false)}><button className="btn-cta">Coba Gratis</button></Link>
          </div>
        </div>
      )}
    </>
  );
}
