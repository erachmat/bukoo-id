"use client";

import React from "react";
import { useActionState } from "react";
import { submitPublisherLead, type PublisherLeadState } from "./actions";

const initialState: PublisherLeadState = { ok: false, message: "" };

export function DaftarForm() {
  const [state, action, pending] = useActionState(submitPublisherLead, initialState);

  if (state.ok) {
    return (
      <div className="form-card">
        <div className="form-ok" style={{ display: "block" }}>
          <h4>Pengajuan terkirim ✓</h4>
          <p>
            {state.message} Untuk pertanyaan cepat:{" "}
            <a href="mailto:penerbit@bukoo.id" style={{ color: "var(--amber)" }}>
              penerbit@bukoo.id
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="form-card">
      <form action={action}>
        <div className="pub-fg">
          <label>Nama penerbit / perusahaan</label>
            <input name="company" type="text" required placeholder="mis. Penerbit Nusantara" />
        </div>
        <div className="pub-fg-row">
          <div className="pub-fg">
            <label>Nama PIC</label>
            <input name="contact" type="text" required placeholder="Nama Anda" />
          </div>
          <div className="pub-fg">
            <label>Jabatan</label>
            <input name="position" type="text" placeholder="mis. Direktur" />
          </div>
        </div>
        <div className="pub-fg-row">
          <div className="pub-fg">
            <label>Email</label>
            <input name="email" type="email" required placeholder="nama@penerbit.id" />
          </div>
          <div className="pub-fg">
            <label>No. WhatsApp</label>
            <input name="whatsapp" type="tel" required placeholder="08xx" />
          </div>
        </div>
        <div className="pub-fg-row">
          <div className="pub-fg">
            <label>Perkiraan jumlah judul</label>
            <select name="titleCount" defaultValue="1 – 25 judul">
              <option value="1 – 25 judul">1 – 25 judul</option>
              <option value="26 – 100 judul">26 – 100 judul</option>
              <option value="101 – 500 judul">101 – 500 judul</option>
              <option value="500+ judul">500+ judul</option>
            </select>
          </div>
          <div className="pub-fg">
            <label>Genre utama</label>
            <select name="genre" defaultValue="Sastra & Fiksi">
              <option value="Sastra & Fiksi">Sastra & Fiksi</option>
              <option value="Non-fiksi & Self-development">Non-fiksi & Self-development</option>
              <option value="Bisnis & Keuangan">Bisnis & Keuangan</option>
              <option value="Akademik & Sains">Akademik & Sains</option>
              <option value="Anak & Remaja">Anak & Remaja</option>
              <option value="Campuran">Campuran</option>
            </select>
          </div>
        </div>
        <div className="pub-fg">
          <label>Pesan (opsional)</label>
          <textarea name="message" placeholder="Ceritakan sedikit tentang katalog & harapan Anda dari kerjasama ini." />
        </div>
        <button type="submit" className="form-submit" disabled={pending}>
          {pending ? "Mengirim..." : "Kirim pengajuan"}
        </button>
        {state.message && !state.ok && <p role="alert">{state.message}</p>}
      </form>
    </div>
  );
}

