'use client';

import React from 'react';

export function FAQ() {
  const toggleFaq = (e: React.MouseEvent<HTMLButtonElement>) => {
    const item = e.currentTarget.parentElement;
    if (item) {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    }
  };

  return (
    <section className="faq-section">
      <div className="text-center" style={{ marginBottom: '48px' }}>
        <span className="s-eyebrow">Pertanyaan Umum</span>
        <h2 className="s-h2">Ada yang Ingin<br />Kamu Tanyakan?</h2>
      </div>

      <div className="faq-item open">
        <button className="faq-q" onClick={toggleFaq}>
          Apa itu BUKOO dan bagaimana cara kerjanya?
          <div className="faq-icon">+</div>
        </button>
        <div className="faq-a">BUKOO adalah platform langganan buku digital yang memungkinkan kamu mengakses 200.000+ judul buku dari ratusan penerbit Indonesia dan internasional. Cukup bayar satu biaya langganan bulanan, dan nikmati bacaan sepuasnya — mirip Netflix tapi untuk buku. Tersedia di iOS, Android, dan web browser.</div>
      </div>

      <div className="faq-item">
        <button className="faq-q" onClick={toggleFaq}>
          Apakah saya bisa membaca offline tanpa internet?
          <div className="faq-icon">+</div>
        </button>
        <div className="faq-a">Ya! Semua tier berbayar mendukung offline reading. Tier Baca (Rp 19.900) memungkinkan download hingga 10 judul, sementara tier Plus ke atas mendapatkan offline unlimited tanpa batasan. Sangat cocok untuk daerah dengan koneksi internet tidak stabil.</div>
      </div>

      <div className="faq-item">
        <button className="faq-q" onClick={toggleFaq}>
          Apakah ada kontrak jangka panjang?
          <div className="faq-icon">+</div>
        </button>
        <div className="faq-a">Tidak sama sekali. BUKOO menggunakan model langganan bulanan tanpa kontrak. Kamu bisa upgrade, downgrade, atau membatalkan langganan kapan saja tanpa biaya penalti. Pembatalan berlaku di akhir periode billing yang sudah dibayar.</div>
      </div>

      <div className="faq-item">
        <button className="faq-q" onClick={toggleFaq}>
          Buku apa saja yang tersedia di BUKOO?
          <div className="faq-icon">+</div>
        </button>
        <div className="faq-a">BUKOO memiliki 200.000+ judul mencakup berbagai genre: self-development, fiksi dan sastra Indonesia, bisnis dan keuangan, sains, akademik, hingga buku anak. Kami bermitra dengan 500+ penerbit termasuk Gramedia Pustaka Utama, Mizan, Bentang, Penguin Random House, dan banyak lagi. BUKOO Originals menambahkan konten eksklusif dari penulis-penulis terbaik Indonesia.</div>
      </div>

      <div className="faq-item">
        <button className="faq-q" onClick={toggleFaq}>
          Apa itu BUKOO AI Companion?
          <div className="faq-icon">+</div>
        </button>
        <div className="faq-a">AI Companion adalah asisten membaca personal yang ada di tier Plus ke atas. Ia bisa merekomendasikan buku sesuai selera, membuat rangkuman bab, menjawab pertanyaan tentang isi buku, dan membangun "Peta Baca" — jalur membaca yang dikurasi AI berdasarkan tujuan dan minatmu.</div>
      </div>

      <div className="faq-item">
        <button className="faq-q" onClick={toggleFaq}>
          Bagaimana sistem pembayaran BUKOO?
          <div className="faq-icon">+</div>
        </button>
        <div className="faq-a">BUKOO menerima berbagai metode pembayaran yang umum di Indonesia: kartu kredit/debit (Visa, Mastercard), transfer bank, GoPay, OVO, Dana, ShopeePay, dan Indomaret/Alfamart. Semua transaksi dalam Rupiah — tidak ada biaya kurs dolar!</div>
      </div>
    </section>
  );
}
