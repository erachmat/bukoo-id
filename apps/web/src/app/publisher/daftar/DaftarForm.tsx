"use client";

import React, { useState } from "react";

export function DaftarForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="pub-card" style={{ background: "rgba(10,26,21,0.9)", border: "1px solid var(--border-hi)", textAlign: "center", padding: "40px 32px" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <h3 style={{ color: "#fff", fontSize: 22, marginBottom: 8 }}>Pendaftaran Terkirim!</h3>
        <p style={{ color: "var(--text-dim)", fontSize: 14 }}>
          Tim partnership BUKOO akan meninjau profil penerbit Anda dan menghubungi dalam 1×24 jam kerja melalui email atau WhatsApp yang Anda daftarkan.
        </p>
      </div>
    );
  }

  return (
    <div className="pub-card" style={{ background: "rgba(10,26,21,0.9)", border: "1px solid var(--border-hi)" }}>
      <form onSubmit={handleSubmit}>
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
  );
}
