"use client";

import React, { useState } from "react";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Apakah BUKOO akan menurunkan penjualan buku fisik saya?",
    answer:
      "Tidak — sebaliknya. BUKOO berfungsi sebagai mesin penemuan: pembaca mencicipi buku secara digital, jatuh cinta, lalu membeli versi fisik untuk dikoleksi atau dihadiahkan. Ini penjualan yang tidak akan terjadi tanpa penemuan. Anda juga bisa memasang tautan pembelian fisik langsung di halaman buku.",
  },
  {
    question: "Berapa banyak judul minimum untuk bergabung?",
    answer:
      "Tidak ada minimum kaku. Baik Anda punya 5 judul maupun 500, kami sambut. Skala katalog memengaruhi tier bagi hasil, tetapi setiap penerbit dapat mulai dari titik yang sesuai.",
  },
  {
    question: "Apakah saya butuh tim teknis untuk onboarding?",
    answer:
      "Tidak. Anda cukup menyediakan berkas buku & metadata. Tim BUKOO menangani seluruh sisi teknis: konversi, DRM, penataan katalog, dan penayangan.",
  },
  {
    question: "Format file apa yang diterima?",
    answer:
      "EPUB (direkomendasikan) dan PDF. Cover dalam JPG/PNG resolusi tinggi. Detail lengkap ada di halaman Submit Judul.",
  },
  {
    question: "Bagaimana jika saya ingin menghentikan kerjasama?",
    answer:
      "Kontrak memuat opsi keluar yang wajar. Anda dapat menarik judul sesuai ketentuan yang disepakati. Kami ingin kemitraan yang Anda pertahankan karena hasilnya, bukan karena terikat.",
  },
];

export function PanduanFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div>
      {FAQ_ITEMS.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={i} className={`faq-i ${isOpen ? "open" : ""}`}>
            <button type="button" className="faq-q" onClick={() => toggleItem(i)}>
              {item.question}
              <span className="ic">+</span>
            </button>
            <div className="faq-a">
              <p>{item.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
