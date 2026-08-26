import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { books as booksTable } from "@bukoo/db";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { PublisherBookForm } from "../../_components/book-form";
import { updatePublisherBook } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditPublisherBookPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  const user = session?.user;
  if (!user || (user as { role?: string }).role !== "PUBLISHER") {
    redirect("/login");
  }

  const db = getDb();
  const book = await db.query.books.findFirst({
    where: and(eq(booksTable.id, params.id), eq(booksTable.publisherUserId, user.id ?? '')),
  });

  if (!book) {
    notFound();
  }

  const genre = (() => {
    try {
      const parsed = JSON.parse(book.genre || '[]');
      return Array.isArray(parsed) ? parsed[0] ?? '' : '';
    } catch {
      return '';
    }
  })();

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
          <div className="pds-page-title">Edit Buku</div>
          <div className="pds-page-sub">Perbarui metadata dan berkas untuk &ldquo;{book.title}&rdquo;</div>
        </div>
        <div className="pds-head-actions">
          <Link href="/publisher/books" className="pds-btn pds-btn-line">Batal</Link>
        </div>
      </div>
      <PublisherBookForm
        action={(fd) => updatePublisherBook(book.id, fd)}
        submitLabel="Simpan Perubahan →"
        initial={{
          title: book.title,
          author: book.author,
          description: book.description ?? '',
          genre,
          language: book.language,
          year: book.publishedYear ? String(book.publishedYear) : '',
          pageCount: book.totalPages ? String(book.totalPages) : '',
          subscriptionRequired: book.subscriptionRequired,
        }}
      />
    </>
  );
}
