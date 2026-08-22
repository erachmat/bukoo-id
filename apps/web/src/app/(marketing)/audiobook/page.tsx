import Link from 'next/link';

export default function AudiobookPage() {
  return (
    <>
      {/* Coming Soon */}
      <section className="phero">
        <div className="phero-bg"></div>
        <div className="phero-grid"></div>
        <div className="wrap">
          <span className="eyebrow">Produk · Audiobook</span>
          <h1 className="ph-h1">Audiobook <em>segera hadir</em></h1>
          <p className="ph-lead">
            Audiobook Indonesia dengan narasi profesional sedang dalam perjalanan. Nantikan kabar baiknya — kami akan segera mengumumkan ketersediaannya.
          </p>
          <div className="hero-ctas">
            <Link href="/" className="btn-cta btn-lg">Kembali ke Beranda →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
