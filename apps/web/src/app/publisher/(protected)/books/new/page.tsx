import React from "react";
import Link from "next/link";
import { PublisherBookForm } from "../_components/book-form";

export default function NewPublisherBookPage() {
  return (
    <>
      <div className="pds-page-head">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Link
              href="/publisher/books"
              style={{ color: "var(--pds-dim)", fontSize: 11.5, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}
            >
              ← Koleksi Buku
            </Link>
          </div>
          <div className="pds-page-title">Upload Buku Baru</div>
          <div className="pds-page-sub">Lengkapi metadata dan berkas, simpan draft, lalu kirim untuk review kurasi.</div>
        </div>
        <div className="pds-head-actions">
          <Link href="/publisher/books" className="pds-btn pds-btn-line">Batal</Link>
        </div>
      </div>
      <PublisherBookForm />
    </>
  );
}
