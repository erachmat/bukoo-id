import { afterEach, describe, expect, it, vi } from 'vitest';
import { createBookDetailViewReporter } from './book-discovery-client';

afterEach(() => vi.unstubAllGlobals());

describe('book discovery client events', () => {
  it('counts once for repeated renders/effects during one book exposure', () => {
    const report = vi.fn();
    const onExpose = createBookDetailViewReporter(report);

    onExpose('canonical-book-42');
    onExpose('canonical-book-42');
    onExpose('canonical-book-42');
    onExpose('another-book');

    expect(report.mock.calls).toEqual([
      ['canonical-book-42'],
      ['another-book'],
    ]);
  });

  it('sends a CTA event only when called and keeps the requested deep link', async () => {
    const sendBeacon = vi.fn<typeof navigator.sendBeacon>(() => true);
    vi.stubGlobal('navigator', { sendBeacon });

    const { BookDiscoveryLink } =
      await import('@/components/app/book-discovery-link');
    const link = BookDiscoveryLink({
      href: 'bukoo://book/canonical-book-42',
      bookId: 'canonical-book-42',
      children: 'Buka di App',
    });

    expect(sendBeacon).not.toHaveBeenCalled();
    expect(link.props.href).toBe('bukoo://book/canonical-book-42');
    expect(link.props['data-book-discovery-book-id']).toBe('canonical-book-42');
    expect(link.props.onClick()).toBeUndefined();
    expect(sendBeacon).toHaveBeenCalledOnce();
    expect(sendBeacon.mock.calls[0][0]).toBe('/api/book-discovery');
    expect(await new Response(sendBeacon.mock.calls[0][1]).json()).toEqual({
      bookId: 'canonical-book-42',
      eventType: 'app_cta_click',
    });
  });
});
