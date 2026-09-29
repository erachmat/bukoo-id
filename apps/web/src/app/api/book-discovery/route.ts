import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1Database } from '@cloudflare/workers-types';
import {
  recordBookDiscoveryEvent,
  type BookDiscoveryEventType,
} from '@bukoo/db';
import { auth } from '@/lib/auth';
import {
  consumeD1RateLimit,
  getRequestIp,
  RATE_LIMIT_POLICIES,
  rateLimitKey,
  type RateLimitResult,
} from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

type SessionIdentity = { user?: { id?: string | null } | null } | null;

type BookDiscoveryPostDependencies = {
  getSession: () => Promise<SessionIdentity>;
  getDatabase: () => D1Database;
  recordEvent: typeof recordBookDiscoveryEvent;
  now?: () => Date;
  consumeRateLimit: (database: D1Database, request: Request, now: Date) => Promise<RateLimitResult>;
};

const EVENT_TYPES = new Set<BookDiscoveryEventType>([
  'detail_view',
  'app_cta_click',
]);

export function createBookDiscoveryPost(
  dependencies: BookDiscoveryPostDependencies,
): (request: Request) => Promise<Response> {
  return async (request) => {
    if (!request.headers.get('content-type')?.includes('application/json')) {
      return new Response(null, { status: 400 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return new Response(null, { status: 400 });
    }

    if (!body || typeof body !== 'object') {
      return new Response(null, { status: 400 });
    }
    const payload = body as Record<string, unknown>;
    if (
      typeof payload.bookId !== 'string' ||
      payload.bookId.length < 1 ||
      payload.bookId.length > 128 ||
      payload.bookId.trim() !== payload.bookId ||
      typeof payload.eventType !== 'string' ||
      !EVENT_TYPES.has(payload.eventType as BookDiscoveryEventType)
    ) {
      return new Response(null, { status: 400 });
    }

    try {
      const receivedAt = (dependencies.now ?? (() => new Date()))();
      const database = dependencies.getDatabase();
      const limit = await dependencies.consumeRateLimit(database, request, receivedAt);
      if (!limit.allowed) {
        return new Response(null, {
          status: 429,
          headers: {
            'Retry-After': String(Math.max(1, Math.ceil(limit.retryAfterMs / 1000))),
            'Cache-Control': 'no-store',
          },
        });
      }

      const session = await dependencies.getSession();
      const accountId = session?.user?.id || null;
      await dependencies.recordEvent(database, {
        bookId: payload.bookId,
        eventType: payload.eventType as BookDiscoveryEventType,
        accountId,
        receivedAt: receivedAt.toISOString(),
      });
      // A missing or unpublished book is intentionally indistinguishable from
      // a successfully recorded event to the public caller.
      return new Response(null, { status: 204 });
    } catch {
      // Tracking is best effort; the client never awaits this before navigation.
      return new Response(null, { status: 503 });
    }
  };
}

export const POST = createBookDiscoveryPost({
  getSession: () => auth(),
  getDatabase: () => getCloudflareContext().env.DB as D1Database,
  recordEvent: recordBookDiscoveryEvent,
  consumeRateLimit: async (database, request, now) => {
    const requestIpHash = await getRequestIp(request.headers);
    const key = rateLimitKey('bookDiscoveryEventIp', 'ip', requestIpHash);
    const policy = RATE_LIMIT_POLICIES.bookDiscoveryEventIp;
    return consumeD1RateLimit(database, now.getTime(), policy, key);
  },
});
