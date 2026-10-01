import Link from 'next/link';
import { getDiscoveryCoverageState } from './metrics';
import type { DateRange } from './metrics';
import type { PublisherDiscoveryFunnelExportRow } from './queries';

interface DiscoveryFunnelPanelProps {
  period: DateRange;
  rows: PublisherDiscoveryFunnelExportRow[];
  status: 'ready' | 'error';
  exportHref: string;
  retryHref: string;
  showBookActions?: boolean;
}

export function formatSelectedPeriodBounds(period: DateRange): string {
  if (period.start && period.endExclusive) {
    const endInclusive = new Date(`${period.endExclusive}T00:00:00.000Z`);
    endInclusive.setUTCDate(endInclusive.getUTCDate() - 1);
    return `${period.start} – ${endInclusive.toISOString().slice(0, 10)} UTC`;
  }
  if (period.start) return `Sejak ${period.start} UTC`;
  if (period.endExclusive) return `Sebelum ${period.endExclusive} UTC`;
  return 'Semua data tersimpan (UTC)';
}

function coverageMessage(
  state: ReturnType<typeof getDiscoveryCoverageState>,
  coverageStart: string | null,
): string {
  if (state === 'none') return 'Belum ada coverage funnel tersimpan untuk judul ini.';
  if (state === 'not-covered') return 'Belum tercakup pada rentang ini. Angka disembunyikan agar tidak dianggap nol.';
  if (state === 'partial') {
    return `Cakupan parsial: data funnel buku ini mulai tercatat pada ${coverageStart} UTC; data sebelum tanggal tersebut tidak tersedia.`;
  }
  return `Coverage funnel buku ini dimulai pada ${coverageStart} UTC.`;
}

export function getDashboardPeriodQuery(period: DateRange): string {
  const params = new URLSearchParams({ period: period.key });
  if (period.key === 'custom' && period.start && period.endExclusive) {
    const endInclusive = new Date(`${period.endExclusive}T00:00:00.000Z`);
    endInclusive.setUTCDate(endInclusive.getUTCDate() - 1);
    params.set('from', period.start);
    params.set('to', endInclusive.toISOString().slice(0, 10));
  }
  return params.toString();
}

