import { describe, expect, it, vi } from 'vitest';
vi.mock('@/lib/auth', () => ({ auth: vi.fn() }));
vi.mock('@opennextjs/cloudflare', () => ({ getCloudflareContext: vi.fn() }));
import { createBookDiscoveryPost } from './route';

type DiscoveryEventRecorder = (
  database: D1Database,
  event: {
    bookId: string;
    eventType: 'detail_view' | 'app_cta_click';
    accountId: string | null;
    receivedAt: string;
  },
) => Promise<boolean>;

function createRecordEventSpy() {
  return vi.fn<DiscoveryEventRecorder>(async () => true);
}

const allowDiscoveryEvent = async () => ({ allowed: true, retryAfterMs: 0 });

describe('POST /api/book-discovery', () => {
  it('uses the account from the server session and ignores a browser userId', async () => {
    const recordEvent = createRecordEventSpy();
    const receivedAt = new Date('2026-09-29T12:00:00.000Z');
    const post = createBookDiscoveryPost({
      getSession: async () => ({ user: { id: 'session-account' } }),
      getDatabase: () => ({}) as D1Database,
      recordEvent,
      now: () => receivedAt,
      consumeRateLimit: allowDiscoveryEvent,
    });

    const response = await post(
      new Request('https://bukoo.test/api/book-discovery', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          bookId: 'canonical-book-42',
          eventType: 'app_cta_click',
          userId: 'browser-account',
        }),
      }),
    );

    expect(response.status).toBe(204);
    expect(recordEvent).toHaveBeenCalledWith(expect.anything(), {
      bookId: 'canonical-book-42',
      eventType: 'app_cta_click',
      accountId: 'session-account',
      receivedAt: receivedAt.toISOString(),
    });
  });

  it('records anonymous activity without accepting identity from the request', async () => {
    const recordEvent = createRecordEventSpy();
    const post = createBookDiscoveryPost({
      getSession: async () => null,
      getDatabase: () => ({}) as D1Database,
      recordEvent,
      now: () => new Date('2026-09-29T12:00:00.000Z'),
      consumeRateLimit: allowDiscoveryEvent,
    });
    const response = await post(
      new Request('https://bukoo.test/api/book-discovery', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          bookId: 'canonical-book-42',
          eventType: 'detail_view',
          userId: 'browser-account',
          visitorId: 'browser-visitor',
        }),
      }),
    );

    expect(response.status).toBe(204);
    expect(recordEvent).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ accountId: null }),
    );
    expect(recordEvent.mock.calls[0][1]).not.toHaveProperty('visitorId');
    expect(recordEvent.mock.calls[0][1]).not.toHaveProperty('userId');
  });

  it('rejects unsupported event types without writing', async () => {
    const recordEvent = createRecordEventSpy();
    const post = createBookDiscoveryPost({
      getSession: async () => null,
      getDatabase: () => ({}) as D1Database,
      recordEvent,
      consumeRateLimit: allowDiscoveryEvent,
    });
    const response = await post(
      new Request('https://bukoo.test/api/book-discovery', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ bookId: 'book-a', eventType: 'reader_opened' }),
      }),
    );

    expect(response.status).toBe(400);
    expect(recordEvent).not.toHaveBeenCalled();
  });
});
