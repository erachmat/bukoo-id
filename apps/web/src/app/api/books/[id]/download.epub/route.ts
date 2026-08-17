import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getDb } from '@/lib/db';
import { books, subscriptions } from '@bukoo/db';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { isBookAccessible } from '@bukoo/shared-types';
import { tierFromSubscription } from '@/lib/subscription';

export const dynamic = 'force-dynamic';

/**
 * Streams an EPUB from R2 for the in-app reader.
 *
 * The URL ends in `.epub` so epubjs (react-reader) detects it as a binary EPUB
 * archive rather than an unpacked directory (which would make it try to fetch
 * `META-INF/container.xml` and fail).
 *
 * SECURITY: unlike the previous implementation, this route now enforces
 * authentication and subscription access itself (it no longer trusts that the
 * reader page already did). Without this, any authenticated free user could
 * fetch a paid book's EPUB directly by URL.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const db = getDb();
  const [book, sub] = await Promise.all([
    db.query.books.findFirst({ where: eq(books.id, id) }),
    db.query.subscriptions.findFirst({
      where: eq(subscriptions.userId, session.user.id),
    }),
  ]);
  if (!book || !book.epubKey) {
    return new NextResponse('Not Found', { status: 404 });
  }

  // Enforce subscription entitlement as the final gate before streaming.
  const userTier = tierFromSubscription(sub);
  if (!isBookAccessible(userTier, book.subscriptionRequired)) {
    return new NextResponse('Forbidden', { status: 403 });
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