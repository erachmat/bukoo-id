"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { DashboardShell } from "../(protected)/dashboard-shell";
import type { PublisherDashboardOverview, RhythmPoint } from "./queries";
import { CatalogTable, type PublisherCatalogBook } from "../catalog-table";
import { countryLabel, getDominantAgeGroup, getPeakBucket } from "./metrics";
import { getCoverUrl } from "@/lib/cover-url";

interface DashboardClientProps {
  user: { name?: string | null; email?: string | null } | null;
  overview?: PublisherDashboardOverview;
  catalog?: PublisherCatalogBook[];
  tab: string;
}

// ── page: overview ────────────────────────────────────────────
type Overview = PublisherDashboardOverview;

const CHART_COLORS = ['var(--pds-teal)', 'var(--pds-sky)', 'var(--pds-amber)', 'var(--pds-coral)', 'var(--pds-lavender)', 'rgba(255,255,255,0.28)'];
const fmtId = new Intl.NumberFormat('id-ID');

function PageOverview({ onTabChange, overview }: { onTabChange: (t: string) => void; overview?: Overview }) {
  const fmtRp = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
  const period = overview?.period;
  const currentReads = overview?.totalReadStarts ?? overview?.dailyTrend.reduce((sum, point) => sum + point.reads, 0) ?? 0;
  const completionRate = currentReads > 0 ? (overview?.totalCompletions ?? 0) / currentReads * 100 : 0;
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
  const monthlyReads = overview?.monthlyReadTrend ?? [];
  const monthValue = monthlyReads[monthlyReads.length - 1]?.bucket ?? period?.start?.slice(0, 7) ?? new Date().toISOString().slice(0, 7);
  const currentDate = new Date();
  const maxSelectableMonth = Number(monthValue.slice(0, 4)) === currentDate.getFullYear() ? currentDate.getMonth() + 1 : 12;
  const maxMonthlyReads = Math.max(...monthlyReads.map((point) => point.reads), 1);
  const bookStats = [...(overview?.bookStats ?? [])];
  const topBooks = bookStats.filter((book) => book.isPublished).sort((a, b) => b.reads - a.reads).slice(0, 5);
  const allGenres = [...(overview?.genreSplit ?? [])].sort((a, b) => b.readerDays - a.readerDays);
  const genreCount = allGenres.length;
  const genres = allGenres.length > 5
    ? [...allGenres.slice(0, 4), { genre: 'Lainnya', readerDays: allGenres.slice(4).reduce((sum, item) => sum + item.readerDays, 0) }]
    : allGenres;
  const genreTotal = genres.reduce((sum, item) => sum + item.readerDays, 0);
  const genreColors = ['#B58418', '#2F9F7B', '#173F32', '#6BA5DE', '#D2D0CA'];
  const genreStops: string[] = [];
  let genreOffset = 0;
  genres.forEach((genre, index) => {
    const end = genreOffset + (genreTotal ? genre.readerDays / genreTotal * 100 : 0);
    genreStops.push(`${genreColors[index]} ${genreOffset}% ${end}%`);
    genreOffset = end;
  });
  const ages = overview?.demographics?.ageGroups ?? [];
  const known = overview?.demographics?.knownCount ?? 0;
  const ageKnown = ages.reduce((sum, age) => sum + age.count, 0);
  const femaleReaders = overview?.demographics?.gender.female ?? 0;
  const maleReaders = overview?.demographics?.gender.male ?? 0;
  const genderKnown = femaleReaders + maleReaders;
  const cities = (overview?.cities ?? []).filter((city) => city.city !== 'Lainnya').slice(0, 6);
  const maxCityReaders = Math.max(...cities.map((city) => city.readers), 1);
  const royaltyBooks = bookStats.filter((book) => book.isPublished).sort((a, b) => b.estimatedRoyalty - a.estimatedRoyalty).slice(0, 8);

  const comparisonLabel = (current: number, previous: number, hasData: boolean) => {
    if (!hasData) return <span className="pds-delta is-new">Baru</span>;
    if (previous === 0) return <span className="pds-delta is-new">Baru</span>;
    const delta = ((current - previous) / previous) * 100;
    return <span className={`pds-delta ${delta < 0 ? 'is-down' : 'is-up'}`}>{delta >= 0 ? '▲' : '▼'} {Math.abs(delta).toLocaleString('id-ID', { maximumFractionDigits: 1 })}% vs bulan lalu</span>;
  };
  const selectMonth = (value: string) => {
    const [year, month] = value.split('-').map(Number);
    const end = new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);
    window.location.assign(`/publisher/dashboard?period=custom&from=${value}-01&to=${end}`);
  };
  const reportEnd = new Date(Date.UTC(Number(monthValue.slice(0, 4)), Number(monthValue.slice(5, 7)), 0)).toISOString().slice(0, 10);
  const reportUrl = `/publisher/dashboard/export?kind=book-stats&period=custom&from=${monthValue}-01&to=${reportEnd}`;

  return (
    <div className="pds-overview pds-figma-overview">
      <section className="pds-overview-head">
        <div className="pds-welcome">
          <h1>Selamat datang, {overview?.publisherName || 'Mitra Penerbit'}</h1>
          <p>Data terupdate: {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })} · Periode {period?.label ?? 'bulan ini'}</p>
        </div>
        <div className="pds-head-actions">
          <label className="pds-month-picker">
            <select aria-label="Pilih bulan laporan" value={monthValue} onChange={(event) => selectMonth(event.currentTarget.value)}>
              {Array.from({ length: maxSelectableMonth }, (_, index) => {
                const value = `${monthValue.slice(0, 4)}-${String(index + 1).padStart(2, '0')}`;
                return <option value={value} key={value}>{monthNames[index]}</option>;
              })}
            </select>
            <span aria-hidden="true">⌄</span>
          </label>
          <Link href={reportUrl} className="pds-btn pds-report-btn"><span aria-hidden="true">▣</span> Unduh Laporan</Link>
          <Link href="/publisher/books/new" className="pds-btn pds-upload-btn"><span aria-hidden="true">＋</span> Upload Buku</Link>
        </div>
      </section>

      <section className="pds-kpi-row pds-figma-kpis" aria-label="Ringkasan performa">
        <article className="pds-kpi pds-kpi-white amber"><div className="pds-kpi-label">Total Pembaca Bulan ini</div><div className="pds-kpi-num">{fmtId.format(overview?.totalDistinctReaders ?? 0)}</div>{comparisonLabel(overview?.totalDistinctReaders ?? 0, overview?.comparison.readers.previous ?? 0, overview?.comparison.readers.hasData ?? false)}</article>
        <article className="pds-kpi pds-kpi-white gold"><div className="pds-kpi-label">Pendapatan Royalti ({monthNames[Number(monthValue.slice(5, 7)) - 1]})</div><div className="pds-kpi-num">{overview?.royaltyEstimate ? fmtRp.format(overview.royaltyEstimate) : '—'}</div>{comparisonLabel(overview?.royaltyEstimate ?? 0, overview?.comparison.royalty.previous ?? 0, overview?.comparison.royalty.hasData ?? false)}</article>
        <article className="pds-kpi pds-kpi-white coral"><div className="pds-kpi-label">Tingkat Selesai Baca</div><div className="pds-kpi-num">{completionRate.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%</div>{comparisonLabel(completionRate, (overview?.comparison.reads.previous ?? 0) > 0 ? ((overview?.comparison.completions.previous ?? 0) / (overview?.comparison.reads.previous ?? 1)) * 100 : 0, (overview?.comparison.reads.hasData ?? false) && (overview?.comparison.completions.hasData ?? false))}</article>
        <article className="pds-kpi pds-kpi-white blue"><div className="pds-kpi-label">Judul Aktif di platform</div><div className="pds-kpi-num">{fmtId.format(overview?.publishedBooks ?? 0)}</div><span className="pds-delta is-up">↑ Judul terbit</span></article>
      </section>

      <section className="pds-figma-grid pds-figma-row-main">
        <article className="pds-panel pds-figma-card pds-month-chart">
          <header className="pds-figma-card-head"><h2><span className="pds-card-icon">▥</span> Tren Pembacaan Bulanan (Total Buku Dibaca)</h2><span>{monthlyReads[0]?.bucket.slice(0, 4) ?? monthValue.slice(0, 4)} – {monthNames[Number(monthValue.slice(5, 7)) - 1]} {monthValue.slice(0, 4)}</span></header>
          {monthlyReads.length === 0 ? <div className="pds-empty">Belum ada data pembacaan.</div> : <div className="pds-month-bars">
            {monthlyReads.map((point, index) => {
              const month = Number(point.bucket.slice(5, 7)) - 1;
              const height = point.reads > 0 ? Math.max(5, point.reads / maxMonthlyReads * 100) : 0;
              return <div className="pds-month-bar-col" key={point.bucket} title={`${monthNames[month]} ${point.bucket.slice(0, 4)}: ${fmtId.format(point.reads)} dibaca`}>
                <span className="pds-month-value">{point.reads > 999 ? `${Math.round(point.reads / 1000)}k` : fmtId.format(point.reads)}</span>
                <div className="pds-month-bar-track"><span className={index === monthlyReads.length - 1 ? 'is-current' : ''} style={{ height: `${height}%` }} /></div>
                <span className="pds-month-label">{monthNames[month]}</span>
              </div>;
            })}
          </div>}
          <footer className="pds-chart-legend"><span><i /> Total Pembaca Bulan ini</span><span>YTD: {fmtId.format(monthlyReads.reduce((sum, point) => sum + point.reads, 0))} pembacaan total</span></footer>
        </article>
        <article className="pds-panel pds-figma-card pds-top-books">
          <header className="pds-figma-card-head"><h2><span className="pds-card-icon">♙</span> Top Buku Bulan Ini</h2><button type="button" onClick={() => onTabChange('performa')}>Detail</button></header>
          {topBooks.length === 0 ? <div className="pds-empty">Belum ada data pembacaan.</div> : <ol className="pds-top-book-list">
            {topBooks.map((book, index) => <li key={book.id}>
              <span className="pds-top-book-rank">{index + 1}</span>
              <span className="pds-book-cover" aria-hidden="true">{book.coverKey ? <Image src={getCoverUrl(book.coverKey)} alt="" width={30} height={38} unoptimized /> : <span>▤</span>}</span>
              <span className="pds-top-book-info"><strong title={book.title}>{book.title}</strong><small>{book.author}</small></span>
              <span className="pds-top-book-count"><strong>{fmtId.format(book.reads)}</strong><small>Pembacaan</small></span>
            </li>)}
          </ol>}
        </article>
      </section>

      <section className="pds-figma-grid pds-figma-row-demographics">
        <article className="pds-panel pds-figma-card pds-genre-card">
          <header className="pds-figma-card-head"><h2><span className="pds-card-icon">◇</span> Distribusi Genre</h2><button type="button" onClick={() => onTabChange('demografi')}>Detail</button></header>
          {genres.length === 0 ? <div className="pds-empty">Belum ada data genre.</div> : <>
            <div className="pds-donut" style={{ background: `conic-gradient(${genreStops.length ? genreStops.join(', ') : '#e5e5e5 0 100%'})` }}><span><strong>{fmtId.format(genreCount)}</strong><small>Genre</small></span></div>
            <ul className="pds-genre-legend">{genres.map((genre, index) => <li key={genre.genre}><i style={{ background: genreColors[index] }} /><span>{genre.genre}</span><strong>{genreTotal ? Math.round(genre.readerDays / genreTotal * 100) : 0}%</strong></li>)}</ul>
          </>}
        </article>
        <article className="pds-panel pds-figma-card pds-city-card">
          <header className="pds-figma-card-head"><h2><span className="pds-card-icon">♧</span> Sebaran Pembaca (Kota)</h2><button type="button" onClick={() => onTabChange('geo')}>Detail</button></header>
          {cities.length === 0 ? <div className="pds-empty">Belum ada data kota.</div> : <div className="pds-city-list">{cities.map((city, index) => <div className="pds-city-row" key={city.city}>
            <span>{city.city}</span><div><i style={{ width: `${Math.max(4, city.readers / maxCityReaders * 100)}%`, background: genreColors[index % genreColors.length] }} /></div><strong>{city.readers.toLocaleString('id-ID', { notation: 'compact', maximumFractionDigits: 1 })}</strong>
          </div>)}</div>}
        </article>
        <article className="pds-panel pds-figma-card pds-demographic-card">
          <header className="pds-figma-card-head"><h2><span className="pds-card-icon">♧</span> Demografi Pembaca</h2><button type="button" onClick={() => onTabChange('demografi')}>Detail</button></header>
          {known === 0 ? <div className="pds-empty">Belum ada data demografi.</div> : <>
            <div className="pds-age-list">{ages.filter((age) => age.count > 0).map((age, index) => <div className="pds-age-row" key={age.label}>
              <span>{age.label} th</span><div><i style={{ width: `${ageKnown ? age.count / ageKnown * 100 : 0}%`, background: genreColors[index % genreColors.length] }} /></div><strong>{Math.round(ageKnown ? age.count / ageKnown * 100 : 0)}%</strong>
            </div>)}</div>
            <div className="pds-gender-list"><span>Perempuan <strong>{genderKnown ? (femaleReaders / genderKnown * 100).toFixed(1) : '0.0'}%</strong></span><span>Laki-laki <strong>{genderKnown ? (maleReaders / genderKnown * 100).toFixed(1) : '0.0'}%</strong></span></div>
          </>}
        </article>
      </section>

      <article className="pds-panel pds-figma-card pds-royalty-table-card">
        <header className="pds-figma-card-head"><h2><span className="pds-card-icon">♧</span> Rincian Pendapatan Royalti — Top 8 Buku</h2><button type="button" onClick={() => onTabChange('royalti')}>Selengkapnya</button></header>
        <div className="pds-figma-table-wrap"><table className="pds-figma-table"><thead><tr><th>No.</th><th>Judul</th><th className="align-right">Dibaca</th><th className="align-right">Royalti</th><th className="align-right">Tren</th></tr></thead><tbody>
          {royaltyBooks.length === 0 ? <tr><td colSpan={5} className="pds-table-empty">Belum ada data royalti untuk periode ini.</td></tr> : royaltyBooks.map((book, index) => {
            const hasTrend = book.hasPreviousReads && book.previousReads > 0;
            const trend = hasTrend ? (book.reads - book.previousReads) / book.previousReads * 100 : 0;
            return <tr key={book.id}><td>{index + 1}.</td><td><strong>{book.title}</strong><small>{book.author}</small></td><td className="align-right">{fmtId.format(book.reads)}</td><td className="align-right"><strong>{book.estimatedRoyalty > 0 ? fmtRp.format(book.estimatedRoyalty) : '—'}</strong></td><td className={`align-right ${!hasTrend ? '' : trend >= 0 ? 'trend-up' : 'trend-down'}`}>{hasTrend ? `${trend >= 0 ? '▲' : '▼'} ${Math.abs(trend).toFixed(1)}%` : '—'}</td></tr>;
          })}
        </tbody><tfoot><tr><th colSpan={2}>TOTAL ROYALTI BULAN INI</th><th className="align-right">{fmtId.format(currentReads)}<small>Total Pembacaan</small></th><th className="align-right">{overview?.royaltyEstimate ? fmtRp.format(overview.royaltyEstimate) : '—'}</th><th className="align-right">{overview?.comparison.royalty.hasData && overview.comparison.royalty.previous > 0 ? `▲ ${(((overview.royaltyEstimate - overview.comparison.royalty.previous) / overview.comparison.royalty.previous) * 100).toFixed(1)}% vs bulan lalu` : '—'}</th></tr></tfoot></table></div>
      </article>
    </div>
  );
}

