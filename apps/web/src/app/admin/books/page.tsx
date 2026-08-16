import Link from 'next/link'
import { getDb } from '@/lib/db'
import { books as booksTable } from '@bukoo/db'
import { desc } from 'drizzle-orm'
import { getCoverUrl } from '@/lib/cover-url'
import { DeleteBookButton } from './_components/delete-book-button'

export const dynamic = 'force-dynamic'

export default async function AdminBooksPage() {
  const db = getDb()
  const books = await db.select().from(booksTable).orderBy(desc(booksTable.createdAt))

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1A2332', margin: 0 }}>Kelola Buku</h1>
          <p style={{ color: '#6B7A8D', marginTop: 6, fontSize: 14 }}>
            {books.length} buku dalam katalog
          </p>
        </div>
        <Link
          href="/admin/books/new"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#00C9A7', color: '#00181A', fontWeight: 700,
            padding: '10px 20px', borderRadius: 10, fontSize: 14, textDecoration: 'none',
          }}
        >
          + Tambah Buku
        </Link>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8ECF0', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8FAFB', borderBottom: '1px solid #E8ECF0' }}>
              {['Judul & Penulis', 'Kategori', 'Bahasa', 'Tipe', 'Status', 'Aksi'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 800, color: '#AAB4C0', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {books.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '48px 16px', textAlign: 'center', color: '#AAB4C0', fontSize: 14 }}>
                  Belum ada buku. <Link href="/admin/books/new" style={{ color: '#00C9A7', fontWeight: 600, textDecoration: 'none' }}>Tambah buku pertama →</Link>
                </td>
              </tr>
            )}
            {books.map((book: typeof books[number], i: number) => (
              <tr key={book.id} style={{ borderBottom: i < books.length - 1 ? '1px solid #F0F2F5' : 'none' }}>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {book.coverKey ? (
                      <img src={getCoverUrl(book.coverKey)} alt={book.title} style={{ width: 36, height: 52, objectFit: 'cover', borderRadius: 4, flexShrink: 0, border: '1px solid #E8ECF0' }} />
                    ) : (
                      <div style={{ width: 36, height: 52, background: '#F0F2F5', borderRadius: 4, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#AAB4C0' }}>?</div>
                    )}
                    <div>
                      <div style={{ fontWeight: 700, color: '#1A2332', fontSize: 14 }}>{book.title}</div>
                      <div style={{ fontSize: 12, color: '#8896A5', marginTop: 2 }}>{book.author}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ background: '#F0F2F5', color: '#3D4A5C', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6 }}>
                    {book.genre[0] ?? '—'}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: '#6B7A8D' }}>{book.language}</td>
                <td style={{ padding: '14px 16px' }}>
                  {book.subscriptionRequired !== 'FREE' ? (
                    <span style={{ background: 'rgba(245,158,11,0.1)', color: '#B45309', fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 6 }}>{book.subscriptionRequired}</span>
                  ) : (
                    <span style={{ background: 'rgba(0,201,167,0.1)', color: '#00856F', fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 6 }}>GRATIS</span>
                  )}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  {book.isPublished ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#16A34A', fontSize: 12, fontWeight: 600 }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#16A34A', flexShrink: 0 }} />
                      Terbit
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#9CA3AF', fontSize: 12, fontWeight: 600 }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#9CA3AF', flexShrink: 0 }} />
                      Draft
                    </span>
                  )}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Link
                      href={`/admin/books/${book.id}/edit`}
                      style={{ fontSize: 13, fontWeight: 600, color: '#00C9A7', textDecoration: 'none', padding: '5px 12px', borderRadius: 8, border: '1px solid rgba(0,201,167,0.3)', background: 'rgba(0,201,167,0.06)' }}
                    >
                      Edit
                    </Link>
                    <DeleteBookButton bookId={book.id} bookTitle={book.title} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
