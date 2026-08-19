"use client";

import React, { useState } from "react";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Bagaimana \"porsi pembacaan\" dihitung?",
    answer:
      "Porsi pembacaan adalah proporsi total sesi baca yang tuntas dari katalog Anda dibanding seluruh pembacaan di platform pada periode itu. Semakin banyak & semakin dalam buku Anda dibaca, semakin besar porsi Anda dari revenue pool.",
  },
  {
    question: "Kapan dan bagaimana royalti dibayarkan?",
    answer:
      "Royalti dihitung per bulan kalender dan ditransfer setiap tanggal 5 bulan berikutnya ke rekening penerbit. Rincian perhitungan tersedia lengkap di dashboard, sehingga setiap rupiah bisa Anda telusuri.",
  },
  {
    question: "Bagaimana tier saya bisa naik?",
    answer:
      "Tier ditinjau berkala berdasarkan performa katalog, jumlah judul, dan komitmen kerjasama (mis. eksklusivitas atau jendela rilis). Penerbit yang katalognya konsisten diminati akan naik ke tier bagi hasil yang lebih tinggi.",
  },
  {
    question: "Apakah ada biaya yang dipotong dari penerbit?",
    answer:
      "Tidak ada biaya pendaftaran, biaya penyimpanan, atau biaya tersembunyi. Bagi hasil sudah bersih: yang Anda lihat di dashboard adalah yang Anda terima. Tidak ada biaya cetak, gudang, atau retur seperti pada distribusi fisik.",
  },
  {
    question: "Apakah saya tetap mengontrol harga & positioning buku?",
    answer:
      "Ya. Anda menentukan judul mana yang masuk katalog digital, jendela rilisnya, dan dapat memposisikan buku unggulan sebagai premium (mis. lewat tier akses atau kredit buku). Kendali katalog tetap di tangan Anda.",
  },
];

export function RoyaltiFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq">
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