// ── page: katalog (tab view) ──────────────────────────────────
function PageKatalog({ catalog }: { catalog: PublisherCatalogBook[] }) {
  const statusCounts = {
    all: catalog.length,
    published: catalog.filter((b) => b.isPublished).length,
    review: catalog.filter((b) => b.publicationStatus === 'IN_REVIEW').length,
    draft: catalog.filter((b) => b.publicationStatus === 'DRAFT').length,
  };
  return (
    <>
      <div className="pds-page-head">
        <div>
          <div className="pds-page-title">Katalog Buku</div>
          <div className="pds-page-sub">Kelola judul, status, dan berkas dari halaman katalog.</div>
        </div>
        <div className="pds-head-actions">
          <a href="/publisher/books/new" className="pds-btn pds-btn-primary">+ Upload Buku Baru</a>
        </div>
      </div>
      <div className="pds-flex-chips pds-mb14">
        <span className="pds-chip pds-chip-live"><span className="pds-dotk" />Aktif · {statusCounts.published}</span>
        <span className="pds-chip pds-chip-review"><span className="pds-dotk" />Review · {statusCounts.review}</span>
        <span className="pds-chip pds-chip-draft"><span className="pds-dotk" />Draft · {statusCounts.draft}</span>
        <span className="pds-chip pds-chip-draft"><span className="pds-dotk" />Total · {statusCounts.all}</span>
      </div>
      <CatalogTable books={catalog} />
    </>
  );
}

