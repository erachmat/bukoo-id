'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

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
    <nav className={`nav ${scrolled ? 'scrolled' : ''}`} id="navbar">
      <div className="nav-logo">BUKOO</div>
      <ul className="nav-links">
        <li><Link href="/">Beranda</Link></li>
        <li><Link href="/library">Koleksi</Link></li>
        <li><Link href="#">BUKOO Originals</Link></li>
        <li><Link href="/pricing">Harga</Link></li>
        <li><Link href="#">Komunitas</Link></li>
        <li><Link href="#">Untuk Penerbit</Link></li>
      </ul>
      <div className="nav-right">
        <Link href="/login"><button className="btn-ghost">Masuk</button></Link>
        <Link href="/register"><button className="btn-cta">Coba Gratis</button></Link>
      </div>
    </nav>
  );
}
