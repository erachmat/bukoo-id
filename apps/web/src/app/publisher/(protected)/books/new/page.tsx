import React from "react";
import Link from "next/link";
import { PublisherBookForm } from "../_components/book-form";
import { createPublisherBook } from "../actions";

export default function NewPublisherBookPage() {
  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <Link
              href="/publisher/books"
              style={{
                color: "var(--text-muted)",
                fontSize: "13px",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              ← Kembali
            </Link>
            <span style={{ color: "var(--border-dark)" }}>/</span>
            <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>Koleksi Buku</span>
          </div>
          <div className="topbar-title">Unggah Buku Baru</div>
        </div>
      </header>

      <main className="main">
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <PublisherBookForm action={createPublisherBook} submitLabel="Terbitkan Buku Baru →" />
        </div>
      </main>
    </>
  );
}