// ── page: royalti ─────────────────────────────────────────────
function PageRoyalti({ overview }: { overview?: PublisherDashboardOverview }) {
  const fmtRp = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
  const estimate = overview?.royaltyEstimate ?? 0;
  const stats = (overview?.bookStats ?? []).filter((b) => b.isPublished && b.seconds > 0).sort((a, b) => b.seconds - a.seconds);

  return (
    <>
      <div className="pds-page-head">
        <div><div className="pds-page-title">Royalti</div><div className="pds-page-sub">Estimasi berbasis data baca · {overview?.period.label ?? 'Bulan ini'} · nilai final dihitung dari settlement resmi</div></div>
        <div className="pds-head-actions">
          <a className="pds-btn pds-btn-ghost" href={`/publisher/dashboard/export?kind=book-stats&period=${overview?.period.key ?? 'this_month'}`}>Unduh CSV</a>
        </div>
      </div>
      <div className="pds-kpi-row pds-royalty-kpis">
        <div className="pds-kpi amber"><div className="pds-kpi-label">Estimasi Royalti ({overview?.period.label ?? 'Periode'})</div><div className="pds-kpi-num">{estimate > 0 ? fmtRp.format(estimate) : 'Belum tersedia'}</div><div className="pds-kpi-chg pds-flat">estimasi · pool diatur admin</div></div>
        <div className="pds-kpi teal"><div className="pds-kpi-label">Total Pembacaan</div><div className="pds-kpi-num">{(overview?.totalLifetimeReads ?? 0).toLocaleString('id-ID')}</div><div className="pds-kpi-chg pds-flat">pembacaan kumulatif</div></div>
        <div className="pds-kpi sky"><div className="pds-kpi-label">Total Waktu Baca</div><div className="pds-kpi-num">{Math.round((overview?.totalReadingSeconds ?? 0) / 3600).toLocaleString('id-ID')} jam</div><div className="pds-kpi-chg pds-flat">periode terpilih</div></div>
      </div>
      <div className="pds-grid pds-mb14 pds-royalty-grid">
        <div className="pds-panel">
          <div className="pds-panel-title">Estimasi Royalti per Judul<span className="tag">proporsional dari waktu baca</span></div>
          <div className="pds-tbl-scroll">
            <table className="pds-tbl">
              <thead><tr><th>Judul</th><th className="r">Pembacaan</th><th className="r">Waktu Baca</th><th className="r">Selesai</th><th className="r">Estimasi Royalti</th></tr></thead>
              <tbody>
                {stats.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: "40px 16px", textAlign: "center", color: "var(--pds-muted)", fontSize: 12 }}>
                    Belum ada data pembacaan untuk diestimasi.
                  </td></tr>
                ) : stats.map((b) => {
                  const amount = b.estimatedRoyalty;
                  return (
                    <tr key={b.id}>
                      <td className="t-main">{b.title}</td>
                      <td className="r num">{b.reads.toLocaleString('id-ID')}</td>
                      <td className="r num">{Math.round(b.seconds / 3600).toLocaleString('id-ID')} jam</td>
                      <td className="r num">{b.completions.toLocaleString('id-ID')}</td>
                      <td className="r num" style={{ color: 'var(--pds-amber-lt)' }}>{amount > 0 ? fmtRp.format(amount) : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className="pds-panel">
          <div className="pds-panel-title">Cara Estimasi Dihitung</div>
          <div style={{ background: 'rgba(201,149,42,0.05)', border: '1px solid rgba(201,149,42,0.16)', borderRadius: 10, padding: 14, fontSize: 10.5, color: 'var(--pds-dim2)', lineHeight: 1.8 }}>
            <div><b style={{ color: '#fff' }}>Royalti estimasi</b> = bagian waktu baca judul dari total waktu baca bulanan platform × pool bulanan × rate penerbit</div>
            <div style={{ borderTop: '1px solid var(--pds-border-soft)', margin: '8px 0', paddingTop: 8, color: 'var(--pds-muted)' }}>
              Estimasi dihitung per bulan; rentang parsial menggunakan prorata hari. Judul yang belum tayang tidak ikut dihitung. Pool royalti & rate (bps) diatur admin platform. Perhitungan final mengikuti settlement resmi & kontrak — bukan angka pencairan.
            </div>
          </div>
        </div>
      </div>
      <div className="pds-panel">
        <div className="pds-panel-title">Riwayat settlement <span className="tag">ledger manual · bukan transfer langsung</span></div>
        <div className="pds-tbl-scroll"><table className="pds-tbl"><thead><tr><th>Tanggal</th><th>Status</th><th className="r">Jumlah</th><th>Referensi</th></tr></thead><tbody>{(overview?.payouts ?? []).length === 0 ? <tr><td colSpan={4} style={{ padding: 36, textAlign: 'center', color: 'var(--pds-muted)' }}>Belum ada settlement.</td></tr> : overview!.payouts.map((payout) => <tr key={payout.id}><td>{new Date(payout.createdAt).toLocaleDateString('id-ID')}</td><td>{payout.status}</td><td className="r num">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: payout.currency, maximumFractionDigits: 0 }).format(payout.amount)}</td><td>{payout.externalRef || '—'}</td></tr>)}</tbody></table></div>
      </div>
    </>
  );
}

