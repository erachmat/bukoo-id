import Link from 'next/link'
import { BookForm } from '../_components/book-form'
import { createBook } from '../actions'

export default function NewBookPage() {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <Link href="/admin/books" style={{ color: '#6B7A8D', fontSize: 14, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
          ← Kembali
        </Link>
        <span style={{ color: '#D1D9E0' }}>/</span>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1A2332', margin: 0 }}>Tambah Buku Baru</h1>
      </div>
      <BookForm action={createBook} submitLabel="Terbitkan Buku →" />
    </div>
  )
}
