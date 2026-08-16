import { getCloudflareContext } from '@opennextjs/cloudflare';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Serves R2 cover images (and any other R2 object) through the web worker.
 *
 * R2 `cover_key` values stored in the DB are object keys like
 * `covers/abc123.png` — not public URLs. This route maps
 * `/covers/<key>` → `BUKOO_STORAGE.get(<key>)` so `<img>` tags can render them
 * without needing a public R2 custom domain.
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