function PagePerforma({ overview, catalog }: { overview?: Overview; catalog: PublisherCatalogBook[] }) {
  const stats = (overview?.bookStats ?? []).slice().sort((a, b) => b.reads - a.reads || b.lifetimeReads - a.lifetimeReads);
  return <>
    <div className="pds-page-head"><div><div className="pds-page-title">Performa Buku</div><div className="pds-page-sub">Pembacaan, waktu baca & penyelesaian per judul · {overview?.period.label ?? 'periode terpilih'}</div></div>
      <div className="pds-head-actions"><a className="pds-btn pds-btn-ghost" href={`/publisher/dashboard/export?kind=book-stats&period=${overview?.period.key ?? 'this_month'}`}>Unduh CSV</a></div>
    </div>
    <div className="pds-panel">
      <div className="pds-tbl-scroll">
        <table className="pds-tbl">
          <thead><tr><th>Judul</th><th>Tier</th><th className="r">Pembacaan (periode)</th><th className="r">Waktu Baca</th><th className="r">Selesai</th><th className="r">Kumulatif</th><th className="c">Status</th><th className="c">Aksi</th></tr></thead>
          <tbody>
            {stats.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: 'var(--pds-muted)' }}>Belum ada data pembacaan periode ini. {catalog.length === 0 ? 'Unggah buku pertama Anda.' : ''}</td></tr>
            ) : stats.map((b) => {
              const completionPct = b.reads > 0 ? Math.round((b.completions / b.reads) * 100) : 0;
              return (
                <tr key={b.id}>
                  <td className="t-main">{b.title}</td>
                  <td>{b.subscriptionRequired}</td>
                  <td className="r num" style={{ color: 'var(--pds-teal)' }}>{b.reads.toLocaleString('id-ID')}</td>
                  <td className="r num">{Math.round(b.seconds / 3600).toLocaleString('id-ID')} jam</td>
                  <td className="r num" style={{ color: completionPct >= 50 ? 'var(--pds-teal)' : 'var(--pds-amber-lt)' }}>{completionPct}%</td>
                  <td className="r num">{b.lifetimeReads.toLocaleString('id-ID')}</td>
                  <td className="c"><span className={`pds-chip ${b.isPublished ? 'pds-chip-live' : 'pds-chip-draft'}`}><span className="pds-dotk" />{b.isPublished ? 'Aktif' : 'Belum aktif'}</span></td>
                  <td className="c"><Link href={`/publisher/books/${b.id}/analytics`} style={{ color: 'var(--pds-teal)', textDecoration: 'none', fontWeight: 600 }}>Analitik</Link></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  </>;
}

function PageGeo({ overview }: { overview?: Overview }) {
  const geo = overview?.geo ?? [];
  const cities = overview?.cities ?? [];
  const totalGeo = geo.reduce((s, g) => s + g.readerDays, 0) || 1;
  return <>
    <div className="pds-page-head"><div><div className="pds-page-title">Sebaran Geografis</div><div className="pds-page-sub">Negara & kota pembaca · {overview?.period.label ?? 'periode terpilih'} · tanpa IP/alamat</div></div></div>
    <div className="pds-grid pds-mb14 pds-grid-2col">
      <div className="pds-panel">
        <div className="pds-panel-title">Negara<span className="tag">reader-days</span></div>
        {geo.length === 0 ? <div className="pds-empty">Belum ada data geografis.</div> : geo.slice(0, 10).map((row, i) => (
          <div className="pds-geo-row" key={row.countryCode}>
            <div className="pds-geo-label">{countryLabel(row.countryCode)}</div>
            <div className="pds-track" style={{ flex: 1 }}><div className="fill" style={{ width: `${Math.min(100, Math.max((row.readerDays / totalGeo) * 100, 3))}%`, background: CHART_COLORS[i % CHART_COLORS.length] }} /></div>
            <div className="pds-geo-val">{Math.round((row.readerDays / totalGeo) * 100)}%</div>
          </div>
        ))}
        <div className="pds-chart-legend"><div className="pds-leg">% dari total reader-days</div></div>
      </div>
      <div className="pds-panel">
        <div className="pds-panel-title">Kota Pembaca<span className="tag">self-reported · agregat anonim</span></div>
        {cities.length === 0 ? <div className="pds-empty">Belum ada data kota.</div> : cities.slice(0, 10).map((row, i) => (
          <div className="pds-geo-row" key={row.city}>
            <div className="pds-geo-label">{row.city}</div>
            <div className="pds-track" style={{ flex: 1 }}><div className="fill" style={{ width: `${Math.max((row.readers / (cities[0]?.readers || 1)) * 100, 3)}%`, background: CHART_COLORS[i % CHART_COLORS.length] }} /></div>
            <div className="pds-geo-val">{row.readers.toLocaleString('id-ID')}</div>
          </div>
        ))}
        <div className="pds-chart-legend"><div className="pds-leg">jumlah pembaca unik</div></div>
      </div>
    </div>
  </>;
}

function PagePembaca({ overview }: { overview?: Overview }) {
  const loyalty = overview?.readerLoyalty ?? { oneDay: 0, twoToFourDays: 0, fivePlusDays: 0 };
  const funnel = overview?.funnel;
  const opened = funnel?.opened ?? 0;
  const steps = [
    { label: 'Buka buku (read starts)', value: opened, pct: 100, color: 'var(--pds-teal)' },
    ...(funnel?.hasProgressData ? [
      { label: 'Baca ≥ 10%', value: funnel.tenPlus ?? 0, pct: opened > 0 ? ((funnel.tenPlus ?? 0) / opened) * 100 : 0, color: 'rgba(0,201,167,0.65)' },
      { label: 'Baca ≥ 50%', value: funnel.fiftyPlus ?? 0, pct: opened > 0 ? ((funnel.fiftyPlus ?? 0) / opened) * 100 : 0, color: 'rgba(201,149,42,0.65)' },
    ] : []),
    { label: 'Selesai baca', value: funnel?.completed ?? 0, pct: opened > 0 ? ((funnel?.completed ?? 0) / opened) * 100 : 0, color: 'var(--pds-amber)' },
  ];
  return <>
    <div className="pds-page-head"><div><div className="pds-page-title">Pembaca</div><div className="pds-page-sub">Keterlibatan & retensi · {overview?.period.label ?? 'periode terpilih'}</div></div></div>
    <div className="pds-kpi-row">
      <div className="pds-kpi teal"><div className="pds-kpi-label">Pembaca Unik</div><div className="pds-kpi-num">{(overview?.totalDistinctReaders ?? 0).toLocaleString('id-ID')}</div><div className="pds-kpi-chg pds-flat">periode terpilih</div></div>
      <div className="pds-kpi sky"><div className="pds-kpi-label">Baca Selesai</div><div className="pds-kpi-num">{(overview?.totalCompletions ?? 0).toLocaleString('id-ID')}</div><div className="pds-kpi-chg pds-flat">{opened > 0 ? `${Math.round(((overview?.totalCompletions ?? 0) / opened) * 100)}% dari sesi` : '—'}</div></div>
      <div className="pds-kpi amber"><div className="pds-kpi-label">Pembaca Setia (5+ hari)</div><div className="pds-kpi-num">{loyalty.fivePlusDays.toLocaleString('id-ID')}</div><div className="pds-kpi-chg pds-flat">hari baca berbeda</div></div>
      <div className="pds-kpi coral"><div className="pds-kpi-label">Pembaca Sekali</div><div className="pds-kpi-num">{loyalty.oneDay.toLocaleString('id-ID')}</div><div className="pds-kpi-chg pds-flat">peluang retensi</div></div>
    </div>
    <div className="pds-panel pds-mb14">
      <div className="pds-panel-title">Corong Keterlibatan{funnel?.hasProgressData ? <span className="tag">estimasi dari progres baca</span> : <span className="tag">read starts vs completions</span>}</div>
      {opened === 0 ? <div className="pds-empty">Belum ada aktivitas baca pada periode ini.</div> : steps.map((step) => (
        <div key={step.label}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 10, color: 'var(--pds-dim2)' }}>{step.label}</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>{step.value.toLocaleString('id-ID')} · {Math.round(step.pct)}%</span>
          </div>
          <div className="pds-track pds-mb14" style={{ height: 14 }}><div className="fill" style={{ width: `${Math.max(step.pct, 2)}%`, background: step.color }} /></div>
        </div>
      ))}
    </div>
    <div className="pds-panel">
      <div className="pds-panel-title">Retensi pembaca <span className="tag">berdasarkan hari baca berbeda</span></div>
      <div className="pds-kpi-row">
        <div className="pds-kpi teal"><div className="pds-kpi-label">1 hari baca</div><div className="pds-kpi-num">{loyalty.oneDay.toLocaleString('id-ID')}</div></div>
        <div className="pds-kpi sky"><div className="pds-kpi-label">2–4 hari baca</div><div className="pds-kpi-num">{loyalty.twoToFourDays.toLocaleString('id-ID')}</div></div>
        <div className="pds-kpi amber"><div className="pds-kpi-label">5+ hari baca</div><div className="pds-kpi-num">{loyalty.fivePlusDays.toLocaleString('id-ID')}</div></div>
      </div>
    </div>
  </>;
}

