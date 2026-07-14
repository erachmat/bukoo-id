'use client'

import React from 'react'

const ITEMS: { q: string; a: string }[] = [
  {
    q: 'Bagaimana cara berlangganan BUKOO?',
    a: 'Pilih paket di halaman Harga, buat akun atau masuk, lalu selesaikan pembayaran. Langganan aktif setelah pembayaran dikonfirmasi.',
  },
  {
    q: 'Apa yang harus saya lakukan jika lupa kata sandi?',
    a: 'Gunakan tautan “Lupa kata sandi” di halaman Masuk. Kami mengirim email berisi instruksi reset ke alamat yang terdaftar.',
  },
  {
    q: 'Bisakah satu akun dipakai di beberapa perangkat?',
    a: 'Anda dapat masuk di web dan perangkat lain sesuai ketentuan paket langganan. Untuk batas penggunaan bersamaan, lihat detail paket di halaman Harga.',
  },
  {
    q: 'Bagaimana cara membatalkan langganan?',
    a: 'Pembatalan dapat dilakukan dari pengaturan akun atau dengan menghubungi dukungan. Umumnya berlaku di akhir periode tagihan yang telah dibayar.',
  },
  {
    q: 'Di mana saya mendapatkan invoice atau bukti bayar?',
    a: 'Ringkasan transaksi dikirim ke email setelah pembayaran berhasil. Simpan email tersebut sebagai referensi pembayaran Anda.',
  },
  {
    q: 'Bagaimana menghubungi tim dukungan?',
    a: 'Gunakan informasi kontak di bagian bawah halaman ini atau kirim pertanyaan melalui saluran resmi BUKOO. Kami berusaha membalas dalam 1–3 hari kerja.',
  },
]

export function BantuanFAQ() {
  const toggleFaq = (e: React.MouseEvent<HTMLButtonElement>) => {
    const item = e.currentTarget.parentElement
    if (!item) return
    const isOpen = item.classList.contains('open')
    document.querySelectorAll('.bantuan-faq-item').forEach((i) => i.classList.remove('open'))
    if (!isOpen) item.classList.add('open')
  }

  return (
    <div className="faq-section" style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 80px' }}>
      <div className="text-center" style={{ marginBottom: 40 }}>
        <span className="s-eyebrow">Pusat Bantuan</span>
        <h2 className="s-h2" style={{ marginTop: 12 }}>Pertanyaan yang Sering Diajukan</h2>
      </div>

      {ITEMS.map((item, i) => (
        <div key={item.q} className={`faq-item bantuan-faq-item${i === 0 ? ' open' : ''}`}>
          <button type="button" className="faq-q" onClick={toggleFaq}>
            {item.q}
            <div className="faq-icon">+</div>
          </button>
          <div className="faq-a">{item.a}</div>
        </div>
      ))}
    </div>
  )
}
