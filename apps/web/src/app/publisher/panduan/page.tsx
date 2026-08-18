import React from "react";
import { PublisherNav } from "@/components/publisher/PublisherNav";
import "../publisher.css";

export const metadata = {
  title: "BUKOO — Panduan & Standar Penerbitan",
  description: "Petunjuk teknis format EPUB3, panduan ukuran sampul depan, dan standar kualitas penerbitan e-book di BUKOO.",
};

export default function PublisherPanduanPage() {
  return (
    <div className="pub-page-wrap">
      <PublisherNav currentTab="panduan" />

      {/* Hero Section */}
      <section className="pub-hero">
        <div className="pub-hero-bg" />
        <div className="pub-wrap">
          <span className="pub-eyebrow">Panduan &amp; Standar Kualitas</span>
          <h1 className="pub-h1">
            Petunjuk teknis <em>penerbitan digital BUKOO</em>
          </h1>
          <p className="pub-lead">
            Pastikan berkas e-book Anda siap memberikan pengalaman membaca terbaik bagi pengguna aplikasi BUKOO di iOS, Android, dan Web.
          </p>
        </div>
      </section>

      {/* Technical Specifications Section */}
      <section className="pub-sec">
        <div className="pub-wrap">
          <div className="pub-sec-head">
            <span className="pub-eyebrow">Spesifikasi Format Berkas</span>
            <h2 className="pub-h2">Standar <em>berkas</em> yang diterima</h2>
          </div>

          <div className="pub-grid3">
            <div className="pub-card">
              <div className="pub-pill pub-pill-teal" style={{ marginBottom: 12 }}>Rekomendasi Utama</div>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 20, color: "#fff", marginBottom: 8 }}>
                EPUB 3.0 Reflowable
              </h3>
              <p style={{ fontSize: 13.5, color: "var(--text-dim)", lineHeight: 1.6 }}>
                Format standar industri yang menyesuaikan secara responsif dengan ukuran layar smartphone, tablet, maupun desktop. Mendukung daftar isi navigasi (NCX/NAV) dan penyesuaian font.
              </p>
            </div>

            <div className="pub-card">
              <div className="pub-pill" style={{ marginBottom: 12 }}>Untuk Komik &amp; Artbook</div>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 20, color: "#fff", marginBottom: 8 }}>
                EPUB Fixed-Layout / PDF
              </h3>
              <p style={{ fontSize: 13.5, color: "var(--text-dim)", lineHeight: 1.6 }}>
                Ideal untuk publikasi dengan tata letak kompleks seperti komik, buku ilustrasi anak, majalah, dan modul pembelajaran visual.
              </p>
            </div>

            <div className="pub-card">
              <div className="pub-pill" style={{ marginBottom: 12 }}>Standar Sampul Depan</div>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 20, color: "#fff", marginBottom: 8 }}>
                Gambar Cover Depan
              </h3>
              <p style={{ fontSize: 13.5, color: "var(--text-dim)", lineHeight: 1.6 }}>
                Format <b>JPG / PNG (RGB)</b> dengan rasio perbandingan 1:1.5. Resolusi minimal <b>1400 x 2100 piksel</b> untuk ketajaman tampilan pada layar Retina.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="pub-sec alt">
        <div className="pub-wrap">
          <div className="pub-sec-head center">
            <span className="pub-eyebrow">Pertanyaan Sering Diajukan</span>
            <h2 className="pub-h2">Pertanyaan umum seputar <em>penerbitan</em></h2>
          </div>

          <div className="pub-faq center">
            <div className="pub-card" style={{ marginBottom: 16 }}>
              <h4 style={{ fontFamily: "var(--font-serif)", fontSize: 18, color: "var(--amber)", marginBottom: 8 }}>
                Berapa lama proses persetujuan naskah setelah diunggah?
              </h4>
              <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.7 }}>
                Proses validasi format naskah dan metadata membutuhkan waktu 1-2 hari kerja. Setelah disetujui, buku Anda akan langsung tayang di katalog BUKOO.
              </p>
            </div>

            <div className="pub-card" style={{ marginBottom: 16 }}>
              <h4 style={{ fontFamily: "var(--font-serif)", fontSize: 18, color: "var(--amber)", marginBottom: 8 }}>
                Bagaimana jika berkas naskah saya masih berupa Microsoft Word / InDesign?
              </h4>
              <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.7 }}>
                Tim BUKOO menyediakan layanan konversi naskah gratis untuk mitra penerbit terdaftar. Silakan hubungi tim dukungan penerbit kami setelah pendaftaran.
              </p>
            </div>

            <div className="pub-card">
              <h4 style={{ fontFamily: "var(--font-serif)", fontSize: 18, color: "var(--amber)", marginBottom: 8 }}>
                Apakah naskah saya aman dari penggandaan bajakan?
              </h4>
              <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.7 }}>
                Ya, BUKOO menerapkan enkripsi DRM berlapis (AES-256) yang mencegah penyalinan teks massal, pencetakan tanpa izin, maupun pengunduhan berkas mentah.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