// ── page: metadata ────────────────────────────────────────

// ── page: metadata ────────────────────────────────────────────
function PageMetadata({ catalog }: { catalog: PublisherCatalogBook[] }) {
  return (
    <>
      <div className="pds-page-head">
        <div><div className="pds-page-title">Metadata</div><div className="pds-page-sub">Kelengkapan metadata buku Anda</div></div>
      </div>
      <div className="pds-panel">
        <div className="pds-panel-title">Kelengkapan metadata <span className="tag">6 bidang dasar</span></div>
        <div className="pds-tbl-scroll"><table className="pds-tbl"><thead><tr><th>Judul</th><th>Bahasa</th><th>Genre</th><th>Sampul</th><th>Sinopsis</th><th>Halaman</th><th className="r">Skor</th></tr></thead><tbody>
          {catalog.length === 0 ? <tr><td colSpan={7} style={{ padding: 36, textAlign: 'center', color: 'var(--pds-muted)' }}>Belum ada buku.</td></tr> : catalog.map((book) => {
            let genres: string[] = [];
            if (Array.isArray(book.genre)) genres = book.genre;
            else {
              try {
                const parsed = JSON.parse(book.genre || '[]');
                if (Array.isArray(parsed)) genres = parsed;
              } catch {
                genres = [];
              }
            }
            const checks = [Boolean(book.title), Boolean(book.language), genres.length > 0, Boolean(book.coverKey), Boolean(book.synopsis?.trim()), Boolean(book.totalPages && book.totalPages > 0)];
            const score = checks.filter(Boolean).length;
            return <tr key={book.id}><td className="t-main">{book.title}</td>{checks.slice(1, 6).map((complete, index) => <td key={index} style={{ color: complete ? 'var(--pds-teal)' : 'var(--pds-muted)' }}>{complete ? 'Lengkap' : 'Belum diisi'}</td>)}<td className="r num">{score}/6</td></tr>;
          })}
        </tbody></table></div>
      </div>
    </>
  );
}


