import type { Book as PrismaBook } from '@prisma/client'
import type { MockBook } from '@/lib/data/mock-books'

export function prismaBookToCatalogBook(book: PrismaBook): MockBook {
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    description: book.description ?? '',
    coverUrl: book.coverUrl ?? '',
    genre: book.genre,
    language: book.language,
    year: book.year ?? 0,
    pageCount: book.pageCount ?? 0,
    readCount: book.readCount,
    isPremium: book.isPremium,
  }
}
