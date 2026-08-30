import Link from 'next/link'
import { BookForm } from '../_components/book-form'
import { createBook } from '../actions'

export default function NewBookPage() {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <Link href="/admin/books" style={{ color: 'var(--ad-dim)', fontSize: 14, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
          ← Kembali
        </Link>
        <span style={{ color: 'var(--ad-muted)' }}>/</span>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--ad-text)', margin: 0 }}>Tambah Buku Baru</h1>
      </div>
      <BookForm action={createBook} submitLabel="Terbitkan Buku →" />
    </div>
  )
}