// ── page: demografi (real data) ─────────────────────────
function PageDemografi({ overview }: { overview?: Overview }) {
  const demo = overview?.demographics;
  const cities = overview?.cities ?? [];
  const geo = overview?.geo ?? [];
  const known = demo?.knownCount ?? 0;
  const gender = demo?.gender ?? { female: 0, male: 0, unknown: 0 };
  const knownGender = gender.female + gender.male;
  const dominantAgeGroup = getDominantAgeGroup(demo?.ageGroups ?? []);
  return (
    <>
      <div className="pds-page-head"><div><div className="pds-page-title">Demografi Pembaca</div><div className="pds-page-sub">Profil agregat & anonim · {overview?.period.label ?? 'periode terpilih'} · {known} pembaca dengan data</div></div></div>
      <div className="pds-kpi-row">
        <div className="pds-kpi teal"><div className="pds-kpi-label">Pembaca Teridentifikasi</div><div className="pds-kpi-num">{known.toLocaleString('id-ID')}</div><div className="pds-kpi-chg pds-flat">dari {(overview?.totalDistinctReaders ?? 0).toLocaleString('id-ID')} pembaca</div></div>
        <div className="pds-kpi amber"><div className="pds-kpi-label">Grup Usia Dominan</div><div className="pds-kpi-num" style={{ fontSize: 22 }}>{dominantAgeGroup ?? '—'}</div><div className="pds-kpi-chg pds-flat">tahun</div></div>
        <div className="pds-kpi sky"><div className="pds-kpi-label">Perempuan</div><div className="pds-kpi-num">{knownGender > 0 ? `${Math.round((gender.female / knownGender) * 100)}%` : '—'}</div><div className="pds-kpi-chg pds-flat">{knownGender > 0 ? `Laki-laki ${Math.round((gender.male / knownGender) * 100)}%` : 'belum ada data'}</div></div>
        <div className="pds-kpi mint"><div className="pds-kpi-label">Kota dengan pembaca terbanyak</div><div className="pds-kpi-num" style={{ fontSize: 22 }}>{cities[0]?.city ?? '—'}</div><div className="pds-kpi-chg pds-flat">{cities[0] ? `${cities[0].readers.toLocaleString('id-ID')} pembaca` : 'belum ada data'}</div></div>
      </div>
      <div className="pds-grid pds-mb14 pds-grid-2col">
        <div className="pds-panel">
          <div className="pds-panel-title">Kelompok Usia<span className="tag">agregat anonim</span></div>
          {!demo || known === 0 ? <div className="pds-empty">Belum ada data demografi pembaca.</div> : demo.ageGroups.filter((a) => a.count > 0).map((a, i) => (
            <div className="pds-demo-row" key={a.label}>
              <div className="pds-demo-lab">{a.label} th</div>
              <div className="pds-track" style={{ flex: 1 }}><div className="fill" style={{ width: `${Math.max((a.count / known) * 100, 3)}%`, background: CHART_COLORS[i % CHART_COLORS.length] }} /></div>
              <div className="pds-demo-pc" style={{ color: CHART_COLORS[i % CHART_COLORS.length] }}>{Math.round((a.count / known) * 100)}%</div>
            </div>
          ))}
        </div>
        <div className="pds-panel">
          <div className="pds-panel-title">Kota Pembaca<span className="tag">self-reported · agregat</span></div>
          {cities.length === 0 ? <div className="pds-empty">Belum ada data kota.</div> : cities.map((c, i) => (
            <div className="pds-geo-row" key={c.city}>
              <div className="pds-geo-label">{c.city}</div>
              <div className="pds-track" style={{ flex: 1 }}><div className="fill" style={{ width: `${Math.max((c.readers / (cities[0]?.readers || 1)) * 100, 3)}%`, background: CHART_COLORS[i % CHART_COLORS.length] }} /></div>
              <div className="pds-geo-val">{c.readers.toLocaleString('id-ID')}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="pds-panel">
        <div className="pds-panel-title">Negara<span className="tag">ISO kode · tanpa IP</span></div>
        {geo.length === 0 ? <div className="pds-empty">Belum ada data negara.</div> : geo.slice(0, 6).map((g, i) => (
          <div className="pds-geo-row" key={g.countryCode}>
            <div className="pds-geo-label">{countryLabel(g.countryCode)}</div>
            <div className="pds-track" style={{ flex: 1 }}><div className="fill" style={{ width: `${Math.max((g.readerDays / (geo[0]?.readerDays || 1)) * 100, 3)}%`, background: CHART_COLORS[i % CHART_COLORS.length] }} /></div>
            <div className="pds-geo-val">{g.readerDays.toLocaleString('id-ID')}</div>
          </div>
        ))}
      </div>
    </>
  );
}

// ── page: waktu baca (real data) ──────────────────────────
const DOW_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

function RhythmBars({ points, highlight }: { points: RhythmPoint[]; highlight?: (b: string) => boolean }) {
  const max = Math.max(...points.map((p) => p.reads), 1);
  return (
    <div className="pds-chart">
      {points.map((p) => (
        <div className="pds-cbar-wrap" key={p.bucket} title={`${p.bucket}: ${fmtId.format(p.reads)} baca`}>
          <div className="pds-cval">{p.reads > 999 ? `${Math.round(p.reads / 100) / 10}k` : p.reads}</div>
          <div className="pds-cbar" style={{ height: `${Math.max(Math.round((p.reads / max) * 100), 3)}%`, background: highlight?.(p.bucket) ? 'var(--pds-teal)' : 'rgba(0,201,167,0.35)' }} />
          <div className="pds-cmon">{p.bucket}</div>
        </div>
      ))}
    </div>
  );
}

function PageWaktu({ overview }: { overview?: Overview }) {
  const hours = overview?.hourRhythm ?? [];
  const dows = overview?.weekdayRhythm ?? [];
  const sortedHours = Array.from({ length: 24 }, (_, h) => ({
    bucket: String(h).padStart(2, '0'),
    reads: hours.find((p) => p.bucket === String(h).padStart(2, '0'))?.reads ?? 0,
  }));
  const sortedDows = ['1', '2', '3', '4', '5', '6', '0'].map((d) => ({
    bucket: DOW_LABELS[Number(d)],
    reads: dows.find((p) => p.bucket === d)?.reads ?? 0,
  }));
  const peakHour = getPeakBucket(sortedHours);
  const peakHourLabel = peakHour && peakHour.reads > 0 ? `${peakHour.bucket}.00` : '—';
  const totals = overview?.dailyTrend?.reduce((acc, p) => ({ reads: acc.reads + p.reads, seconds: acc.seconds + p.seconds }), { reads: 0, seconds: 0 }) ?? { reads: 0, seconds: 0 };
  const avgSession = totals.reads > 0 ? Math.round(totals.seconds / totals.reads / 60) : 0;
  return (
    <>
      <div className="pds-page-head"><div><div className="pds-page-title">Waktu Baca</div><div className="pds-page-sub">Ritme baca pembaca Anda · {overview?.period.label ?? 'periode terpilih'}</div></div></div>
      <div className="pds-kpi-row">
        <div className="pds-kpi teal"><div className="pds-kpi-label">Total Waktu Baca</div><div className="pds-kpi-num">{Math.round(totals.seconds / 3600).toLocaleString('id-ID')} jam</div><div className="pds-kpi-chg pds-flat">periode terpilih</div></div>
        <div className="pds-kpi amber"><div className="pds-kpi-label">Durasi Rata-rata Sesi</div><div className="pds-kpi-num">{avgSession} mnt</div><div className="pds-kpi-chg pds-flat">per read start</div></div>
        <div className="pds-kpi sky"><div className="pds-kpi-label">Jam Puncak</div><div className="pds-kpi-num">{peakHourLabel}</div><div className="pds-kpi-chg pds-flat">waktu lokal pembaca</div></div>
        <div className="pds-kpi mint"><div className="pds-kpi-label">Total Sesi</div><div className="pds-kpi-num">{totals.reads.toLocaleString('id-ID')}</div><div className="pds-kpi-chg pds-flat">read starts</div></div>
      </div>
      <div className="pds-panel pds-mb14">
        <div className="pds-panel-title">Ritme Jam<span className="tag">jam terakhir dibaca (00–23)</span></div>
        {hours.length === 0 ? <div className="pds-empty">Belum ada data ritme jam.</div> : <RhythmBars points={sortedHours} highlight={(b) => b === peakHour?.bucket} />}
      </div>
      <div className="pds-panel">
        <div className="pds-panel-title">Ritme Mingguan<span className="tag">baca per hari</span></div>
        {dows.length === 0 ? <div className="pds-empty">Belum ada data ritme mingguan.</div> : <RhythmBars points={sortedDows} highlight={(b) => b === 'Sab' || b === 'Min'} />}
      </div>
    </>
  );
}

// ── main dashboard client ─────────────────────────────────────
export function DashboardClient({ user, overview, catalog = [], tab }: DashboardClientProps) {
  const router = useRouter();
  const activeTab = tab;
  const onTabChange = (nextTab: string) => {
    const period = overview?.period.key ?? 'this_month';
    const params = new URLSearchParams({ tab: nextTab, period });
    if (period === 'custom' && overview?.period.start && overview.period.endExclusive) {
      const inclusiveEnd = new Date(`${overview.period.endExclusive}T00:00:00.000Z`);
      inclusiveEnd.setUTCDate(inclusiveEnd.getUTCDate() - 1);
      params.set('from', overview.period.start);
      params.set('to', inclusiveEnd.toISOString().slice(0, 10));
    }
    router.push(`/publisher/dashboard?${params.toString()}`);
  };

  const renderPage = () => {
    switch (activeTab) {
      case "overview":   return <PageOverview onTabChange={onTabChange} overview={overview} />;
      case "katalog":    return <PageKatalog catalog={catalog} />;
      case "royalti":    return <PageRoyalti overview={overview} />;
      case "performa":   return <PagePerforma overview={overview} catalog={catalog} />;
      case "pembaca":    return <PagePembaca overview={overview} />;
      case "demografi":  return <PageDemografi overview={overview} />;
      case "geo":        return <PageGeo overview={overview} />;
      case "waktu":      return <PageWaktu overview={overview} />;
      case "metadata":   return <PageMetadata catalog={catalog} />;
      default:           return <PageOverview onTabChange={onTabChange} overview={overview} />;
    }
  };

  return (
    <DashboardShell user={user ?? {}} activeTab={activeTab} onTabChange={onTabChange}>
      {renderPage()}
    </DashboardShell>
  );
}
