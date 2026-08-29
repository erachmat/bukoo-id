import { getCloudflareContext } from '@opennextjs/cloudflare';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Serves R2 cover images through the web worker.
 *
 * R2 `cover_key` values stored in the DB are object keys like
 * `covers/abc123.png` — not public URLs. This route maps
 * `/covers/<key>` → `BUKOO_STORAGE.get(<key>)` so `<img>` tags can render them
 * without needing a public R2 custom domain.
 *
 * Only the `covers/` prefix is served — no other R2 objects (e.g. EPUBs in
 * `epubs/`) are exposed through this public route.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key } = await params;
  if (!key || key.length === 0) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const objectKey = key.join('/');
  if (!objectKey.startsWith('covers/')) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const { env } = getCloudflareContext();

  const object = await env.BUKOO_STORAGE.get(objectKey);
  if (!object) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');

  return new NextResponse(object.body, { headers });
}
