export type BookDiscoveryClientEvent = 'detail_view' | 'app_cta_click';

const EVENT_ENDPOINT = '/api/book-discovery';

/** Send a best-effort event. Navigation always continues without awaiting it. */
export function sendBookDiscoveryEvent(
  bookId: string,
  eventType: BookDiscoveryClientEvent,
): void {
  if (typeof navigator === 'undefined') return;
  const body = JSON.stringify({ bookId, eventType });

  try {
    if (
      typeof navigator.sendBeacon === 'function' &&
      navigator.sendBeacon(
        EVENT_ENDPOINT,
        new Blob([body], { type: 'application/json' }),
      )
    ) {
      return;
    }
  } catch {
    // Fall through to a keepalive fetch. Neither transport can block a CTA.
  }

  void fetch(EVENT_ENDPOINT, {
    method: 'POST',
    credentials: 'same-origin',
    keepalive: true,
    headers: { 'content-type': 'application/json' },
    body,
  }).catch(() => undefined);
}

/** One report for repeated React effects during the same book-page exposure. */
export function createBookDetailViewReporter(
  report: (bookId: string) => void,
): (bookId: string) => void {
  let lastBookId: string | null = null;
  return (bookId) => {
    if (!bookId || lastBookId === bookId) return;
    lastBookId = bookId;
    report(bookId);
  };
}
