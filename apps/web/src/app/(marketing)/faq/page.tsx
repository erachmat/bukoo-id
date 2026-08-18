import Link from 'next/link';

export default function FaqPage() {
  const faqs = [
    {
      q: 'Apa itu BUKOO?',
      a: 'BUKOO adalah platform langganan buku digital #1 di Indonesia yang menyediakan akses tak terbatas ke ribuan e-book, audiobook, karya BUKOO Originals, serta fitur AI Companion.',
    },
    {
      q: 'Apakah saya bisa membaca tanpa koneksi internet (offline)?',
      a: 'Ya! Di aplikasi mobile BUKOO, kamu dapat mengunduh buku untuk dibaca kapan saja secara offline tanpa kuota.',
    },
    {
      q: 'Berapa biaya langganan BUKOO?',
      a: 'Paket langganan BUKOO PLUS dimulai dari Rp 29.900/bulan untuk akses tanpa batas ke seluruh koleksi e-book.',
    },
    {
      q: 'Bagaimana cara menjadi penerbit mitra BUKOO?',
      a: 'Penerbit dan penulis mandiri dapat mendaftar melalui portal Publisher di publisher.bukoo.id untuk mendistribusikan karya dan mendapatkan royalti bulanan.',
    },
  ];

  return (
    <div style={{ padding: '160px 24px 100px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#fff', marginBottom: '16px', textAlign: 'center' }}>
        Pertanyaan Yang Sering Diajukan (FAQ)
      </h1>
      <p style={{ fontSize: '16px', color: 'var(--text-dim)', marginBottom: '40px', textAlign: 'center' }}>
        Punya pertanyaan seputar BUKOO? Temukan jawabannya di bawah ini.
      </p>

      <div style={{ display: 'grid', gap: '16px', marginBottom: '40px' }}>
        {faqs.map((faq, idx) => (
          <div key={idx} style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ color: 'var(--amber)', fontSize: '18px', marginBottom: '8px' }}>{faq.q}</h3>
            <p style={{ color: 'var(--text-dim)', fontSize: '14px', lineHeight: 1.6 }}>{faq.a}</p>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center' }}>
        <Link href="/bantuan">
          <button className="btn-ghost">Hubungi Dukungan BUKOO</button>
        </Link>
      </div>
    </div>
  );
}
