'use client'

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export function CallToAction() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) return;
    router.push(`/register?email=${encodeURIComponent(email.trim())}`);
  }

  return (
    <section className="cta-final">
      <div className="cta-final-bg"></div>
      <h2 className="cta-h2">Siap Mulai Membaca?</h2>
      <p className="cta-sub">Ratusan Judul kurasi dari penerbit Indonesia — fiksi, non-fiksi semua langsung dari aplikasi BUKOO.</p>
      <p className="cta-price">Mulai Rp 29.900/bulan. Batalkan kapan saja.</p>
      <form className="cta-input-row" onSubmit={handleSubmit}>
        <input
          className="hero-input"
          type="email"
          placeholder="Masukkan email untuk memulai"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button className="hero-btn" type="submit">MULAI</button>
      </form>
      <div className="cta-fine">Dengan mendaftar, kamu menyetujui Syarat &amp; Ketentuan dan Kebijakan Privasi BUKOO</div>
    </section>
  );
}
