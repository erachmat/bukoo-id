import { db } from '@/lib/db';
import { books } from '@bukoo/db';
import { eq, and, desc, type SQL } from 'drizzle-orm';
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

  let query = db.select().from(books).where(and(...definedConditions));

  // Genre filter: SQLite json_each — must use raw SQL since Drizzle doesn't
  // support json_each in WHERE natively yet. We post-filter in JS for simplicity
  // if genre is set (book count is small enough for MVP).

  let results: (typeof books.$inferSelect)[];

  if (genre && genre !== 'Semua') {
    // Use the D1 HTTP API directly for json_each queries
    const genreCondition = `json_each.value LIKE ?`;
    const genrePattern = `%${genre}%`;

    const langCondition = lang === 'id' ? 'AND b.language = \'ID\'' :
                           lang === 'en' ? 'AND b.language = \'EN\'' : '';
    const accessCondition = access === 'free' ? 'AND b.subscription_required = \'FREE\'' :
                             access === 'premium' ? 'AND b.subscription_required != \'FREE\'' : '';
    const titleCondition = q
      ? `AND (b.title LIKE ? OR b.author LIKE ? OR b.description LIKE ?)`
      : '';
    const orderClause = sort === 'newest' ? 'ORDER BY b.created_at DESC' : 'ORDER BY b.read_count DESC';
    const limitClause = limit ? `LIMIT ${limit}` : '';

    const sql = `
      SELECT DISTINCT b.* FROM books b, json_each(b.genre)
      WHERE b.is_published = 1
        AND ${genreCondition}
        ${langCondition}
        ${accessCondition}
        ${titleCondition}
      ${orderClause}
      ${limitClause}
    `;

    const params: (string | number)[] = [genrePattern];
    if (q) {
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }

    // Note: db.execute() is available on the D1 HTTP drizzle instance
    // We need to fall back to the lower-level Cloudflare D1 HTTP API here.
    // For apps/web, we call the D1 REST endpoint directly to support raw SQL.
    const endpoint = `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/d1/database/${process.env.CLOUDFLARE_D1_DATABASE_ID}/query`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_D1_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql, params }),
    });

    const data = await response.json() as { result: [{ results: (typeof books.$inferSelect)[] }] };
    results = data.result?.[0]?.results ?? [];
  } else {
    // Standard Drizzle query for no-genre case
    const orderBy = sort === 'newest' ? desc(books.createdAt) : desc(books.readCount);

    let baseQuery = db.select().from(books).where(and(...definedConditions)).orderBy(orderBy);

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
