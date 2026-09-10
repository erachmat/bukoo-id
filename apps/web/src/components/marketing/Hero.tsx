'use client'

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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
      <Image className="homepage-hero-image" src="/homepage-assets/hero01.png" alt="Buku dan ponsel BUKOO di dekat jendela" fill priority sizes="100vw" />
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
