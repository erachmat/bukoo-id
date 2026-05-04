'use client'

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export function Hero() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) return;
    router.push(`/register?email=${encodeURIComponent(email.trim())}`);
  }

  return (
    <section className="hero">
      <div className="hero-bg"></div>
      <div className="hero-grid"></div>
      <div className="hero-glow-1"></div>
      <div className="hero-glow-2"></div>

      <div className="hero-content">
        <div className="hero-badge">🇮🇩 Platform Buku Digital #1 Indonesia</div>

        <h1 className="hero-h1">
          Baca Tanpa Batas,
          <em>Mulai Hari Ini</em>
          <span>200.000+ Buku</span>
        </h1>

        <p className="hero-sub">
          Nikmati ratusan ribu judul dari penerbit Indonesia dan dunia —
          fiksi, non-fiksi, audiobook, sampai BUKOO Originals eksklusif.
          Harga mulai <strong style={{ color: 'var(--amber)' }}>Rp 19.900/bulan</strong>.
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
        <div className="hero-fine">Coba 7 hari gratis · Tanpa kartu kredit · Batalkan kapan saja</div>
      </div>

      {/* Book shelf */}
      <div className="hero-shelf">
        <div className="shelf-book bg-atomic"><div className="bk-shine"></div><div className="bk-edge"></div>
          <div style={{ position: 'absolute', inset: '0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6px' }}>
            <div style={{ width: '22px', height: '22px', border: '1.5px solid rgba(78,205,196,.8)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '3px' }}><div style={{ width: '10px', height: '10px', border: '1.5px solid rgba(78,205,196,1)', borderRadius: '50%' }}></div></div>
            <div style={{ fontSize: '5px', fontWeight: '700', color: 'rgba(78,205,196,.9)', textAlign: 'center', letterSpacing: '.3px' }}>ATOMIC<br />HABITS</div>
          </div>
        </div>
        <div className="shelf-book bg-laut"><div className="bk-shine"></div><div className="bk-edge"></div>
          <div style={{ position: 'absolute', inset: '0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5px' }}>
            <svg style={{ position: 'absolute', bottom: '0', left: '0', right: '0', width: '100%', height: '40%' }} viewBox="0 0 56 20" preserveAspectRatio="none"><path d="M0,12 Q14,4 28,12 Q42,20 56,12 L56,20 L0,20Z" fill="rgba(255,255,255,.12)" /></svg>
            <div style={{ fontSize: '5.5px', fontWeight: '700', color: 'rgba(255,255,255,.85)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '.3px' }}>LAUT<br />BERCERITA</div>
          </div>
        </div>
        <div className="shelf-book bg-think"><div className="bk-shine"></div><div className="bk-edge"></div>
          <div style={{ position: 'absolute', inset: '0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5px' }}>
            <div style={{ fontSize: '4.5px', fontWeight: '700', color: 'rgba(255,215,0,.7)', letterSpacing: '.3px', marginBottom: '1px' }}>N. HILL</div>
            <div style={{ width: '18px', height: '1px', background: 'rgba(255,215,0,.4)', marginBottom: '2px' }}></div>
            <div style={{ fontSize: '5.5px', fontWeight: '700', color: 'rgba(255,215,0,.9)', textAlign: 'center', lineHeight: '1.3' }}>THINK &<br />GROW RICH</div>
          </div>
        </div>
        <div className="shelf-book bg-sapiens"><div className="bk-shine"></div><div className="bk-edge"></div>
          <div style={{ position: 'absolute', inset: '0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5px' }}>
            <div style={{ fontSize: '4px', color: 'rgba(168,85,247,.8)', letterSpacing: '.8px', marginBottom: '2px' }}>Y.N. HARARI</div>
            <div style={{ fontSize: '10px', fontWeight: '700', color: '#fff', letterSpacing: '.8px' }}>SAPIENS</div>
          </div>
        </div>
        <div className="shelf-book bg-richdad"><div className="bk-shine"></div><div className="bk-edge"></div>
          <div style={{ position: 'absolute', inset: '0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5px' }}>
            <div style={{ fontSize: '5px', fontWeight: '700', color: 'rgba(100,220,130,.9)', textAlign: 'center', lineHeight: '1.3' }}>RICH DAD<br />POOR DAD</div>
            <div style={{ fontSize: '4px', color: 'rgba(255,255,255,.4)', marginTop: '2px' }}>KIYOSAKI</div>
          </div>
        </div>
        <div className="shelf-book bg-psych"><div className="bk-shine"></div><div className="bk-edge"></div>
          <div style={{ position: 'absolute', inset: '0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5px' }}>
            <div style={{ fontSize: '5px', fontWeight: '700', color: 'rgba(147,197,253,.9)', textAlign: 'center', lineHeight: '1.3' }}>PSYCH<br />OF MONEY</div>
            <div style={{ fontSize: '4px', color: 'rgba(255,255,255,.4)', marginTop: '1px' }}>M. HOUSEL</div>
          </div>
        </div>
        <div className="shelf-book bg-bumi"><div className="bk-shine"></div><div className="bk-edge"></div>
          <div style={{ position: 'absolute', inset: '0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5px' }}>
            <div style={{ fontSize: '5px', fontWeight: '700', color: 'rgba(255,200,100,.9)', textAlign: 'center', lineHeight: '1.3' }}>BUMI<br />MANUSIA</div>
            <div style={{ fontSize: '4px', color: 'rgba(255,255,255,.4)', marginTop: '2px' }}>PRAMOEDYA</div>
          </div>
        </div>
        <div className="shelf-book bg-deepwk"><div className="bk-shine"></div><div className="bk-edge"></div>
          <div style={{ position: 'absolute', inset: '0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5px' }}>
            <div style={{ fontSize: '6px', fontWeight: '700', color: 'rgba(255,255,255,.8)', textAlign: 'center', lineHeight: '1.3' }}>DEEP<br />WORK</div>
            <div style={{ fontSize: '4px', color: 'rgba(255,255,255,.4)', marginTop: '2px' }}>CAL NEWPORT</div>
          </div>
        </div>
        <div className="shelf-book bg-ikigai"><div className="bk-shine"></div><div className="bk-edge"></div>
          <div style={{ position: 'absolute', inset: '0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5px' }}>
            <div style={{ fontSize: '8px', fontWeight: '700', color: '#fff', letterSpacing: '.5px' }}>IKIGAI</div>
            <div style={{ fontSize: '11px', marginTop: '2px' }}>🌸</div>
          </div>
        </div>
        <div className="shelf-book bg-7hab"><div className="bk-shine"></div><div className="bk-edge"></div>
          <div style={{ position: 'absolute', inset: '0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5px' }}>
            <div style={{ fontSize: '5px', fontWeight: '700', color: 'rgba(100,220,130,.9)', textAlign: 'center', lineHeight: '1.3' }}>7<br />HABITS</div>
            <div style={{ fontSize: '4px', color: 'rgba(255,255,255,.4)', marginTop: '1px' }}>COVEY</div>
          </div>
        </div>
        <div className="shelf-book bg-alchm"><div className="bk-shine"></div><div className="bk-edge"></div>
          <div style={{ position: 'absolute', inset: '0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5px' }}>
            <div style={{ fontSize: '5.5px', fontWeight: '700', color: 'rgba(255,200,80,.9)', textAlign: 'center', lineHeight: '1.3' }}>THE<br />ALCHEMIST</div>
            <div style={{ fontSize: '4px', color: 'rgba(255,255,255,.35)', marginTop: '1px' }}>PAULO COELHO</div>
          </div>
        </div>
        <div className="shelf-book bg-zero"><div className="bk-shine"></div><div className="bk-edge"></div>
          <div style={{ position: 'absolute', inset: '0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5px' }}>
            <div style={{ fontSize: '5px', fontWeight: '700', color: 'rgba(147,197,253,.9)', textAlign: 'center', lineHeight: '1.3' }}>ZERO TO<br />ONE</div>
            <div style={{ fontSize: '4px', color: 'rgba(255,255,255,.35)', marginTop: '1px' }}>P. THIEL</div>
          </div>
        </div>
      </div>
    </section>
  );
}
