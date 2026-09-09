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
    <section className="hero homepage-hero">
      <Image className="homepage-hero-image" src="/homepage-assets/hero01.png" alt="Buku dan ponsel BUKOO di dekat jendela" fill priority sizes="100vw" />
      <div className="homepage-hero-overlay" />

      <div className="hero-content">
        <div className="hero-badge">Platform membaca digital Indonesia</div>

        <h1 className="hero-h1">
          Temukan cerita yang
          <em>menemani langkahmu.</em>
        </h1>

        <p className="hero-sub">
          Ribuan buku, ide, dan perjalanan baru ada di satu tempat. Baca dengan ritmemu sendiri bersama BUKOO.
        </p>

        <form className="hero-input-row" onSubmit={handleSubmit}>
          <input
            className="hero-input"
            type="email"
            placeholder="Masukkan email kamu untuk memulai"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button className="hero-btn" type="submit">Mulai Gratis →</button>
        </form>
        <div className="hero-fine">Mulai gratis · Tanpa kartu kredit · Batalkan kapan saja</div>
      </div>
    </section>
  );
}
