import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getPublisherUser: vi.fn(),
  getPublisherDashboardOverview: vi.fn(),
  getPublisherDiscoveryFunnelExport: vi.fn(),
}));
vi.mock('@/lib/publisher-auth', () => ({
  getPublisherUser: mocks.getPublisherUser,
}));
vi.mock('../queries', () => ({
  getPublisherDashboardOverview: mocks.getPublisherDashboardOverview,
  getPublisherDiscoveryFunnelExport: mocks.getPublisherDiscoveryFunnelExport,
}));

import { GET } from './route';

describe('publisher discovery funnel export', () => {
  it('exports only aggregate counters and the selected coverage range', async () => {
    mocks.getPublisherUser.mockResolvedValue({
      id: 'publisher-a',
      name: 'Publisher',
    });
    mocks.getPublisherDiscoveryFunnelExport.mockResolvedValue({
      period: {
        key: 'custom',
        start: '2026-08-01',
        endExclusive: '2026-09-16',
        label: '2026-08-01 – 2026-09-15',
      },
      rows: [
        {
          bookId: 'book-a',
          title: 'Book A',
          author: 'Author A',
          coverageStart: '2026-09-04',
          coverageEnd: '2026-09-15',
          hasSelectedMetrics: true,
          anonymousDetailViews: 12,
          anonymousAppCtaClicks: 3,
          signedInDetailViews: 4,
          signedInAppCtaClicks: 2,
          attributedReaderDays: 1,
          unattributedReaderDays: 5,
          accountId: 'reader-secret',
        },
      ],
    });

    const response = await GET(
      new Request(
        'https://publisher.bukoo.test/publisher/dashboard/export?kind=discovery-funnel&period=custom&from=2026-08-01&to=2026-09-15&bookId=book-a',
      ),
    );
    const csv = await response.text();

    expect(response.status).toBe(200);
    expect(csv).toContain('Anonymous detail views');
    expect(csv).toContain('Book A');
    expect(csv).toContain('2026-09-04');
    expect(csv).toContain('2026-09-15');
    expect(csv).toContain('2026-08-01 – 2026-09-15');
    expect(csv).toContain('Data last recorded (UTC)');
    expect(csv).toContain('within seven days before the first server receipt of syncBatchId');
    expect(csv).toContain('Mobile date bucket');
    expect(csv).toContain('not the actual reading date');
    expect(csv).toContain('12');
    expect(csv).not.toContain('reader-secret');
    expect(csv).not.toContain('accountId');
    expect(mocks.getPublisherDiscoveryFunnelExport).toHaveBeenCalledWith(
      'publisher-a',
      expect.objectContaining({
        period: 'custom',
        from: '2026-08-01',
        to: '2026-09-15',
      }),
      'book-a',
    );
  });

  it('exports unavailable values when the selected range has no stored funnel rows', async () => {
    mocks.getPublisherUser.mockResolvedValue({ id: 'publisher-a', name: 'Publisher' });
    mocks.getPublisherDiscoveryFunnelExport.mockResolvedValue({
      period: {
        key: 'custom',
        start: '2026-09-01',
        endExclusive: '2026-09-16',
        label: '2026-09-01 – 2026-09-15',
      },
      rows: [{
        bookId: 'book-a',
        title: 'Book A',
        author: 'Author A',
        coverageStart: '2026-08-10',
        coverageEnd: '2026-08-20',
        hasSelectedMetrics: false,
        anonymousDetailViews: 0,
        anonymousAppCtaClicks: 0,
        signedInDetailViews: 0,
        signedInAppCtaClicks: 0,
        attributedReaderDays: 0,
        unattributedReaderDays: 0,
      }],
    });

    const response = await GET(new Request(
      'https://publisher.bukoo.test/publisher/dashboard/export?kind=discovery-funnel&period=custom&from=2026-09-01&to=2026-09-15',
    ));
    const csv = await response.text();

    expect(response.status).toBe(200);
    expect(csv).toContain('No stored daily metric rows in selected range');
    expect(csv).toContain('no row does not prove zero activity');
    expect(csv).toContain('—,');
    expect(csv).not.toContain('Book A,Author A,Available,2026-08-10,2026-08-20,0,0');
  });
});

describe('publisher book stats export', () => {
  it('includes the same selected range and definitions as the performance table', async () => {
    mocks.getPublisherUser.mockResolvedValue({ id: 'publisher-a', name: 'Publisher' });
    mocks.getPublisherDashboardOverview.mockResolvedValue({
      period: {
        key: 'custom',
        start: '2026-08-01',
        endExclusive: '2026-09-16',
        label: '2026-08-01 – 2026-09-15',
      },
      bookStats: [{
        id: 'book-a',
        title: 'Book A',
        author: 'Author A',
        subscriptionRequired: 'FREE',
        isPublished: true,
        reads: 3,
        seconds: 180,
        completions: 1,
        lifetimeReads: 8,
      }],
    });

    const response = await GET(new Request(
      'https://publisher.bukoo.test/publisher/dashboard/export?kind=book-stats&period=custom&from=2026-08-01&to=2026-09-15',
    ));
    const csv = await response.text();

    expect(response.status).toBe(200);
    expect(csv).toContain('2026-08-01 – 2026-09-15');
    expect(csv).toContain('Tanggal mulai inklusif (UTC)');
    expect(csv).toContain('Tanggal akhir eksklusif (UTC)');
    expect(csv).toContain('sekali per pembaca, buku, dan hari');
    expect(csv).toContain('bukan jumlah sesi');
    expect(csv).toContain('Dihitung saat progres baca mencapai 100%');
    expect(mocks.getPublisherDashboardOverview).toHaveBeenCalledWith(
      'publisher-a',
      'Publisher',
      expect.objectContaining({ period: 'custom', from: '2026-08-01', to: '2026-09-15' }),
    );
  });
});
