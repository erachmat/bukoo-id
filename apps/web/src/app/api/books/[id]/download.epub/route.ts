import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getDb } from '@/lib/db';
import { books } from '@bukoo/db';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Streams an EPUB from R2 for the in-app reader.
 *
 * The URL ends in `.epub` so epubjs (react-reader) detects it as a binary EPUB
 * archive rather than an unpacked directory (which would make it try to fetch
 * `META-INF/container.xml` and fail).
 *
 * The reader page (`/book/[id]/read`) already enforces authentication and
 * subscription access before rendering, so this route only needs to resolve
 * the book's `epub_key` and stream the object from the `BUKOO_STORAGE`
 * binding.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const db = getDb();
  const book = await db.query.books.findFirst({ where: eq(books.id, id) });
  if (!book || !book.epubKey) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const { env } = getCloudflareContext();
  const object = await env.BUKOO_STORAGE.get(book.epubKey);
  if (!object) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('Content-Type', 'application/epub+zip');
  headers.set(
    'Content-Disposition',
    `attachment; filename="${book.title.replace(/[^a-z0-9]/gi, '_')}.epub"`,
  );

  return new NextResponse(object.body, { headers });
}