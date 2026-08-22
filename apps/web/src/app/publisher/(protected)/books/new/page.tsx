import React from "react";
import Link from "next/link";
import { PublisherBookForm } from "../_components/book-form";
import { createPublisherBook } from "../actions";

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
          <div className="pds-page-sub">Unggah file EPUB, tentukan harga, dan publikasikan ke lebih dari 2 juta pembaca BUKOO</div>
        </div>
        <div className="pds-head-actions">
          <Link href="/publisher/books" className="pds-btn pds-btn-line">Batal</Link>
        </div>
      </div>
      <PublisherBookForm action={createPublisherBook} submitLabel="Terbitkan Buku Baru →" />
    </>
  );
}
