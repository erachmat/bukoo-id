import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  getPublisherBookAnalytics: vi.fn(),
}));
vi.mock('@/lib/auth', () => ({ auth: mocks.auth }));
vi.mock('@/app/publisher/dashboard/queries', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/app/publisher/dashboard/queries')>()),
  getPublisherBookAnalytics: mocks.getPublisherBookAnalytics,
}));
vi.mock('next/navigation', () => ({ notFound: vi.fn() }));

import PublisherBookAnalyticsPage from './page';
import PublisherBookAnalyticsLoading from './loading';

const analyticsFixture = {
  book: { id: 'book-a', title: 'Book A', author: 'Author', coverKey: null },
  period: { key: 'this_month', label: 'September 2026', start: '2026-09-01', endExclusive: '2026-10-01' },
  daily: [],
  uniqueReaders: 0,
  loyalty: { oneDay: 0, twoToFourDays: 0, fivePlusDays: 0 },
  discovery: {
    status: 'ready' as const,
    coverageStart: null,
    coverageEnd: null,
    daily: [],
  },
};

async function pageMarkup(searchParams: Record<string, string> = { period: 'this_month' }) {
  const page = await PublisherBookAnalyticsPage({
    params: Promise.resolve({ id: 'book-a' }),
    searchParams: Promise.resolve(searchParams),
  });
  return renderToStaticMarkup(page);
}

describe('publisher book discovery funnel UX', () => {
  it('shows selected range and an honest no-coverage state', async () => {
    mocks.auth.mockResolvedValue({
      user: { id: 'publisher-a', role: 'PUBLISHER' },
    });
    mocks.getPublisherBookAnalytics.mockResolvedValue(analyticsFixture);

    const html = await pageMarkup();

    expect(html).toContain('September 2026');
    expect(html).toContain('Rentang aktivitas baca: 2026-09-01 – 2026-09-30 UTC');
    expect(html).toContain('bukan sesi');
    expect(html).toContain('Data baca terakhir tersimpan: belum tersedia');
    expect(html).toContain('Belum ada coverage funnel tersimpan');
    expect(html).toContain('Hari baca mobile');
    expect(html).toContain('—');
    expect(html).toContain('bukan sesi');
  });

  it('shows a recoverable error state when funnel data cannot load', async () => {
    mocks.auth.mockResolvedValue({
      user: { id: 'publisher-a', role: 'PUBLISHER' },
    });
    mocks.getPublisherBookAnalytics.mockResolvedValue({
      ...analyticsFixture,
      discovery: { status: 'error', coverageStart: null, coverageEnd: null, daily: [] },
    });

    const html = await pageMarkup();
    expect(html).toContain('role="alert"');
    expect(html).toContain('Data funnel belum dapat dimuat. Coba muat ulang halaman.');
  });

  it('separates funnel stages and explains partial coverage, freshness, and receipt-time attribution', async () => {
    mocks.auth.mockResolvedValue({
      user: { id: 'publisher-a', role: 'PUBLISHER' },
    });
    mocks.getPublisherBookAnalytics.mockResolvedValue({
      ...analyticsFixture,
      period: {
        key: 'custom',
        label: '2026-08-01 – 2026-09-15',
        start: '2026-08-01',
        endExclusive: '2026-09-16',
      },
      discovery: {
        status: 'ready',
        coverageStart: '2026-08-10',
        coverageEnd: '2026-09-15',
        daily: [{
          date: '2026-08-10',
          anonymousDetailViews: 8,
          anonymousAppCtaClicks: 3,
          signedInDetailViews: 5,
          signedInAppCtaClicks: 2,
          attributedReaderDays: 1,
          unattributedReaderDays: 4,
        }],
      },
    });

    const html = await pageMarkup({
      period: 'custom',
      from: '2026-08-01',
      to: '2026-09-15',
    });

    expect(html).toContain('Tayangan detail web');
    expect(html).toContain('Klik CTA aplikasi');
    expect(html).toContain('Hari baca mobile');
    expect(html).toContain('Anonim');
    expect(html).toContain('Signed-in');
    expect(html).toContain('Teratribusi');
    expect(html).toContain('Tanpa atribusi');
    expect(html).toContain('Cakupan parsial');
    expect(html).toContain('2026-08-10');
    expect(html).toContain('Data funnel tercatat sampai 2026-09-15 (UTC)');
    expect(html).toContain('receipt pertama');
    expect(html).toContain('tujuh hari');
    expect(html).toContain('tanggal UTC receipt pertama yang diterima API');
    expect(html).toContain('Sync offline');
    expect(html).toContain('from=2026-08-01&amp;to=2026-09-15');
    expect(html).toContain('tidak dihitung sebagai conversion rate');
  });

  it('does not report zeros for a selected range before funnel coverage began', async () => {
    mocks.auth.mockResolvedValue({
      user: { id: 'publisher-a', role: 'PUBLISHER' },
    });
    mocks.getPublisherBookAnalytics.mockResolvedValue({
      ...analyticsFixture,
      period: {
        key: 'custom',
        label: '2026-07-01 – 2026-07-31',
        start: '2026-07-01',
        endExclusive: '2026-08-01',
      },
      discovery: {
        status: 'ready',
        coverageStart: '2026-08-10',
        coverageEnd: '2026-09-15',
        daily: [],
      },
    });

    const html = await pageMarkup({
      period: 'custom',
      from: '2026-07-01',
      to: '2026-07-31',
    });

    expect(html).toContain('Belum tercakup pada rentang ini');
    expect(html).toContain('<dd>—</dd>');
  });

  it('does not report zeros when the selected range has no stored funnel rows', async () => {
    mocks.auth.mockResolvedValue({
      user: { id: 'publisher-a', role: 'PUBLISHER' },
    });
    mocks.getPublisherBookAnalytics.mockResolvedValue({
      ...analyticsFixture,
      period: {
        key: 'custom',
        label: '2026-09-01 – 2026-09-15',
        start: '2026-09-01',
        endExclusive: '2026-09-16',
      },
      discovery: {
        status: 'ready',
        coverageStart: '2026-08-10',
        coverageEnd: '2026-08-20',
        daily: [],
      },
    });

    const html = await pageMarkup({
      period: 'custom',
      from: '2026-09-01',
      to: '2026-09-15',
    });

    expect(html).toContain('Tidak ada baris metrik funnel pada rentang terpilih');
    expect(html).toContain('<dd>—</dd>');
    expect(html).not.toContain('<dd>0</dd>');
  });

  it('provides a loading state for analytics and funnel data', () => {
    const html = renderToStaticMarkup(PublisherBookAnalyticsLoading());
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('Memuat aktivitas baca dan funnel penemuan web');
  });
});
