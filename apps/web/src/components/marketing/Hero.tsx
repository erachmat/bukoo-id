'use client'

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Hero background. Deliberately a plain <picture> and not next/image: the
 * OpenNext worker has no `images` binding, so /_next/image returns the source
 * file byte-for-byte (see @opennextjs/cloudflare images.js — "Image
 * optimization is disabled and the original image is returned if env.IMAGES is
 * undefined"). next/image would therefore ship the full-size original to every
 * viewport. Pre-encoded variants + a real srcSet are what actually cut the
 * transfer here.
 */
const HERO_WIDTHS = [1280, 1920, 2560, 3840] as const;

export function Hero() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) return;
    router.push(`/register?email=${encodeURIComponent(email.trim())}`);
  }

  return (
    <section className="homepage-hero">
      <picture>
        <source
          type="image/webp"
          sizes="100vw"
          srcSet={HERO_WIDTHS.map((w) => `/homepage-assets/hero01-${w}.webp ${w}w`).join(', ')}
        />
        <img
          className="homepage-hero-image"
          src="/homepage-assets/hero01-1920.jpg"
          srcSet={HERO_WIDTHS.map((w) => `/homepage-assets/hero01-${w}.jpg ${w}w`).join(', ')}
          sizes="100vw"
          alt="Buku dan ponsel BUKOO di dekat jendela"
          fetchPriority="high"
          decoding="async"
        />
      </picture>
      <div className="homepage-hero-overlay" />

      <div className="hero-content">
        <h1 className="hero-h1">
          Baca Tanpa Batas,
          <em>Mulai Hari ini</em>
        </h1>

        <p className="hero-sub">
          Ratusan Judul kurasi dari penerbit Indonesia — fiksi, non-fiksi semua langsung dari aplikasi BUKOO.
        </p>
        <p className="hero-price">Mulai Rp 29.900/bulan. Batalkan kapan saja.</p>

        <form className="hero-input-row" onSubmit={handleSubmit}>
          <input
            className="hero-input"
            type="email"
            placeholder="Masukkan email untuk memulai"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button className="hero-btn" type="submit">MULAI GRATIS</button>
        </form>
      </div>
    </section>
  );
}
