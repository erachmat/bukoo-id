import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  usePathname: () => '/publisher/dashboard',
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock('../catalog-table', () => ({ CatalogTable: () => null }));

import { DashboardClient } from './dashboard-client';
import PublisherDashboardLoading from './loading';

const period = {
  key: 'custom',
  label: '2026-08-01 – 2026-09-15',
  start: '2026-08-01',
  endExclusive: '2026-09-16',
};

const dashboardProps = {
  user: { name: 'Publisher' },
  tab: 'performa',
  overview: {
    period,
    bookStats: [{
      id: 'book-a',
      title: 'Book A',
      author: 'Author A',
      coverKey: null,
      subscriptionRequired: 'FREE',
      reads: 12,
      seconds: 300,
      completions: 3,
      lifetimeReads: 50,
      isPublished: true,
      hasPreviousReads: false,
      previousReads: 0,
      estimatedRoyalty: 0,
    }],
  },
  catalog: [],
  discoveryFunnel: {
    status: 'ready',
    period,
    rows: [{
      bookId: 'book-a',
      title: 'Book A',
      author: 'Author A',
      coverageStart: '2026-08-10',
      coverageEnd: '2026-09-15',
      hasSelectedMetrics: true,
      anonymousDetailViews: 8,
      anonymousAppCtaClicks: 3,
      signedInDetailViews: 5,
      signedInAppCtaClicks: 2,
      attributedReaderDays: 1,
      unattributedReaderDays: 4,
    }],
  },
};

function dashboardMarkup(props: unknown = dashboardProps) {
  const typedProps = props as unknown as Parameters<typeof DashboardClient>[0];
  return renderToStaticMarkup(React.createElement(DashboardClient, typedProps));
}

