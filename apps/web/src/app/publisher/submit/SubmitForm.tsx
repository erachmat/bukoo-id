"use client";

import React, { useState } from "react";

export function SubmitForm() {
  const [curStep, setCurStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");
  const [genre, setGenre] = useState("Sastra & Fiksi");
  const [year, setYear] = useState("2024");
  const [synopsis, setSynopsis] = useState("");

  const [bookFileName, setBookFileName] = useState<string | null>(null);
  const [coverFileName, setCoverFileName] = useState<string | null>(null);

  const [releaseWindow, setReleaseWindow] = useState("Segera setelah disetujui");
  const [positioning, setPositioning] = useState("Katalog reguler (semua tier)");
  const [storeUrl, setStoreUrl] = useState("");

  const handleNext = () => {
    if (curStep < 4) {
      setCurStep((prev) => prev + 1);
    } else {
      setSubmitted(true);
    }
  };

  const handlePrev = () => {
    if (curStep > 1) {
      setCurStep((prev) => prev - 1);
    }
  };

  if (submitted) {
    return (
      <div className="form-card" style={{ maxWidth: 760, margin: "0 auto" }}>
        <div className="form-ok show">
          <div className="big">✓</div>
          <h3>Judul terkirim ke tim kurasi</h3>
          <p>
            Tim kurasi BUKOO akan meninjau dalam 5&ndash;7 hari kerja dan menghubungi Anda via dashboard. Terima kasih telah memperkaya katalog Indonesia.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="form-card" style={{ maxWidth: 760, margin: "0 auto" }}>
      {/* Stepper Header */}
      <div className="stepper" id="stepper">
        <div className={`step-dot ${curStep === 1 ? "active" : ""} ${curStep > 1 ? "done" : ""}`}>
          <div className="sd-n">1</div>
          <span className="sd-l">Detail buku</span>
        </div>
        <div className="step-line" />
        <div className={`step-dot ${curStep === 2 ? "active" : ""} ${curStep > 2 ? "done" : ""}`}>
          <div className="sd-n">2</div>
          <span className="sd-l">Berkas</span>
        </div>
        <div className="step-line" />
        <div className={`step-dot ${curStep === 3 ? "active" : ""} ${curStep > 3 ? "done" : ""}`}>
          <div className="sd-n">3</div>
          <span className="sd-l">Rilis &amp; harga</span>
        </div>
        <div className="step-line" />
        <div className={`step-dot ${curStep === 4 ? "active" : ""}`}>
          <div className="sd-n">4</div>
          <span className="sd-l">Tinjau</span>
        </div>
      </div>

      {/* Step 1: Detail buku */}
      {curStep === 1 && (
        <div className="fstep on">
          <h3>Detail buku</h3>
          <p className="sub">Informasi dasar tentang judul yang Anda ajukan.</p>
          <div className="fg">
            <label htmlFor="f_title">Judul buku</label>
            <input
              type="text"
              id="f_title"
              placeholder="Judul lengkap"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="fg-row">
            <div className="fg">
              <label htmlFor="f_author">Penulis</label>
              <input
                type="text"
                id="f_author"
                placeholder="Nama penulis"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>
            <div className="fg">
              <label htmlFor="f_isbn">ISBN</label>
              <input
                type="text"
                id="f_isbn"
                placeholder="978-..."
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
              />
            </div>
          </div>
          <div className="fg-row">
            <div className="fg">
              <label htmlFor="f_genre">Genre</label>
              <select id="f_genre" value={genre} onChange={(e) => setGenre(e.target.value)}>
                <option value="Sastra & Fiksi">Sastra &amp; Fiksi</option>
                <option value="Non-fiksi">Non-fiksi</option>
                <option value="Bisnis & Keuangan">Bisnis &amp; Keuangan</option>
                <option value="Self-development">Self-development</option>
                <option value="Akademik & Sains">Akademik &amp; Sains</option>
                <option value="Anak & Remaja">Anak &amp; Remaja</option>
              </select>
            </div>
            <div className="fg">
              <label htmlFor="f_year">Tahun terbit</label>
              <input
                type="text"
                id="f_year"
                placeholder="2024"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </div>
          </div>
          <div className="fg">
            <label htmlFor="f_synopsis">Sinopsis singkat</label>
            <textarea
              id="f_synopsis"
              placeholder="2–4 kalimat yang menggambarkan isi buku."
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Step 2: Unggah berkas */}
      {curStep === 2 && (
        <div className="fstep on">
          <h3>Unggah berkas</h3>
          <p className="sub">Berkas diunggah secara aman ke server BUKOO.</p>
          <div className="fg">
            <label>File buku (EPUB / PDF)</label>
            <label htmlFor="book-file-input">
              <div className="drop">
                <div className="ic">📄</div>
                <b>{bookFileName ? bookFileName : "Klik untuk memilih atau tarik berkas ke sini"}</b>
                <p>EPUB atau PDF &middot; maks 100 MB</p>
                <input
                  type="file"
                  id="book-file-input"
                  accept=".epub,.pdf"
                  style={{ display: "none" }}
                  onChange={(e) => setBookFileName(e.target.files?.[0]?.name || null)}
                />
              </div>
            </label>
          </div>
          <div className="fg">
            <label>Cover (JPG / PNG)</label>
            <label htmlFor="cover-file-input">
              <div className="drop">
                <div className="ic">🖼️</div>
                <b>{coverFileName ? coverFileName : "Unggah gambar cover"}</b>
                <p>Min 1400&times;2100 px</p>
                <input
                  type="file"
                  id="cover-file-input"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => setCoverFileName(e.target.files?.[0]?.name || null)}
                />
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Step 3: Rilis & positioning */}
      {curStep === 3 && (
        <div className="fstep on">
          <h3>Rilis &amp; positioning</h3>
          <p className="sub">Anda yang menentukan bagaimana buku ini hadir di BUKOO.</p>
          <div className="fg-row">
            <div className="fg">
              <label>Jendela rilis digital</label>
              <select value={releaseWindow} onChange={(e) => setReleaseWindow(e.target.value)}>
                <option value="Segera setelah disetujui">Segera setelah disetujui</option>
                <option value="3 bulan setelah rilis fisik">3 bulan setelah rilis fisik</option>
                <option value="6 bulan setelah rilis fisik">6 bulan setelah rilis fisik</option>
                <option value="Tanggal khusus">Tanggal khusus</option>
              </select>
            </div>
            <div className="fg">
              <label>Positioning</label>
              <select value={positioning} onChange={(e) => setPositioning(e.target.value)}>
                <option value="Katalog reguler (semua tier)">Katalog reguler (semua tier)</option>
                <option value="Premium (tier Plus ke atas)">Premium (tier Plus ke atas)</option>
                <option value="Kredit buku (in-app)">Kredit buku (in-app)</option>
              </select>
            </div>
          </div>
          <div className="fg">
            <label htmlFor="f_store">Tautan pembelian fisik (opsional)</label>
            <input
              type="url"
              id="f_store"
              placeholder="https://toko-anda.id/judul"
              value={storeUrl}
              onChange={(e) => setStoreUrl(e.target.value)}
            />
          </div>
          <div className="disc" style={{ marginTop: 6 }}>
            <b>Tetap kendali Anda.</b> Pengaturan ini bisa diubah kapan saja lewat dashboard penerbit.
          </div>
        </div>
      )}

      {/* Step 4: Tinjau pengajuan */}
      {curStep === 4 && (
        <div className="fstep on">
          <h3>Tinjau pengajuan</h3>
          <p className="sub">Periksa kembali sebelum mengirim.</p>
          <div className="review-list" id="reviewList">
            <div className="rv-row">
              <span>Judul</span>
              <span>{title || "(belum diisi)"}</span>
            </div>
            <div className="rv-row">
              <span>Penulis</span>
              <span>{author || "(belum diisi)"}</span>
            </div>
            <div className="rv-row">
              <span>Genre</span>
              <span>{genre}</span>
            </div>
            <div className="rv-row">
              <span>Berkas</span>
              <span>{bookFileName || coverFileName ? `${bookFileName || "EPUB"} + ${coverFileName || "cover"}` : "EPUB + cover (siap)"}</span>
            </div>
            <div className="rv-row">
              <span>Status</span>
              <span style={{ color: "var(--amber)" }}>Siap dikirim ke tim kurasi</span>
            </div>
          </div>
        </div>
      )}

      {/* Stepper Buttons */}
      <div className="step-btns" id="stepBtns">
        <button
          type="button"
          className="btn-ghost"
          id="btnPrev"
          onClick={handlePrev}
          style={{ visibility: curStep === 1 ? "hidden" : "visible" }}
        >
          &larr; Kembali
        </button>
        <button type="button" className="btn-cta" id="btnNext" onClick={handleNext}>
          {curStep === 4 ? "Kirim ke tim kurasi \u2713" : "Lanjut \u2192"}
        </button>
      </div>
    </div>
  );
}
