import { getDb } from '@/lib/db';
import { books } from '@bukoo/db';
import { eq, and, desc, sql, type SQL } from 'drizzle-orm';
import type { LibraryCatalogParams } from '@/lib/library/catalog-params';

/**
 * Find books for the library catalog.
 *
 * NOTE: This uses Drizzle's typesafe query builder which generates
 * SQLite-compatible SQL (D1). The old Postgres raw queries using
 * ILIKE/unnest are replaced with SQLite LIKE and json_each() calls.
 *
 * Full-text search (q param) is handled server-side here with LIKE
 * for apps/web display. The apps/api /search endpoint uses FTS5 for
 * better quality search from the mobile client.
 */
export async function findBooksForLibraryCatalog(
  filters: LibraryCatalogParams,
  limit?: number,
): Promise<(typeof books.$inferSelect)[]> {
  const { q, genre, access, lang, sort } = filters;
  const db = getDb();

  // Build conditions array for Drizzle
  const conditions: (SQL | undefined)[] = [eq(books.isPublished, true)];

  if (lang === 'id') {
    conditions.push(eq(books.language, 'ID'));
  } else if (lang === 'en') {
    conditions.push(eq(books.language, 'EN'));
  }

  if (access === 'free') {
    conditions.push(eq(books.subscriptionRequired, 'FREE'));
  }

  // Filter non-undefined conditions
  const definedConditions = conditions.filter((c): c is SQL => c !== undefined);

  // Genre filter: SQLite json_each — must use raw SQL since Drizzle doesn't
  // support json_each in WHERE natively yet. We post-filter in JS for simplicity
  // if genre is set (book count is small enough for MVP).

  let results: (typeof books.$inferSelect)[];

  if (genre && genre !== 'Semua') {
    // json_each is not expressible through Drizzle's query builder — build a
    // parameterized raw query with the sql template (bound safely on D1).
    const genrePattern = `%${genre}%`;
    const where = sql`b.is_published = 1 AND json_each.value LIKE ${genrePattern}`;

    if (lang === 'id') where.append(sql` AND b.language = 'ID'`);
    else if (lang === 'en') where.append(sql` AND b.language = 'EN'`);

    if (access === 'free') where.append(sql` AND b.subscription_required = 'FREE'`);
    else if (access === 'premium') where.append(sql` AND b.subscription_required != 'FREE'`);

    if (q) {
      const pattern = `%${q}%`;
      where.append(
        sql` AND (b.title LIKE ${pattern} OR b.author LIKE ${pattern} OR b.description LIKE ${pattern})`,
      );
    }

    const orderClause =
      sort === 'newest' ? sql` ORDER BY b.created_at DESC` : sql` ORDER BY b.read_count DESC`;
    const limitClause = limit ? sql` LIMIT ${limit}` : sql``;

    const rawQuery = sql`
      SELECT DISTINCT b.* FROM books b, json_each(b.genre)
      WHERE ${where}
    `.append(orderClause).append(limitClause);

    results = await db.all<typeof books.$inferSelect>(rawQuery);
  } else {
    // Standard Drizzle query for no-genre case
    const orderBy = sort === 'newest' ? desc(books.createdAt) : desc(books.readCount);

    const baseQuery = db.select().from(books).where(and(...definedConditions)).orderBy(orderBy);

    results = await (limit ? baseQuery.limit(limit) : baseQuery);

    // Post-filter by search query (LIKE in JS for simplicity)
    if (q) {
      const lq = q.toLowerCase();
      results = results.filter(
        (b) =>
          b.title.toLowerCase().includes(lq) ||
          b.author.toLowerCase().includes(lq) ||
          (b.description?.toLowerCase().includes(lq) ?? false),
      );
    }

    // Post-filter for premium access
    if (access === 'premium') {
      results = results.filter((b) => b.subscriptionRequired !== 'FREE');
    }
  }

  return results;
}
