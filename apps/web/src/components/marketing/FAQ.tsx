'use client';

import { useState } from 'react';

const items = [
  ['Apa itu BUKOO dan bagaimana cara kerjanya?', 'BUKOO adalah platform langganan buku digital yang memberi akses ke koleksi buku kurasi dari penerbit Indonesia melalui aplikasi BUKOO.'],
  ['Apakah saya bisa membaca offline tanpa internet?', 'Ya. Buku dapat diunduh melalui aplikasi untuk dibaca tanpa koneksi internet.'],
  ['Buku apa saja yang tersedia di BUKOO?', 'BUKOO menghadirkan berbagai genre fiksi dan non-fiksi dari penerbit serta penulis Indonesia.'],
  ['Apa itu Bukoo Assistant?', 'Bukoo Assistant membantu memberi rekomendasi personal, merangkum bab, dan menjawab pertanyaan tentang bacaanmu.'],
  ['Bagaimana sistem pembayarannya?', 'Pilih paket yang sesuai dan bayar secara bulanan. Kamu dapat upgrade atau membatalkan kapan saja.'],
] as const;

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="faq-section">
      <div className="text-center" style={{ marginBottom: '48px' }}>
        <span className="s-eyebrow">Pertanyaan Umum</span>
        <h2 className="s-h2">Ada yang Ingin<br />Kamu Tanyakan?</h2>
      </div>

      {items.map(([question, answer], index) => {
        const isOpen = openIndex === index;
        const panelId = `homepage-faq-panel-${index}`;
        return (
          <div className={`faq-item ${isOpen ? 'open' : ''}`} key={question}>
            <button className="faq-q" type="button" aria-expanded={isOpen} aria-controls={panelId} onClick={() => setOpenIndex(isOpen ? null : index)}>
              <span>{question}</span>
              <span className="faq-icon" aria-hidden="true">+</span>
            </button>
            <div id={panelId} className="faq-a" role="region">{answer}</div>
          </div>
        );
      })}
    </section>
  );
}
