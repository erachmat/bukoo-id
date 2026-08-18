import React from "react";
import Link from "next/link";
import { PublisherNav } from "@/components/publisher/PublisherNav";
import "../publisher.css";

export const metadata = {
  title: "BUKOO — Daftar Penerbit Mitra",
  description: "Bergabung sebagai mitra penerbit BUKOO. Jangkau jutaan pembaca digital di Indonesia dengan model pembagian hasil yang adil dan transparan.",
};

export default function PublisherDaftarPage() {
  return (
    <div className="pub-page-wrap">
      <PublisherNav currentTab="daftar" />

      {/* Hero Section */}
      <section className="pub-hero">
        <div className="pub-hero-bg" />
        <div className="pub-wrap">
          <span className="pub-eyebrow">Kemitraan Penerbit BUKOO</span>
          <h1 className="pub-h1">
            Bawa karya Anda ke <em>jutaan pembaca</em> digital Indonesia
          </h1>
          <p className="pub-lead">
            BUKOO membantu penerbit independen hingga rumah terbit nasional mendistribusikan karya secara digital dengan <strong>model royalti transparan, perlindungan DRM berlapis, dan dashboard analytics real-time</strong>.
          </p>
          <div className="pub-hero-ctas">
            <a href="#form-daftar" className="btn-cta btn-lg">Daftar Sekarang →</a>
            <Link href="/publisher/royalti" className="btn-ghost btn-lg">Pelajari Kebijakan Royalti</Link>
          </div>
        </div>
      </section>

      {/* Why Join Section */}
      <section className="pub-sec">
        <div className="pub-wrap">
          <div className="pub-sec-head center">
            <span className="pub-eyebrow">Keunggulan Kemitraan</span>
            <h2 className="pub-h2">Mengapa menerbitkan buku di <em>BUKOO</em>?</h2>
            <p className="pub-sec-desc">
              Kami membangun ekosistem yang menghargai hak cipta dan kerja keras para penerbit serta penulis.
            </p>
          </div>

          <div className="pub-grid3">
            <div className="pub-card">
              <div className="pub-card-icon">💰</div>
              <h3>Royalti Transparan 60%</h3>
              <p>
                Dapatkan pembagian hasil hingga 60% dari setiap bacaan dan pembelian. Laporan keuangan dapat diakses kapan saja dari dashboard Anda.
              </p>
            </div>
            <div className="pub-card">
              <div className="pub-card-icon">🔒</div>
              <h3>Perlindungan DRM Kelas Dunia</h3>
              <p>
                Naskah EPUB & PDF Anda dilindungi enkripsi AES-256 dan DRM dinamis untuk mencegah pembajakan dan penggandaan ilegal.
              </p>
            </div>
            <div className="pub-card">
              <div className="pub-card-icon">📊</div>
              <h3>Dashboard Analytics Real-Time</h3>
              <p>
                Ketahui judul yang paling banyak dibaca, tingkat penuntasan bab, hingga demografi pembaca untuk strategi penerbitan berikutnya.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Form Section */}
      <section className="pub-sec alt" id="form-daftar">
        <div className="pub-wrap">
          <div className="pub-contact-grid">
            <div>
              <span className="pub-eyebrow">Formulir Pendaftaran</span>
              <h2 className="pub-h2">Mulai langkah pertama <em>hari ini</em></h2>
              <p className="pub-sec-desc">
                Isi formulir pendaftaran di bawah ini. Tim partnership BUKOO akan meninjau profil penerbit Anda dan menghubungi dalam 1x24 jam kerja.
              </p>
              <div className="pub-checklist" style={{ marginTop: 24 }}>
                <li><b>Gratis biaya pendaftaran</b> tanpa komitmen tersembunyi</li>
                <li><b>Proses verifikasi cepat</b> dalam 24 jam</li>
                <li><b>Bantuan teknis komprehensif</b> untuk konversi format EPUB</li>
              </div>
            </div>

            <div className="pub-card" style={{ background: "rgba(10,26,21,0.9)", border: "1px solid var(--border-hi)" }}>
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="pub-fg">
                  <label>Nama Penerbit / Perusahaan *</label>
                  <input type="text" placeholder="Contoh: PT Penerbit Utama" required />
                </div>
                <div className="pub-fg-row">
                  <div className="pub-fg">
                    <label>Nama Penanggung Jawab *</label>
                    <input type="text" placeholder="Nama lengkap" required />
                  </div>
                  <div className="pub-fg">
                    <label>Jabatan *</label>
                    <input type="text" placeholder="Manager / Pemilik" required />
                  </div>
                </div>
                <div className="pub-fg-row">
                  <div className="pub-fg">
                    <label>Email Perusahaan *</label>
                    <input type="email" placeholder="kemitraan@penerbit.id" required />
                  </div>
                  <div className="pub-fg">
                    <label>Nomor WhatsApp *</label>
                    <input type="tel" placeholder="081234567890" required />
                  </div>
                </div>
                <div className="pub-fg">
                  <label>Estimasi Jumlah Katalog Judul *</label>
                  <select defaultValue="10-50">
                    <option value="1-10">1 – 10 Judul</option>
                    <option value="10-50">10 – 50 Judul</option>
                    <option value="50-200">50 – 200 Judul</option>
                    <option value="200+">Lebih dari 200 Judul</option>
                  </select>
                </div>
                <div className="pub-fg">
                  <label>Pesan / Catatan Tambahan (Opsional)</label>
                  <textarea placeholder="Ceritakan singkat tentang katalog atau fokus genre penerbit Anda..." />
                </div>
                <button type="submit" className="form-submit" style={{ marginTop: 10 }}>
                  Kirim Pendaftaran Penerbit →
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
