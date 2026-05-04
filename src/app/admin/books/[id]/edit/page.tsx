import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { BookForm } from '../../_components/book-form'
import { updateBook } from '../../actions'

export default async function EditBookPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const book = await prisma.book.findUnique({ where: { id } })

  if (!book) notFound()

  const boundAction = updateBook.bind(null, id)

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <Link href="/admin/books" style={{ color: '#6B7A8D', fontSize: 14, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
          ← Kembali
        </Link>
        <span style={{ color: '#D1D9E0' }}>/</span>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1A2332', margin: 0 }}>Edit: {book.title}</h1>
      </div>
      <BookForm
        action={boundAction}
        submitLabel="Simpan Perubahan"
        defaultValues={{
          title: book.title,
          author: book.author,
          description: book.description ?? undefined,
          genre: book.genre[0],
          language: book.language,
          isPremium: book.isPremium,
          year: book.year,
          publisher: book.publisher,
          pageCount: book.pageCount,
          coverUrl: book.coverUrl,
          fileUrl: book.fileUrl,
        }}
      />
    </div>
  )
}
