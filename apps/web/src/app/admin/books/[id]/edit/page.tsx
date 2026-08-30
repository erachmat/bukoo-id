import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getDb } from '@/lib/db'
import { books as booksTable } from '@bukoo/db'
import { eq } from 'drizzle-orm'
import { getCoverUrl } from '@/lib/cover-url'
import { BookForm } from '../../_components/book-form'
import { updateBook } from '../../actions'

export default async function EditBookPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const db = getDb()
  const book = await db.query.books.findFirst({ where: eq(booksTable.id, id) })

  if (!book) notFound()

  const genreList = typeof book.genre === 'string' ? JSON.parse(book.genre || '[]') : book.genre

  const boundAction = updateBook.bind(null, id)

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <Link href="/admin/books" style={{ color: 'var(--ad-dim)', fontSize: 14, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
          ← Kembali
        </Link>
        <span style={{ color: 'var(--ad-muted)' }}>/</span>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--ad-text)', margin: 0 }}>Edit: {book.title}</h1>
      </div>
      <BookForm
        action={boundAction}
        submitLabel="Simpan Perubahan"
        defaultValues={{
          title: book.title,
          author: book.author,
          description: book.description ?? undefined,
          genre: Array.isArray(genreList) ? genreList[0] : undefined,
          language: book.language as 'ID' | 'EN',
          subscriptionRequired: book.subscriptionRequired as 'FREE' | 'PERSONAL' | 'FAMILY',
          year: book.publishedYear,
          publisher: book.publisher,
          pageCount: book.totalPages,
          coverUrl: getCoverUrl(book.coverKey) ?? undefined,
          fileUrl: book.epubKey ?? undefined,
        }}
      />
    </div>
  )
}
