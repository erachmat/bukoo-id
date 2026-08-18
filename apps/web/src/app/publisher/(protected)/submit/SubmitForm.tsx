"use client";

import React, { useState } from "react";

export function SubmitForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="pub-card" style={{ maxWidth: 860, margin: "0 auto", background: "rgba(18,42,34,0.6)", border: "1px solid var(--border-hi)", textAlign: "center", padding: "48px 32px" }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🚀</div>
        <h3 style={{ color: "#fff", fontSize: 24, marginBottom: 8 }}>Judul Berhasil Dikirim!</h3>
        <p style={{ color: "var(--text-dim)", fontSize: 14, maxWidth: 480, margin: "0 auto" }}>
          Tim redaksi &amp; kurasi BUKOO akan memverifikasi naskah Anda dalam 1–2 hari kerja. Notifikasi status akan dikirimkan ke email yang terdaftar.
        </p>
      </div>
    );
  }

  return (
    <div className="pub-card" style={{ maxWidth: 860, margin: "0 auto", background: "rgba(18,42,34,0.6)", border: "1px solid var(--border-hi)" }}>
      <form onSubmit={handleSubmit}>
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
              <option value="Fiksi">Fiksi &amp; Sastra</option>
              <option value="Agama">Agama &amp; Spiritualitas</option>
              <option value="Sejarah">Sejarah &amp; Budaya</option>
              <option value="SelfDev">Pengembangan Diri</option>
              <option value="Bisnis">Bisnis &amp; Ekonomi</option>
              <option value="Sains">Sains &amp; Teknologi</option>
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
  );
}
