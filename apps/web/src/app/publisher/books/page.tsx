import React from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { books as booksTable } from "@bukoo/db";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { DeletePublisherBookButton } from "./delete-button";

export const dynamic = "force-dynamic";

export default async function PublisherBooksPage() {
  const session = await auth();
  const user = session?.user;

  if (!user || (user as any).role !== "PUBLISHER") {
    redirect("/login");
  }

  const books = await db
    .select()
    .from(booksTable)
    .where(eq(booksTable.publisherUserId, user.id ?? ''))
    .orderBy(desc(booksTable.createdAt));

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <div className="topbar-title">Koleksi Buku</div>
          <div className="topbar-sub">Kelola naskah digital dan publikasi Anda</div>
        </div>
        <div className="topbar-right">
          <Link href="/publisher/books/new" className="btn-export">
            ➕ Unggah Buku Baru
          </Link>
        </div>
      </header>

      <main className="main">
        <div className="card fade-in">
          <div className="card-header">
            <div>
              <div className="card-title">Katalog Judul Aktif</div>
              <div className="card-sub">{books.length} buku terbit di platform BUKOO</div>
            </div>
            <span className="card-badge badge-forest">{books.length} Total</span>
          </div>

          <div className="card-body">
            <div className="tbl-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Judul & Penulis</th>
                    <th>Genre / Kategori</th>
                    <th>Bahasa</th>
                    <th>Akses Konten</th>
                    <th>Format</th>
                    <th style={{ textAlign: "right" }}>Pembacaan</th>
                    <th style={{ textAlign: "center" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {books.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: "48px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: "14px" }}>
                        Belum ada buku terdaftar. <Link href="/publisher/books/new" style={{ color: "var(--amber)", fontWeight: 600, textDecoration: "none" }}>Unggah buku pertama Anda →</Link>
                      </td>
                    </tr>
                  ) : (
                    books.map((book: typeof books[number]) => (
                      <tr key={book.id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            {book.coverKey ? (
                              <img
                                src={book.coverKey}
                                alt={book.title}
                                style={{ width: "36px", height: "52px", objectFit: "cover", borderRadius: "4px", flexShrink: 0, border: "1px solid var(--border)" }}
                              />
                            ) : (
                              <div style={{ width: "36px", height: "52px", background: "var(--bg)", borderRadius: "4px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "var(--text-muted)" }}>
                                📕
                              </div>
                            )}
                            <div>
                              <div style={{ fontWeight: 700, color: "var(--text)", fontSize: "14px" }}>{book.title}</div>
                              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>{book.author}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{ background: "var(--bg)", color: "var(--text-mid)", fontSize: "11px", fontWeight: 700, padding: "3px 8px", borderRadius: "6px" }}>
                            {(typeof book.genre === 'string' ? JSON.parse(book.genre || '[]') : book.genre)[0] ?? "Sastra"}
                          </span>
                        </td>
                        <td>{book.language}</td>
                        <td>
                          {book.subscriptionRequired !== "FREE" ? (
                            <span className="card-badge badge-amber">{book.subscriptionRequired}</span>
                          ) : (
                            <span className="card-badge badge-teal" style={{ background: "rgba(0, 201, 167, 0.1)", color: "var(--teal-d)", border: "1px solid rgba(0, 201, 167, 0.2)" }}>GRATIS</span>
                          )}
                        </td>
                        <td style={{ fontWeight: 600, fontSize: "12px" }}>{book.epubKey ? 'EPUB' : '—'}</td>
                        <td style={{ textAlign: "right", fontWeight: 600 }}>
                          {book.readCount.toLocaleString("id-ID")} kali
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <DeletePublisherBookButton bookId={book.id} bookTitle={book.title} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