export function DiscoveryFunnelPanel({
  period,
  rows,
  status,
  exportHref,
  retryHref,
  showBookActions = true,
}: DiscoveryFunnelPanelProps) {
  return (
    <section className="pds-panel pds-discovery-panel" aria-labelledby="discovery-funnel-title">
      <div className="pds-panel-title pds-discovery-panel-title">
        <h2 id="discovery-funnel-title">Funnel penemuan web ke baca</h2>
        <span className="tag">{period.label}</span>
      </div>
      <p className="pds-discovery-period">
        Rentang terpilih: {formatSelectedPeriodBounds(period)}. Setiap judul dan tahap dihitung terpisah; basisnya berbeda, jadi tidak dihitung sebagai conversion rate.
      </p>

      {status === 'error' ? (
        <div className="pds-discovery-state" role="alert">
          <p>Data funnel belum dapat dimuat. Coba muat ulang halaman.</p>
          <Link href={retryHref} className="pds-btn pds-btn-ghost">Coba lagi</Link>
        </div>
      ) : rows.length === 0 ? (
        <div className="pds-discovery-state">
          <p>Belum ada judul di katalog untuk ditampilkan pada funnel.</p>
          <Link href="/publisher/books/new" className="pds-btn pds-btn-ghost">Upload buku</Link>
        </div>
      ) : (
        <div className="pds-discovery-books">
          {rows.map((row) => {
            const coverageState = getDiscoveryCoverageState(period, row.coverageStart);
            const coverageUnavailable = coverageState === 'none' || coverageState === 'not-covered';
            const metricsUnavailable = coverageUnavailable || !row.hasSelectedMetrics;
            const metric = (value: number) => metricsUnavailable ? '—' : value.toLocaleString('id-ID');
            const totals = row.anonymousDetailViews + row.anonymousAppCtaClicks + row.signedInDetailViews
              + row.signedInAppCtaClicks + row.attributedReaderDays + row.unattributedReaderDays;

            return (
              <article className="pds-discovery-book" key={row.bookId}>
                <header className="pds-discovery-book-head">
                  <div>
                    <h3>{row.title}</h3>
                    <p>{row.author}</p>
                  </div>
                  {showBookActions && (
                    <nav className="pds-discovery-actions" aria-label={`Aksi untuk ${row.title}`}>
                      <Link href={`/publisher/books/${row.bookId}/analytics?${getDashboardPeriodQuery(period)}`}>Analitik buku</Link>
                      <Link href={`/publisher/books/${row.bookId}/edit`}>Kelola buku</Link>
                    </nav>
                  )}
                </header>

                <div className="pds-discovery-meta">
                  <span>{coverageMessage(coverageState, row.coverageStart)}</span>
                  <span>Data funnel tercatat sampai {row.coverageEnd ? `${row.coverageEnd} (UTC)` : 'belum tersedia'}.</span>
                </div>

                {!coverageUnavailable && !row.hasSelectedMetrics ? (
                  <p className="pds-discovery-no-activity">
                    Tidak ada baris metrik funnel pada rentang terpilih. Agregat hanya menyimpan hari dengan event; tanpa baris, nol aktivitas tidak dapat dipastikan sehingga angka tidak ditampilkan.
                  </p>
                ) : null}

                {metricsUnavailable ? null : totals === 0 ? (
                  <p className="pds-discovery-no-activity">Belum ada event funnel tercatat pada rentang terpilih.</p>
                ) : null}

                <div className="pds-discovery-stage-grid">
                  <section className="pds-discovery-stage" aria-labelledby={`discovery-views-${row.bookId}`}>
                    <h4 id={`discovery-views-${row.bookId}`}>Tayangan detail web</h4>
                    <p>Jumlah paparan halaman detail buku; bukan pembaca unik.</p>
                    <dl className="pds-discovery-metrics">
                      <div><dt>Anonim</dt><dd>{metric(row.anonymousDetailViews)}</dd></div>
                      <div><dt>Signed-in</dt><dd>{metric(row.signedInDetailViews)}</dd></div>
                    </dl>
                  </section>

                  <section className="pds-discovery-stage" aria-labelledby={`discovery-cta-${row.bookId}`}>
                    <h4 id={`discovery-cta-${row.bookId}`}>Klik CTA aplikasi</h4>
                    <p>Jumlah klik eksplisit ke aplikasi; anonim tetap tidak ditautkan.</p>
                    <dl className="pds-discovery-metrics">
                      <div><dt>Anonim</dt><dd>{metric(row.anonymousAppCtaClicks)}</dd></div>
                      <div><dt>Signed-in</dt><dd>{metric(row.signedInAppCtaClicks)}</dd></div>
                    </dl>
                  </section>

                  <section className="pds-discovery-stage" aria-labelledby={`discovery-reading-${row.bookId}`}>
                    <h4 id={`discovery-reading-${row.bookId}`}>Hari baca mobile</h4>
                    <p>Satu hitungan per pembaca, buku, dan hari; bukan sesi.</p>
                    <dl className="pds-discovery-metrics">
                      <div><dt>Teratribusi</dt><dd>{metric(row.attributedReaderDays)}</dd></div>
                      <div><dt>Tanpa atribusi</dt><dd>{metric(row.unattributedReaderDays)}</dd></div>
                    </dl>
                  </section>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {status === 'ready' && rows.length > 0 && (
        <>
          <p className="pds-discovery-attribution">
            Tanggal agregat hari baca mobile memakai tanggal UTC receipt pertama yang diterima API, bukan tanggal aktual membaca. Hari baca teratribusi hanya jika akun dan buku sama, dengan klik CTA terakhir dalam tujuh hari sebelum receipt pertama `syncBatchId` diterima server. Sync offline dapat menggeser attribution dan tanggal agregat. Sync tanpa `syncBatchId` tidak masuk funnel attribution. Output hanya agregat, tanpa identitas pembaca atau detail event per pembaca.
          </p>
          <Link href={exportHref} className="pds-btn pds-btn-ghost pds-discovery-export">Unduh CSV funnel</Link>
        </>
      )}
    </section>
  );
}
