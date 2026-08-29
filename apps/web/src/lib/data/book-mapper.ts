import type { books } from '@bukoo/db'
import { getCoverUrl } from '@/lib/cover-url'

/**
 * Catalog book DTO used by the reader-app UI (library grid + book detail).
 * Resolves the API's coverKey to a CDN URL.
 */
export type CatalogBook = {
  id: string
  title: string
  author: string
  description: string
  coverUrl: string
  genre: string[]
  language: string
  year: number
  pageCount: number
  readCount: number
  ratingAverage: number
  ratingCount: number
  isPremium: boolean
  subscriptionRequired?: string
}

export function bookRowToCatalogBook(book: typeof books.$inferSelect): CatalogBook {
  const genreList = typeof book.genre === 'string' ? JSON.parse(book.genre || '[]') : book.genre
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    description: book.description ?? '',
    coverUrl: getCoverUrl(book.coverKey),
    genre: Array.isArray(genreList) ? genreList : [],
    language: book.language,
    year: book.publishedYear ?? 0,
    pageCount: book.totalPages ?? 0,
    readCount: book.readCount,
    ratingAverage: book.ratingAverage ?? 0,
    ratingCount: book.ratingCount ?? 0,
    isPremium: book.subscriptionRequired !== 'FREE',
    subscriptionRequired: book.subscriptionRequired,
  }
}
