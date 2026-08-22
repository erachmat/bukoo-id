import React from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { books as booksTable } from "@bukoo/db";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getCoverUrl } from "@/lib/cover-url";
import { DeletePublisherBookButton } from "./delete-button";

export const dynamic = "force-dynamic";

export default async function PublisherBooksPage() {
  const session = await auth();
  const user = session?.user;

  if (!user || (user as { role?: string }).role !== "PUBLISHER") {
    redirect("/login");
  }

  const db = getDb();
  const books = await db
    .select()
    .from(booksTable)
    .where(eq(booksTable.publisherUserId, user.id ?? ''))
    .orderBy(desc(booksTable.createdAt));

  return (
    <>
      <div className="pds-page-head">
        <div>
          <div className="pds-page-title">Koleksi Buku</div>
          <div className="pds-page-sub">Kelola naskah digital dan publikasi Anda · {books.length} buku aktif</div>
        </div>
        <div className="pds-head-actions">
          <Link href="/publisher/books/new" className="pds-btn pds-btn-primary">
            ➕ Upload Buku Baru
          </Link>
        </div>
      </div>

      <div className="pds-panel">
        <div className="pds-panel-title">
          Katalog Judul Aktif
          <span className="tag">{books.length} buku terbit di platform BUKOO</span>
        </div>
        <div className="pds-tbl-scroll">
          <table className="pds-tbl">
            <thead>
              <tr>
                <th>Judul & Penulis</th>
                <th>Genre / Kategori</th>
                <th>Bahasa</th>
                <th>Akses Konten</th>
                <th>Format</th>
                <th className="r">Pembacaan</th>
                <th className="c">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {books.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "48px 16px", textAlign: "center", color: "var(--pds-muted)", fontSize: "12px" }}>
                    Belum ada buku terdaftar.{" "}
                    <Link href="/publisher/books/new" style={{ color: "var(--pds-teal)", fontWeight: 600, textDecoration: "none" }}>
                      Upload buku pertama Anda →
                    </Link>
                  </td>
                </tr>
              ) : (
                books.map((book: typeof books[number]) => (
                  <tr key={book.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {book.coverKey ? (
                          <img
                            src={getCoverUrl(book.coverKey)}
                            alt={book.title}
                            className="pds-thumb"
                            style={{ objectFit: "cover" }}
                          />
                        ) : (
                          <div className="pds-thumb">📕</div>
                        )}
                        <div>
                          <div className="t-main">{book.title}</div>
                          <div className="t-sub">{book.author}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="pds-chip pds-chip-draft">
                        {(typeof book.genre === 'string' ? JSON.parse(book.genre || '[]') : book.genre)[0] ?? "Sastra"}
                      </span>
                    </td>
                    <td>{book.language}</td>
                    <td>
                      {book.subscriptionRequired !== "FREE" ? (
                        <span className="pds-chip pds-chip-review">{book.subscriptionRequired}</span>
                      ) : (
                        <span className="pds-chip pds-chip-live">GRATIS</span>
                      )}
                    </td>
                    <td className="num">{book.epubKey ? 'EPUB' : '—'}</td>
                    <td className="r num">{book.readCount.toLocaleString('id-ID')} kali</td>
                    <td className="c">
                      <DeletePublisherBookButton bookId={book.id} bookTitle={book.title} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
