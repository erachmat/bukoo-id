import React from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getPublisherCatalog } from "../../dashboard/queries";
import { CatalogTable } from "../../catalog-table";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PublisherBooksPage() {
  const session = await auth();
  const user = session?.user;

  if (!user || (user as { role?: string }).role !== "PUBLISHER") {
    redirect("/login");
  }

  const books = await getPublisherCatalog(user.id ?? '');

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

      <CatalogTable books={books} />
    </>
  );
}
