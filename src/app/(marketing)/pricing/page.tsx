import { Pricing } from '@/components/marketing/Pricing';
import { ComparisonTable } from '@/components/marketing/ComparisonTable';
import { FAQ } from '@/components/marketing/FAQ';
import { CallToAction } from '@/components/marketing/CallToAction';

export default function PricingPage() {
  return (
    <>
      <div style={{ paddingTop: '100px' }}>
        <Pricing />
      </div>

      <ComparisonTable />

      {/* Enterprise / Publisher Banner */}
      <section style={{ maxWidth: '1000px', margin: '0 auto 80px', padding: '0 24px' }}>
        <div className="enterprise-banner">
          <div style={{ flex: '1', minWidth: '300px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>Untuk Perusahaan &amp; Institusi</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: '1.6' }}>
              Butuh akses untuk karyawan, mahasiswa, atau perpustakaan digital Anda? Hubungi tim sales kami untuk paket enterprise dengan harga khusus dan integrasi sistem.
            </p>
          </div>
          <button className="price-cta-btn price-cta-filled" style={{ padding: '12px 32px' }}>Hubungi Sales</button>
        </div>
      </section>

      <FAQ />
      
      <div style={{ marginTop: '80px' }}>
        <CallToAction />
      </div>
    </>
  );
}
