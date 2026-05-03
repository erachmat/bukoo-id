import { Language } from '@prisma/client'
import { prisma } from '../src/lib/prisma'
import { mockBooks } from '../src/lib/data/mock-books'

function mockLanguage(lang: string): Language {
  return lang === 'EN' ? Language.EN : Language.ID
}

async function main() {
  for (const mock of mockBooks) {
    await prisma.book.upsert({
      where: { id: mock.id },
      create: {
        id: mock.id,
        title: mock.title,
        author: mock.author,
        description: mock.description,
        coverUrl: mock.coverUrl,
        genre: mock.genre,
        language: mockLanguage(mock.language),
        year: mock.year,
        pageCount: mock.pageCount,
        readCount: mock.readCount,
        isPremium: mock.isPremium,
        isPublished: true,
      },
      update: {
        title: mock.title,
        author: mock.author,
        description: mock.description,
        coverUrl: mock.coverUrl,
        genre: mock.genre,
        language: mockLanguage(mock.language),
        year: mock.year,
        pageCount: mock.pageCount,
        readCount: mock.readCount,
        isPremium: mock.isPremium,
        isPublished: true,
      },
    })
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
