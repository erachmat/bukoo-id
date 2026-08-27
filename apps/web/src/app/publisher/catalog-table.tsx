"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { getCoverUrl } from "@/lib/cover-url";
import { filterAndSortBooks, paginateBooks, CATALOG_PAGE_SIZE, type CatalogSort, type CatalogStatus } from "@/lib/catalog-filter";
import { DeletePublisherBookButton } from "./(protected)/books/delete-button";
import { PublishToggleButton } from "./(protected)/books/publish-toggle-button";
import { bulkDeleteBooks, bulkSetBookPublication } from "./(protected)/books/actions";

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
  updatedAt: string | null;
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
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<CatalogStatus>('all');
  const [access, setAccess] = useState('all');
  const [language, setLanguage] = useState('all');
  const [sort, setSort] = useState<CatalogSort>('updated');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();
  const [bulkError, setBulkError] = useState<string | null>(null);
  const filteredBooks = useMemo(() => filterAndSortBooks(books, { q: query, status, access, language, sort }), [books, query, status, access, language, sort]);
  const paginated = useMemo(() => paginateBooks(filteredBooks, page), [filteredBooks, page]);
  const languages = useMemo(() => [...new Set(books.map((book) => book.language).filter(Boolean))].sort(), [books]);
  const accesses = useMemo(() => [...new Set(books.map((book) => book.subscriptionRequired).filter(Boolean))].sort(), [books]);
  const updateFilter = <T,>(setter: (value: T) => void, value: T) => { setter(value); setPage(1); setSelected(new Set()); };
  const visibleIds = paginated.items.map((book) => book.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));
  const toggleSelected = (bookId: string) => setSelected((current) => {
    const next = new Set(current);
    if (next.has(bookId)) next.delete(bookId); else next.add(bookId);
    return next;
  });
  const togglePage = () => setSelected((current) => {
    const next = new Set(current);
    if (allVisibleSelected) visibleIds.forEach((id) => next.delete(id)); else visibleIds.forEach((id) => next.add(id));
    return next;
  });
  const changePage = (nextPage: number) => { setSelected(new Set()); setPage(nextPage); };
  const runBulk = (action: 'publish' | 'unpublish' | 'delete') => {
    if (action === 'delete' && !window.confirm(`Hapus ${selected.size} buku terpilih? Tindakan ini tidak dapat dibatalkan.`)) return;
    if (action === 'unpublish' && !window.confirm(`Tarik ${selected.size} buku terpilih dari toko?`)) return;
    setBulkError(null);
    startTransition(async () => {
      try {
        if (action === 'delete') await bulkDeleteBooks([...selected]);
        else await bulkSetBookPublication([...selected], action);
        setSelected(new Set());
      } catch (caught) {
        setBulkError(caught instanceof Error ? caught.message : 'Gagal memproses buku terpilih.');
      }
    });
  };

  return (
    <div className="pds-panel">
      <div className="pds-panel-title">
        Katalog Judul
        <span className="tag">{filteredBooks.length} dari {books.length} buku</span>
      </div>
      <div className="pds-catalog-toolbar">
        <input className="pds-search" value={query} onChange={(event) => updateFilter(setQuery, event.target.value)} placeholder="Cari judul atau penulis" aria-label="Cari judul atau penulis" />
        <select value={status} onChange={(event) => updateFilter(setStatus, event.target.value as CatalogStatus)} aria-label="Filter status">
          <option value="all">Semua status</option><option value="published">Aktif</option><option value="in_review">Review</option><option value="unpublished">Nonaktif</option><option value="rejected">Ditolak</option><option value="draft">Draft</option>
        </select>
        <select value={access} onChange={(event) => updateFilter(setAccess, event.target.value)} aria-label="Filter akses">
          <option value="all">Semua akses</option>{accesses.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
        <select value={language} onChange={(event) => updateFilter(setLanguage, event.target.value)} aria-label="Filter bahasa">
          <option value="all">Semua bahasa</option>{languages.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
        <select value={sort} onChange={(event) => updateFilter(setSort, event.target.value as CatalogSort)} aria-label="Urutkan katalog">
          <option value="updated">Terbaru</option><option value="title">Judul A-Z</option><option value="author">Penulis A-Z</option><option value="reads">Pembacaan terbanyak</option>
        </select>
      </div>
      {selected.size > 0 && <div className="pds-catalog-bulkbar"><strong>{selected.size} buku dipilih</strong><button type="button" onClick={() => runBulk('publish')} disabled={pending}>Terbitkan</button><button type="button" onClick={() => runBulk('unpublish')} disabled={pending}>Nonaktifkan</button><button type="button" onClick={() => runBulk('delete')} disabled={pending}>Hapus</button>{bulkError && <span role="alert">{bulkError}</span>}</div>}
      <div className="pds-tbl-scroll">
        <table className="pds-tbl">
          <thead><tr><th><input type="checkbox" checked={allVisibleSelected} onChange={togglePage} aria-label="Pilih semua buku di halaman ini" /></th><th>Judul & Penulis</th><th>Genre / Kategori</th><th>Status</th><th>Bahasa</th><th>Akses Konten</th><th>Format</th><th className="r">Pembacaan</th><th className="c">Aksi</th></tr></thead>
          <tbody>
            {books.length === 0 ? (
              <tr><td colSpan={9} style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--pds-muted)', fontSize: '12px' }}>
                <>Belum ada buku terdaftar. <Link href="/publisher/books/new" style={{ color: 'var(--pds-teal)', fontWeight: 600, textDecoration: 'none' }}>Upload buku pertama Anda →</Link></>
              </td></tr>
            ) : paginated.items.length === 0 ? <tr><td colSpan={9} style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--pds-muted)', fontSize: '12px' }}>Tidak ada buku yang cocok dengan filter saat ini.</td></tr>
            : paginated.items.map((book) => (
              <tr key={book.id}>
                <td><input type="checkbox" checked={selected.has(book.id)} onChange={() => toggleSelected(book.id)} aria-label={`Pilih ${book.title}`} /></td>
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
                <td className="c"><Link href={`/publisher/books/${book.id}/analytics`} style={{ fontSize: 12, fontWeight: 600, color: 'var(--pds-teal)', textDecoration: 'none', marginRight: 10 }}>Analitik</Link>{book.isPublished && <Link href={`/book/${book.id}`} target="_blank" rel="noreferrer" style={{ fontSize: 12, fontWeight: 600, color: 'var(--pds-teal)', textDecoration: 'none', marginRight: 10 }}>Lihat di toko</Link>}<Link href={`/publisher/books/${book.id}/edit`} style={{ fontSize: 12, fontWeight: 600, color: 'var(--pds-teal)', textDecoration: 'none', marginRight: 10 }}>Edit</Link><PublishToggleButton bookId={book.id} isPublished={book.isPublished} publicationStatus={book.publicationStatus} /><DeletePublisherBookButton bookId={book.id} bookTitle={book.title} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pds-catalog-pagination">
        <span>Menampilkan {filteredBooks.length === 0 ? 0 : (paginated.page - 1) * CATALOG_PAGE_SIZE + 1}–{Math.min(paginated.page * CATALOG_PAGE_SIZE, filteredBooks.length)} dari {filteredBooks.length}</span>
        <div><button type="button" disabled={paginated.page === 1} onClick={() => changePage(paginated.page - 1)}>Sebelumnya</button><span>Halaman {paginated.page} / {paginated.totalPages}</span><button type="button" disabled={paginated.page === paginated.totalPages} onClick={() => changePage(paginated.page + 1)}>Berikutnya</button></div>
      </div>
    </div>
  );
}