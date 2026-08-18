import React from "react";
import { PublisherNav } from "@/components/publisher/PublisherNav";
import "../../publisher.css";

export const metadata = {
  title: "BUKOO — Submit & Unggah Judul Baru",
  description: "Unggah naskah e-book baru ke platform BUKOO. Proses peninjauan cepat, konversi EPUB otomatis, dan distribusi aman.",
};

export default function PublisherSubmitPage() {
  return (
    <div className="pub-page-wrap">
      <PublisherNav currentTab="submit" />

      {/* Hero Section */}
      <section className="pub-hero" style={{ paddingBottom: 40 }}>
        <div className="pub-hero-bg" />
        <div className="pub-wrap">
          <span className="pub-eyebrow">Submit & Unggah Judul</span>
          <h1 className="pub-h1">
            Terbitkan karya baru ke <em>katalog BUKOO</em>
          </h1>
          <p className="pub-lead">
            Unggah berkas naskah EPUB/PDF beserta metadata e-book Anda. Tim redaksi &amp; kurasi BUKOO akan memverifikasi berkas dalam 1-2 hari kerja sebelum terbit resmi.
          </p>
        </div>
      </section>

      {/* Submit Form Container */}
      <section className="pub-sec" style={{ paddingTop: 20 }}>
        <div className="pub-wrap">
          <div className="pub-card" style={{ maxWidth: 860, margin: "0 auto", background: "rgba(18,42,34,0.6)", border: "1px solid var(--border-hi)" }}>
            <form onSubmit={(e) => e.preventDefault()}>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 22, color: "#fff", marginBottom: 20 }}>
                1. Metadata Informasi Buku
              </h3>

              <div className="pub-fg">
                <label>Judul Buku *</label>
                <input type="text" placeholder="Contoh: Laut Bercerita" required />
              </div>

              <div className="pub-fg-row">
                <div className="pub-fg">
                  <label>Nama Penulis *</label>
                  <input type="text" placeholder="Contoh: Leila S. Chudori" required />
                </div>
                <div className="pub-fg">
                  <label>Nomor ISBN (E-book) *</label>
                  <input type="text" placeholder="978-602-xxx-xxx-x" required />
                </div>
              </div>

              <div className="pub-fg-row">
                <div className="pub-fg">
                  <label>Kategori Genre Utama *</label>
                  <select defaultValue="Fiksi">
                    <option value="Fiksi">Fiksi & Sastra</option>
                    <option value="Agama">Agama & Sptritualitas</option>
                    <option value="Sejarah">Sejarah & Budaya</option>
                    <option value="SelfDev">Pengembangan Diri</option>
                    <option value="Bisnis">Bisnis & Ekonomi</option>
                    <option value="Sains">Sains & Teknologi</option>
                  </select>
                </div>
                <div className="pub-fg">
                  <label>Tahun Terbit / Bahasa *</label>
                  <input type="text" placeholder="2026 / Bahasa Indonesia" required />
                </div>
              </div>

              <div className="pub-fg">
                <label>Sinopsis Ringkas Buku *</label>
                <textarea placeholder="Tuliskan gambaran cerita atau ringkasan isi buku (maks 500 kata)..." required />
              </div>

              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 22, color: "#fff", margin: "30px 0 20px" }}>
                2. Berkas Naskah &amp; Cover
              </h3>

              <div className="pub-fg-row">
                <div className="pub-fg">
                  <label>Berkas Naskah (EPUB / PDF) *</label>
                  <div style={{ border: "2px dashed var(--border-hi)", borderRadius: 12, padding: "24px 16px", textAlign: "center", background: "rgba(0,0,0,0.2)" }}>
                    <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 8 }}>
                      Tarik &amp; lepas berkas EPUB/PDF di sini, atau <b>Pilih Berkas</b>
                    </p>
                    <input type="file" accept=".epub,.pdf" style={{ display: "none" }} id="epub-file" />
                    <label htmlFor="epub-file" className="btn-ghost" style={{ cursor: "pointer", fontSize: 12 }}>
                      📁 Cari Berkas EPUB/PDF
                    </label>
                  </div>
                </div>

                <div className="pub-fg">
                  <label>Cover Depan (JPG / PNG min 1400x2100px) *</label>
                  <div style={{ border: "2px dashed var(--border-hi)", borderRadius: 12, padding: "24px 16px", textAlign: "center", background: "rgba(0,0,0,0.2)" }}>
                    <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 8 }}>
                      Tarik &amp; lepas gambar Sampul Depan di sini
                    </p>
                    <input type="file" accept="image/*" style={{ display: "none" }} id="cover-file" />
                    <label htmlFor="cover-file" className="btn-ghost" style={{ cursor: "pointer", fontSize: 12 }}>
                      🖼️ Pilih Sampul Depan
                    </label>
                  </div>
                </div>
              </div>

              <div className="pub-disc" style={{ marginTop: 24, marginBottom: 24 }}>
                <b>Catatan Hak Cipta &amp; Kepemilikan.</b> Dengan mengunggah naskah ini, Anda mengonfirmasi bahwa penerbit Anda memegang lisensi penerbitan digital yang sah dan tidak melanggar hak cipta pihak mana pun.
              </div>

              <button type="submit" className="form-submit" style={{ fontSize: 16 }}>
                🚀 Kirim Judul untuk Peninjauan Kurator →
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
