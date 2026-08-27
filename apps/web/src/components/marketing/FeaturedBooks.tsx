import { getDb } from '@/lib/db';
import { books as booksTable } from '@bukoo/db';
import { and, desc, eq } from 'drizzle-orm';
import { bookRowToCatalogBook } from '@/lib/data/book-mapper';
import { BookCatalogCard } from '@/components/catalog/book-catalog-card';

export async function FeaturedBooks() {
  const db = getDb();
  const rows = await db
    .select()
    .from(booksTable)
    .where(and(eq(booksTable.featured, true), eq(booksTable.isPublished, true)))
    .orderBy(desc(booksTable.featuredAt))
    .limit(10);
  if (rows.length === 0) return null;

  const books = rows.map(bookRowToCatalogBook);
  return (
    <section className="book-section">
      <div className="section-header">
        <div className="section-title-row">
          <h2 className="section-h2">📌 Unggulan Penerbit</h2>
        </div>
      </div>
      <div className="book-row">
        {books.map((book) => (
          <div className="book-card" key={book.id}>
            <BookCatalogCard book={book} />
          </div>
        ))}
      </div>
    </section>
  );
}
