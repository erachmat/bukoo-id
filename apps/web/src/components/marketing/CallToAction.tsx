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
      <h2 className="cta-h2">Mulai Petualangan<br />Membacamu <em>Hari Ini</em></h2>
      <p className="cta-sub">Bergabung dengan jutaan pembaca Indonesia. Baca di aplikasi BUKOO untuk iOS &amp; Android — 7 hari pertama gratis.</p>
      <form className="cta-input-row" onSubmit={handleSubmit}>
        <input
          className="hero-input"
          type="email"
          placeholder="Masukkan email kamu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button className="hero-btn" type="submit">Mulai Gratis →</button>
      </form>
      <div className="cta-fine">Dengan mendaftar, kamu menyetujui Syarat &amp; Ketentuan dan Kebijakan Privasi BUKOO</div>
    </section>
  );
}
