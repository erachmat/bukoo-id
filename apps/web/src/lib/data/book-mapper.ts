import type { books } from '@bukoo/db'
import type { MockBook } from '@/lib/data/mock-books'

export function prismaBookToCatalogBook(book: typeof books.$inferSelect): MockBook {
  const genreList = typeof book.genre === 'string' ? JSON.parse(book.genre || '[]') : book.genre
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    description: book.description ?? '',
    coverUrl: book.coverKey ?? '',
    genre: Array.isArray(genreList) ? genreList : [],
    language: book.language,
    year: book.publishedYear ?? 0,
    pageCount: book.totalPages ?? 0,
    readCount: book.readCount,
    isPremium: book.subscriptionRequired !== 'FREE',
    subscriptionRequired: book.subscriptionRequired,
  }
}
