"use client";

import React from "react";
import { useActionState } from "react";
import { submitPublisherLead, type PublisherLeadState } from "./actions";

const initialState: PublisherLeadState = { ok: false, message: "" };

export function DaftarForm() {
  const [state, action, pending] = useActionState(submitPublisherLead, initialState);

  if (state.ok) {
    return (
      <div className="bl-form-ok" role="status" aria-live="polite">
        <h4>Pengajuan terkirim</h4>
        <p>
          {state.message} Untuk pertanyaan cepat:{" "}
          <a href="mailto:penerbit@bukoo.id">penerbit@bukoo.id</a>
        </p>
      </div>
    );
  }

  return (
    <form action={action}>
      <div className="bl-field">
        <label className="bl-label" htmlFor="bl-company">
          Nama Penerbit / Perusahaan<span className="bl-req">*</span>
        </label>
        <input
          id="bl-company"
          className="bl-input"
          name="company"
          type="text"
          required
          placeholder="Tulis nama penerbit"
        />
      </div>

      <div className="bl-row">
        <div className="bl-field">
          <label className="bl-label" htmlFor="bl-contact">
            Nama<span className="bl-req">*</span>
          </label>
          <input
            id="bl-contact"
            className="bl-input"
            name="contact"
            type="text"
            required
            placeholder="Nama Anda"
          />
        </div>
        <div className="bl-field">
          <label className="bl-label" htmlFor="bl-position">
            Jabatan<span className="bl-req">*</span>
          </label>
          <input
            id="bl-position"
            className="bl-input"
            name="position"
            type="text"
            required
            placeholder="Tulis Jabatan"
          />
        </div>
      </div>

      <div className="bl-row">
        <div className="bl-field">
          <label className="bl-label" htmlFor="bl-whatsapp">
            No. Ponsel / whatsapp<span className="bl-req">*</span>
          </label>
          <input
            id="bl-whatsapp"
            className="bl-input"
            name="whatsapp"
            type="tel"
            required
            placeholder="masukkan no. Ponsel / whatsapp"
          />
        </div>
        <div className="bl-field">
          <label className="bl-label" htmlFor="bl-email">
            Email<span className="bl-req">*</span>
          </label>
          <input
            id="bl-email"
            className="bl-input"
            name="email"
            type="email"
            required
            placeholder="masukkan email"
          />
        </div>
      </div>

      <div className="bl-row">
        <div className="bl-field">
          <label className="bl-label" htmlFor="bl-titlecount">
            Perkiraan Jumlah buku
          </label>
          <select id="bl-titlecount" className="bl-select" name="titleCount" defaultValue="1-25">
            <option value="1-25">1-25</option>
            <option value="26-100">26-100</option>
            <option value="101-500">101-500</option>
            <option value="500+">500+</option>
          </select>
        </div>
        <div className="bl-field">
          <label className="bl-label" htmlFor="bl-genre">
            Genre Utama
          </label>
          <select id="bl-genre" className="bl-select" name="genre" defaultValue="Sastra & Fiksi">
            <option value="Sastra & Fiksi">Sastra &amp; Fiksi</option>
            <option value="Non-fiksi & Self-development">Non-fiksi &amp; Self-development</option>
            <option value="Bisnis & Keuangan">Bisnis &amp; Keuangan</option>
            <option value="Akademik & Sains">Akademik &amp; Sains</option>
            <option value="Anak & Remaja">Anak &amp; Remaja</option>
            <option value="Campuran">Campuran</option>
          </select>
        </div>
      </div>

      <div className="bl-field">
        <label className="bl-label" htmlFor="bl-message">
          Pesan
        </label>
        <textarea
          id="bl-message"
          className="bl-textarea"
          name="message"
          placeholder="Tulis Pesan Anda"
        />
      </div>

      <div className="bl-form-actions">
        <button type="submit" className="bl-form-btn" disabled={pending}>
          {pending ? "Mengirim..." : "Kirim pengajuan kemitraan"}
        </button>
      </div>

      {state.message && !state.ok && (
        <p className="bl-form-error" role="alert">
          {state.message}
        </p>
      )}
    </form>
  );
}
