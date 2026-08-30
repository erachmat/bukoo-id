import { getPublisherUser } from '@/lib/publisher-auth';
import { csvResponseHeaders, toCsv } from '@/lib/csv';
import { getPublisherDashboardOverview } from '../queries';

export const dynamic = 'force-dynamic';

const KINDS = new Set(['book-stats', 'payouts', 'top-books']);

/**
 * Publisher CSV export — mirrors the on-screen period exactly.
 * ?kind=book-stats|payouts|top-books&period=…&from=…&to=…
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
    csv = toCsv(
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
  }

  return new Response(csv, { headers: csvResponseHeaders(`bukoo-${kind}-${periodTag}.csv`) });
}
