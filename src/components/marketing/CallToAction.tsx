import React from 'react';

export function CallToAction() {
  return (
    <section className="cta-final">
      <div className="cta-final-bg"></div>
      <h2 className="cta-h2">Mulai Petualangan<br />Membacamu <em>Hari Ini</em></h2>
      <p className="cta-sub">Bergabung dengan jutaan pembaca Indonesia. 7 hari pertama gratis — tidak perlu kartu kredit.</p>
      <div className="cta-input-row">
        <input className="hero-input" type="email" placeholder="Masukkan email kamu" />
        <button className="hero-btn">Mulai Gratis →</button>
      </div>
      <div className="cta-fine">Dengan mendaftar, kamu menyetujui Syarat &amp; Ketentuan dan Kebijakan Privasi BUKOO</div>
    </section>
  );
}
