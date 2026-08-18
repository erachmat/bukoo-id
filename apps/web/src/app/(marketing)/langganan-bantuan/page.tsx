import Link from 'next/link';

export default function LanggananBantuanPage() {
  return (
    <div style={{ padding: '160px 24px 100px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#fff', marginBottom: '16px' }}>
        Panduan &amp; Pengaturan Langganan
      </h1>
      <p style={{ fontSize: '16px', color: 'var(--text-dim)', marginBottom: '32px', lineHeight: 1.6 }}>
        Temukan informasi mengenai cara memulai paket BUKOO PLUS, mengubah paket, hingga pembatalan langganan kapan saja.
      </p>

      <div style={{ display: 'grid', gap: '20px' }}>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
          <h3 style={{ color: 'var(--amber)', fontSize: '18px', marginBottom: '8px' }}>Bagaimana cara berlangganan BUKOO PLUS?</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: '14px', lineHeight: 1.5 }}>
            Kamu dapat memilih paket bulanan atau tahunan di halaman Paket Harga, lalu selesaikan pembayaran melalui e-wallet, QRIS, atau kartu kredit.
          </p>
        </div>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
          <h3 style={{ color: 'var(--amber)', fontSize: '18px', marginBottom: '8px' }}>Apakah bisa dibatalkan sewaktu-waktu?</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: '14px', lineHeight: 1.5 }}>
            Ya! Langganan BUKOO tanpa komitmen. Kamu bisa membatalkan perpanjangan otomatis di menu profil kapan saja sebelum tanggal penagihan berikutnya.
          </p>
        </div>
      </div>

      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <Link href="/pricing">
          <button className="btn-cta">Lihat Pilihan Paket</button>
        </Link>
      </div>
    </div>
  );
}
