import Link from 'next/link';

export function PricingTeaser() {
  return (
    <section className="homepage-pricing-teaser">
      <p className="homepage-eyebrow">Harga Paket</p>
      <h2>Semua ini,<br /><em>Mulai Rp 29.900</em></h2>
      <p>Ada paket untuk pelajar, profesional, sampai keluarga. Pilih yang paling pas — upgrade atau berhenti kapan saja.</p>
      <strong>Mulai Rp 29.900/bulan. Batalkan kapan saja.</strong>
      <div className="homepage-pricing-actions">
        <Link href="/register" className="homepage-button">Coba Gratis</Link>
        <Link href="/pricing" className="homepage-button homepage-button-outline">Lihat Semua Paket</Link>
      </div>
      <small>Tanpa kartu kredit untuk mulai · Batalkan kapan saja</small>
    </section>
  );
}
