import { Prisma } from '@prisma/client'
import type { Book } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import type { LibraryCatalogParams } from '@/lib/library/catalog-params'

export async function findBooksForLibraryCatalog(
  filters: LibraryCatalogParams,
): Promise<Book[]> {
  const { q, genre, access, lang, sort } = filters

  const conditions: Prisma.Sql[] = [Prisma.sql`"isPublished" = true`]

  if (q) {
    const pattern = `%${q}%`
    conditions.push(Prisma.sql`(
      "title" ILIKE ${pattern}
      OR "author" ILIKE ${pattern}
      OR ("description" IS NOT NULL AND "description" ILIKE ${pattern})
    )`)
  }

  if (genre && genre !== 'Semua') {
    const pattern = `%${genre}%`
    if (genre.toLowerCase() === 'fiksi') {
      conditions.push(Prisma.sql`EXISTS (
        SELECT 1 FROM unnest("genre") AS g WHERE g ILIKE ${pattern} AND g NOT ILIKE '%Non-Fiksi%'
      )`)
    } else {
      conditions.push(Prisma.sql`EXISTS (
        SELECT 1 FROM unnest("genre") AS g WHERE g ILIKE ${pattern}
      )`)
    }
  }

  if (access === 'free') {
    conditions.push(Prisma.sql`"isPremium" = false`)
  } else if (access === 'premium') {
    conditions.push(Prisma.sql`"isPremium" = true`)
  }

  if (lang === 'id') {
    conditions.push(Prisma.sql`"language"::text = 'ID'`)
  } else if (lang === 'en') {
    conditions.push(Prisma.sql`"language"::text = 'EN'`)
  }

  const whereClause = Prisma.join(conditions, ' AND ')

  const orderBySql =
    sort === 'newest'
      ? Prisma.raw('"createdAt" DESC')
      : Prisma.raw('"readCount" DESC')

  return prisma.$queryRaw<Book[]>`
    SELECT * FROM "Book"
    WHERE ${whereClause}
    ORDER BY ${orderBySql}
  `
}