describe('publisher book performance discovery funnel', () => {
  it('shows the three separate stages, coverage metadata, and book actions', () => {
    const html = dashboardMarkup();

    expect(html).toContain('Funnel penemuan web ke baca');
    expect(html).toContain('Tayangan detail web');
    expect(html).toContain('Klik CTA aplikasi');
    expect(html).toContain('Hari baca mobile');
    expect(html).toContain('Cakupan parsial');
    expect(html).toContain('2026-09-15 (UTC)');
    expect(html).toContain('Analitik buku');
    expect(html).toContain('Kelola buku');
    expect(html).toContain('Tanggal agregat hari baca mobile memakai tanggal UTC receipt pertama yang diterima API');
    expect(html).toContain('<dd>8</dd>');
    expect(html).toContain('<dd>3</dd>');
    expect(html).toContain('<dd>1</dd>');
    expect(html).not.toContain('readerId');
    expect(html).not.toContain('accountId');
  });

  it('keeps a custom selected range on both CSV and per-book analytics actions', () => {
    const html = dashboardMarkup();

    expect(html).toContain('kind=book-stats&amp;period=custom&amp;from=2026-08-01&amp;to=2026-09-15');
    expect(html).toContain('/publisher/dashboard/export?kind=discovery-funnel&amp;period=custom&amp;from=2026-08-01&amp;to=2026-09-15');
    expect(html).toContain('/publisher/books/book-a/analytics?period=custom&amp;from=2026-08-01&amp;to=2026-09-15');
  });

  it('exports the exact selected overview range instead of the chart month', () => {
    const overviewRange = {
      ...dashboardProps.overview,
      publisherName: 'Publisher',
      totalDistinctReaders: 2,
      totalReadStarts: 12,
      totalCompletions: 3,
      publishedBooks: 1,
      readingDataThrough: '2026-09-15',
      monthlyReadTrend: [
        { bucket: '2026-01', reads: 4 },
        { bucket: '2026-09', reads: 8 },
      ],
      comparison: {
        readers: { previous: 2, hasData: true },
        royalty: { previous: 10, hasData: true },
        reads: { previous: 12, hasData: true },
        completions: { previous: 3, hasData: true },
      },
    };
    const html = dashboardMarkup({
      ...dashboardProps,
      tab: 'overview',
      overview: overviewRange,
    });

    expect(html).toContain('href="/publisher/dashboard/export?kind=book-stats&amp;period=custom&amp;from=2026-08-01&amp;to=2026-09-15"');
    expect(html).toContain('Estimasi royalti (periode terpilih)');
    expect(html).toContain('Top Buku pada Periode Terpilih');
    expect(html).toContain('TOTAL ESTIMASI PERIODE TERPILIH');
    expect(html).toContain('vs periode sebelumnya');
    expect(html).not.toContain('vs bulan lalu');
  });

  it('keeps the selected custom range on the royalty page CSV action', () => {
    const html = dashboardMarkup({ ...dashboardProps, tab: 'royalti' });
    expect(html).toContain('href="/publisher/dashboard/export?kind=book-stats&amp;period=custom&amp;from=2026-08-01&amp;to=2026-09-15"');
  });

  it('shows the reader period and freshness without calling read starts sessions', () => {
    const html = dashboardMarkup({
      ...dashboardProps,
      tab: 'pembaca',
      overview: {
        ...dashboardProps.overview,
        readingDataThrough: '2026-09-15',
        totalDistinctReaders: 3,
        totalCompletions: 2,
        readerLoyalty: { oneDay: 2, twoToFourDays: 1, fivePlusDays: 0 },
        funnel: { opened: 4, tenPlus: null, fiftyPlus: null, completed: 2, hasProgressData: false },
      },
    });

    expect(html).toContain('Rentang: 2026-08-01 – 2026-09-15 UTC');
    expect(html).toContain('Data baca terakhir tersimpan: 2026-09-15 UTC');
    expect(html).toContain('50% dari mulai baca');
    expect(html).not.toContain('dari sesi');
  });

  it('does not calculate average reading time when the range has no read starts', () => {
    const html = dashboardMarkup({
      ...dashboardProps,
      tab: 'waktu',
      overview: {
        ...dashboardProps.overview,
        readingDataThrough: null,
        dailyTrend: [],
        weekdayRhythm: [],
        hourRhythm: [],
      },
    });

    expect(html).toContain('Waktu per Mulai Baca</div><div class="pds-kpi-num">—</div>');
    expect(html).toContain('belum ada mulai baca');
    expect(html).toContain('Data baca terakhir tersimpan: belum tersedia');
    expect(html).toContain('receipt pertama server pada reader-day (UTC, 00–23)');
    expect(html).not.toContain('waktu lokal pembaca');
  });

  it('does not show zero funnel values when no daily metric rows exist in the selected range', () => {
    const noRows = {
      ...dashboardProps,
      discoveryFunnel: {
        ...dashboardProps.discoveryFunnel,
        rows: [{
          ...dashboardProps.discoveryFunnel.rows[0],
          coverageStart: '2026-07-01',
          coverageEnd: '2026-07-20',
          hasSelectedMetrics: false,
          anonymousDetailViews: 0,
          anonymousAppCtaClicks: 0,
          signedInDetailViews: 0,
          signedInAppCtaClicks: 0,
          attributedReaderDays: 0,
          unattributedReaderDays: 0,
        }],
      },
    };

    const html = dashboardMarkup(noRows);

    expect(html).toContain('Tidak ada baris metrik funnel pada rentang terpilih');
    expect(html).toContain('<dd>—</dd>');
    expect(html).not.toContain('<dd>0</dd>');
  });

  it('shows an em dash instead of a completion percentage without read starts', () => {
    const noReads = {
      ...dashboardProps,
      overview: {
        ...dashboardProps.overview,
        bookStats: [{
          ...dashboardProps.overview.bookStats[0],
          reads: 0,
          completions: 0,
        }],
      },
    };
    const html = dashboardMarkup(noReads);

    expect(html).toMatch(/<td[^>]*>—<\/td>/);
  });

  it('does not show a dashboard completion rate when the selected range has no read starts', () => {
    const emptyOverview = {
      period,
      publisherName: 'Publisher',
      totalBooks: 0,
      publishedBooks: 0,
      inReviewBooks: 0,
      totalDistinctReaders: 0,
      totalReadStarts: 0,
      totalReadingSeconds: 0,
      totalCompletions: 0,
      totalLifetimeReads: 0,
      royaltyEstimate: 0,
      readerLoyalty: { oneDay: 0, twoToFourDays: 0, fivePlusDays: 0 },
      geo: [],
      topBooks: [],
      comparison: {
        reads: { previous: 0, hasData: false },
        readers: { previous: 0, hasData: false },
        seconds: { previous: 0, hasData: false },
        completions: { previous: 0, hasData: false },
        royalty: { previous: 0, hasData: false },
      },
      dailyTrend: [],
      monthlyReadTrend: [{ bucket: '2026-09', reads: 0 }],
      royaltyTrend: [],
      genreSplit: [],
      demographics: null,
      funnel: { opened: 0, tenPlus: null, fiftyPlus: null, completed: 0, hasProgressData: false },
      cities: [],
      weekdayRhythm: [],
      hourRhythm: [],
      bookStats: [],
      recentNotifications: [],
      payouts: [],
      premiumInsights: { premiumBookCount: 0, books: [] },
    };
    const html = dashboardMarkup({
      ...dashboardProps,
      tab: 'overview',
      overview: emptyOverview,
    });

    expect(html).toMatch(/Tingkat selesai baca<\/div><div class="pds-kpi-num">—<\/div>/);
    expect(html).toContain('Rentang data: 2026-08-01 – 2026-09-15 UTC');
    expect(html).toContain('Data baca agregat terakhir tercatat: belum tersedia');
  });

  it('shows an accessible dashboard loading state without placeholder metrics', () => {
    const html = renderToStaticMarkup(PublisherDashboardLoading());

    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('role="status"');
    expect(html).toContain('Memuat insight performa buku');
    expect(html).not.toContain('<dd>0</dd>');
  });
});
