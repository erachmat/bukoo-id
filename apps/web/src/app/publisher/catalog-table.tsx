"use client";

import Link from "next/link";
import { getCoverUrl } from "@/lib/cover-url";
import { DeletePublisherBookButton } from "./(protected)/books/delete-button";

export interface PublisherCatalogBook {
  id: string;
  title: string;
  author: string;
  synopsis: string | null;
  totalPages: number | null;
  genre: string | string[];
  language: string;
  subscriptionRequired: string;
  epubKey: string | null;
  coverKey: string | null;
  readCount: number;
  isPublished: boolean;
  publicationStatus: string;
}

function firstGenre(genre: PublisherCatalogBook['genre']): string {
  if (Array.isArray(genre)) return genre[0] ?? 'Sastra';
  try {
    const parsed = JSON.parse(genre || '[]');
    return Array.isArray(parsed) ? parsed[0] ?? 'Sastra' : 'Sastra';
  } catch {
    return 'Sastra';
  }
}

export function CatalogTable({ books }: { books: PublisherCatalogBook[] }) {
  return (
    <div className="pds-panel">
      <div className="pds-panel-title">
        Katalog Judul Aktif
        <span className="tag">{books.length} buku terbit di platform BUKOO</span>
      </div>
      <div className="pds-tbl-scroll">
        <table className="pds-tbl">
          <thead><tr><th>Judul & Penulis</th><th>Genre / Kategori</th><th>Status</th><th>Bahasa</th><th>Akses Konten</th><th>Format</th><th className="r">Pembacaan</th><th className="c">Aksi</th></tr></thead>
          <tbody>
            {books.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--pds-muted)', fontSize: '12px' }}>
                Belum ada buku terdaftar. <Link href="/publisher/books/new" style={{ color: 'var(--pds-teal)', fontWeight: 600, textDecoration: 'none' }}>Upload buku pertama Anda →</Link>
              </td></tr>
            ) : books.map((book) => (
              <tr key={book.id}>
                <td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {book.coverKey ? <img src={getCoverUrl(book.coverKey)} alt={book.title} className="pds-thumb" style={{ objectFit: 'cover' }} /> : <div className="pds-thumb">📕</div>}
                  <div><div className="t-main">{book.title}</div><div className="t-sub">{book.author}</div></div>
                </div></td>
                <td><span className="pds-chip pds-chip-draft">{firstGenre(book.genre)}</span></td>
                <td><span className={`pds-chip ${book.isPublished ? 'pds-chip-live' : 'pds-chip-review'}`}><span className="pds-dotk" />{book.publicationStatus === 'PUBLISHED' ? 'Aktif' : book.publicationStatus === 'IN_REVIEW' ? 'Review' : book.publicationStatus === 'DRAFT' ? 'Draft' : book.publicationStatus === 'REJECTED' ? 'Ditolak' : 'Nonaktif'}</span></td>
                <td>{book.language}</td>
                <td>{book.subscriptionRequired !== 'FREE' ? <span className="pds-chip pds-chip-review">{book.subscriptionRequired}</span> : <span className="pds-chip pds-chip-live">GRATIS</span>}</td>
                <td className="num">{book.epubKey ? 'EPUB' : '—'}</td>
                <td className="r num">{book.readCount.toLocaleString('id-ID')} kali</td>
                <td className="c"><Link href={`/publisher/books/${book.id}/analytics`} style={{ fontSize: 12, fontWeight: 600, color: 'var(--pds-teal)', textDecoration: 'none', marginRight: 10 }}>Analitik</Link><Link href={`/publisher/books/${book.id}/edit`} style={{ fontSize: 12, fontWeight: 600, color: 'var(--pds-teal)', textDecoration: 'none', marginRight: 10 }}>Edit</Link><DeletePublisherBookButton bookId={book.id} bookTitle={book.title} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}