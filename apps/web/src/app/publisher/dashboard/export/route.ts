import { getPublisherUser } from '@/lib/publisher-auth';
import { csvResponseHeaders, toCsv } from '@/lib/csv';
import { getDiscoveryCoverageState } from '../metrics';
import {
  getPublisherDashboardOverview,
  getPublisherDiscoveryFunnelExport,
} from '../queries';

export const dynamic = 'force-dynamic';

const KINDS = new Set(['book-stats', 'payouts', 'top-books', 'discovery-funnel']);

/**
 * Publisher CSV export — mirrors the on-screen period exactly.
 * ?kind=book-stats|payouts|top-books|discovery-funnel&period=…&from=…&to=…&bookId=…
 */
export async function GET(request: Request): Promise<Response> {
  let publisher;
  try {
    publisher = await getPublisherUser();
  } catch {
    return new Response('Unauthorized', { status: 401 });
  }

  const url = new URL(request.url);
  const kind = url.searchParams.get('kind') ?? 'book-stats';
  if (!KINDS.has(kind)) return new Response('Unknown export kind', { status: 400 });

  if (kind === 'discovery-funnel') {
    const funnel = await getPublisherDiscoveryFunnelExport(
      publisher.id,
      {
        period: url.searchParams.get('period'),
        from: url.searchParams.get('from'),
        to: url.searchParams.get('to'),
      },
      url.searchParams.get('bookId'),
    );
    const periodTag = funnel.period.key === 'custom'
      ? 'custom'
      : funnel.period.start ?? 'all';
    const metadata = toCsv(
      ['Report metadata', 'Value'],
      [
        ['Selected range', funnel.period.label],
        ['Start date inclusive (UTC)', funnel.period.start ?? 'No lower bound'],
        ['End date exclusive (UTC)', funnel.period.endExclusive ?? 'No upper bound'],
        ['Metric definitions', 'Detail views count book-page exposures, not unique people. CTA clicks count explicit app-link actions, not unique people.'],
        ['Mobile reader-days', 'One per reader, book, and day; not sessions. Attributed only for the same account and book with the latest eligible CTA within seven days before the first server receipt of syncBatchId.'],
        ['Mobile date bucket', 'Attributed and unattributed reader-days use the UTC date of first API receipt, not the actual reading date. Offline sync can shift the attribution and bucket date.'],
        ['Attribution time', 'Server receipt time is a proxy, not actual reading time. Offline sync can shift receipt later than the reading activity.'],
        ['Legacy syncs', 'Requests without syncBatchId are outside discovery funnel attribution.'],
        ['Coverage', 'Per book, from its first stored daily funnel date. No historical backfill; data before coverage is unavailable. Daily rows exist only for dates with funnel events; no row does not prove zero activity, so values are blank when the selected range has no rows.'],
        ['Freshness', 'Per book, through its latest stored daily funnel date (UTC).'],
        ['Privacy', 'Aggregate-only output; no reader/account identities or per-reader event details.'],
      ],
    );
    const table = toCsv(
      [
        'Book title',
        'Author',
        'Coverage status',
        'Data coverage since (UTC)',
        'Data last recorded (UTC)',
        'Anonymous detail views',
        'Anonymous app CTA clicks',
        'Signed-in detail views',
        'Signed-in app CTA clicks',
        'Attributed reader-days',
        'Unattributed reader-days',
      ],
      funnel.rows.map((row) => {
        const coverage = getDiscoveryCoverageState(funnel.period, row.coverageStart);
        const selectedRangeCovered = coverage !== 'none' && coverage !== 'not-covered';
        const hasSelectedCoverage = selectedRangeCovered && row.hasSelectedMetrics;
        const coverageLabel = coverage === 'none'
          ? 'No stored coverage'
          : coverage === 'not-covered'
            ? 'Outside selected range'
            : coverage === 'partial'
              ? row.hasSelectedMetrics ? 'Partial' : 'Partial; no stored daily metric rows in selected range'
              : row.hasSelectedMetrics ? 'Available' : 'No stored daily metric rows in selected range';
        return [
          row.title,
          row.author,
          coverageLabel,
          row.coverageStart ?? '',
          row.coverageEnd ?? '',
          hasSelectedCoverage ? row.anonymousDetailViews : '—',
          hasSelectedCoverage ? row.anonymousAppCtaClicks : '—',
          hasSelectedCoverage ? row.signedInDetailViews : '—',
          hasSelectedCoverage ? row.signedInAppCtaClicks : '—',
          hasSelectedCoverage ? row.attributedReaderDays : '—',
          hasSelectedCoverage ? row.unattributedReaderDays : '—',
        ];
      }),
    );
    const csv = `${metadata}\r\n${table.replace(/^\uFEFF/, '')}`;
    return new Response(csv, {
      headers: csvResponseHeaders(`bukoo-discovery-funnel-${periodTag}.csv`),
    });
  }

  const overview = await getPublisherDashboardOverview(publisher.id, publisher.name ?? null, {
    period: url.searchParams.get('period'),
    from: url.searchParams.get('from'),
    to: url.searchParams.get('to'),
  });

  const periodTag = overview.period.key === 'custom' ? 'custom' : overview.period.start ?? 'all';
  let csv: string;
  if (kind === 'payouts') {
    csv = toCsv(
      ['Tanggal', 'Status', 'Jumlah', 'Mata Uang', 'Referensi'],
      overview.payouts.map((p) => [
        new Date(p.createdAt).toISOString().slice(0, 10),
        p.status,
        p.amount,
        p.currency,
        p.externalRef ?? '',
      ]),
    );
  } else if (kind === 'top-books') {
    csv = toCsv(
      ['Judul', 'Penulis', 'Pembacaan (kumulatif)', 'Waktu Baca (menit)', 'Selesai Baca'],
      overview.topBooks.map((b) => [
        b.title,
        b.author,
        b.readCount,
        Math.round(b.readSeconds / 60),
        b.completedReads,
      ]),
    );
  } else {
    const metadata = toCsv(
      ['Metadata laporan', 'Nilai'],
      [
        ['Rentang waktu', overview.period.label],
        ['Tanggal mulai inklusif (UTC)', overview.period.start ?? 'Tanpa batas awal'],
        ['Tanggal akhir eksklusif (UTC)', overview.period.endExclusive ?? 'Tanpa batas akhir'],
        ['Definisi pembacaan periode', 'Jumlah mulai baca sekali per pembaca, buku, dan hari; bukan jumlah sesi.'],
        ['Definisi waktu baca periode', 'Jumlah detik waktu baca agregat pada tanggal di rentang terpilih.'],
        ['Definisi selesai baca periode', 'Dihitung saat progres baca mencapai 100%.'],
        ['Definisi pembacaan kumulatif', 'Total read count buku sepanjang waktu; tidak dibatasi rentang terpilih.'],
        ['Data baca terakhir tersimpan (UTC)', overview.readingDataThrough ?? 'Belum tersedia pada rentang ini'],
      ],
    );
    const table = toCsv(
      ['Judul', 'Penulis', 'Tier', 'Status', 'Pembacaan Periode', 'Waktu Baca Periode (menit)', 'Selesai Baca Periode', 'Pembacaan Kumulatif'],
      overview.bookStats.map((b) => [
        b.title,
        b.author,
        b.subscriptionRequired,
        b.isPublished ? 'Aktif' : 'Belum aktif',
        b.reads,
        Math.round(b.seconds / 60),
        b.completions,
        b.lifetimeReads,
      ]),
    );
    csv = `${metadata}\r\n${table.replace(/^\uFEFF/, '')}`;
  }

  return new Response(csv, { headers: csvResponseHeaders(`bukoo-${kind}-${periodTag}.csv`) });
}
