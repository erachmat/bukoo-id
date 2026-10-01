import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getLatestMetricDate, getPublisherBookAnalytics, sumPublisherDiscoveryDailyMetrics } from '@/app/publisher/dashboard/queries';
import { DiscoveryFunnelPanel, formatSelectedPeriodBounds, getDashboardPeriodQuery } from '@/app/publisher/dashboard/discovery-funnel-panel';

export const dynamic = 'force-dynamic';

export default async function PublisherBookAnalyticsPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  const user = session?.user;
  if (!user || (user as { role?: string }).role !== 'PUBLISHER') notFound();
  const { id } = await params;
  const query = await searchParams;
  const value = (key: string) => Array.isArray(query[key]) ? query[key][0] : query[key];
  const analytics = await getPublisherBookAnalytics(user.id ?? '', id, {
    period: value('period'), from: value('from'), to: value('to'),
  });
  if (!analytics) notFound();
  const totalSeconds = analytics.daily.reduce((sum, row) => sum + row.seconds, 0);
  const totalStarts = analytics.daily.reduce((sum, row) => sum + row.starts, 0);
  const totalCompletions = analytics.daily.reduce((sum, row) => sum + row.completions, 0);
  const readingDataThrough = getLatestMetricDate(analytics.daily.map((row) => ({ metricDate: row.date })));
  const funnelTotals = sumPublisherDiscoveryDailyMetrics(analytics.discovery.daily);
  const exportParams = new URLSearchParams({ kind: 'discovery-funnel', bookId: id });
  for (const key of ['period', 'from', 'to']) {
    const selected = value(key);
    if (selected) exportParams.set(key, selected);
  }
  return (
    <>
      <div className="pds-page-head">
        <div><div className="pds-page-title">{analytics.book.title}</div><div className="pds-page-sub">Analitik buku · {analytics.period.label}</div></div>
        <Link href="/publisher/books" className="pds-btn">← Kembali ke katalog</Link>
      </div>
      <div className="pds-period-chips">
        {(['this_month', 'last_month', 'all_time'] as const).map((period) => <Link key={period} href={`/publisher/books/${id}/analytics?period=${period}`} className={`pds-period-chip${analytics.period.key === period ? ' active' : ''}`}>{period === 'this_month' ? 'Bulan ini' : period === 'last_month' ? 'Bulan lalu' : 'Semua waktu'}</Link>)}
      </div>
      <p className="pds-metric-context">Rentang aktivitas baca: {formatSelectedPeriodBounds(analytics.period)}. Pembaca unik = akun berbeda; mulai baca = hitungan per pembaca, buku, dan hari (bukan sesi); selesai baca dihitung saat progres mencapai 100%. Data baca terakhir tersimpan: {readingDataThrough ?? 'belum tersedia'}{readingDataThrough ? ' UTC' : ''}.</p>
      <div className="pds-kpi-row">
        <div className="pds-kpi teal"><div className="pds-kpi-label">Pembaca unik</div><div className="pds-kpi-num">{analytics.uniqueReaders.toLocaleString('id-ID')}</div></div>
        <div className="pds-kpi coral"><div className="pds-kpi-label">Waktu baca</div><div className="pds-kpi-num">{Math.round(totalSeconds / 60).toLocaleString('id-ID')} mnt</div></div>
        <div className="pds-kpi sky"><div className="pds-kpi-label">Mulai baca</div><div className="pds-kpi-num">{totalStarts.toLocaleString('id-ID')}</div></div>
        <div className="pds-kpi amber"><div className="pds-kpi-label">Selesai</div><div className="pds-kpi-num">{totalCompletions.toLocaleString('id-ID')}</div></div>
      </div>
      <div className="pds-panel">
        <div className="pds-panel-title">Aktivitas harian</div>
        <div className="pds-tbl-scroll"><table className="pds-tbl"><thead><tr><th>Tanggal</th><th className="r">Mulai</th><th className="r">Waktu baca</th><th className="r">Selesai</th></tr></thead><tbody>{analytics.daily.length === 0 ? <tr><td colSpan={4} style={{ padding: 32, textAlign: 'center', color: 'var(--pds-muted)' }}>Belum ada aktivitas pada periode ini.</td></tr> : analytics.daily.map((row) => <tr key={row.date}><td>{row.date}</td><td className="r num">{row.starts}</td><td className="r num">{Math.round(row.seconds / 60)} mnt</td><td className="r num">{row.completions}</td></tr>)}</tbody></table></div>
      </div>
      <DiscoveryFunnelPanel
        period={analytics.period}
        status={analytics.discovery.status}
        rows={[{
          bookId: analytics.book.id,
          title: analytics.book.title,
          author: analytics.book.author,
          coverageStart: analytics.discovery.coverageStart,
          coverageEnd: analytics.discovery.coverageEnd,
          hasSelectedMetrics: analytics.discovery.daily.length > 0,
          ...funnelTotals,
        }]}
        exportHref={`/publisher/dashboard/export?${exportParams.toString()}`}
        retryHref={`/publisher/books/${id}/analytics?${getDashboardPeriodQuery(analytics.period)}`}
        showBookActions={false}
      />
      <div className="pds-panel" style={{ marginTop: 14 }}><div className="pds-panel-title">Retensi pembaca <span className="tag">reader-days, tanpa data pribadi</span></div><div className="pds-kpi-row"><div><b>{analytics.loyalty.oneDay}</b><br /><span className="t-sub">1 hari baca</span></div><div><b>{analytics.loyalty.twoToFourDays}</b><br /><span className="t-sub">2–4 hari baca</span></div><div><b>{analytics.loyalty.fivePlusDays}</b><br /><span className="t-sub">5+ hari baca</span></div></div></div>
    </>
  );
}
