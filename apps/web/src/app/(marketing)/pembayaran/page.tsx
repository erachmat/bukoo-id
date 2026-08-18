import Link from 'next/link';

export default function PembayaranBantuanPage() {
  return (
    <div style={{ padding: '160px 24px 100px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#fff', marginBottom: '16px' }}>
        Metode Pembayaran BUKOO
      </h1>
      <p style={{ fontSize: '16px', color: 'var(--text-dim)', marginBottom: '32px', lineHeight: 1.6 }}>
        BUKOO mendukung berbagai metode pembayaran lokal Indonesia yang cepat, aman, dan tanpa biaya tambahan.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '40px' }}>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>📲</div>
          <h4 style={{ color: '#fff', marginBottom: '4px' }}>E-Wallet &amp; QRIS</h4>
          <p style={{ color: 'var(--text-dim)', fontSize: '13px' }}>GoPay, OVO, ShopeePay, DANA, LinkAja, &amp; QRIS Nasional</p>
        </div>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🏦</div>
          <h4 style={{ color: '#fff', marginBottom: '4px' }}>Virtual Account</h4>
          <p style={{ color: 'var(--text-dim)', fontSize: '13px' }}>BCA, Mandiri, BRI, BNI, Permata, &amp; Bank Danamon</p>
        </div>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>💳</div>
          <h4 style={{ color: '#fff', marginBottom: '4px' }}>Kartu Kredit / Debit</h4>
          <p style={{ color: 'var(--text-dim)', fontSize: '13px' }}>Visa, Mastercard, &amp; JCB berlogo 3D Secure</p>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <Link href="/bantuan">
          <button className="btn-ghost">Kembali ke Pusat Bantuan</button>
        </Link>
      </div>
    </div>
  );
}
