"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardShell } from "../(protected)/dashboard-shell";
import type { PublisherDashboardOverview, RhythmPoint } from "./queries";
import { CatalogTable, type PublisherCatalogBook } from "../catalog-table";
import { countryLabel, getDominantAgeGroup, getPeakBucket } from "./metrics";

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

/** CSS bar chart from trend points (daily or monthly buckets). */
function RoyaltyTrendChart({ trend }: { trend: Overview['royaltyTrend'] }) {
  if (trend.length === 0) {
    return <div className="pds-empty">Estimasi historis belum tersedia. Pastikan pool royalti platform sudah diatur.</div>;
  }
  const max = Math.max(...trend.map((point) => point.amount), 1);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
  const fmtRp = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
  return (
    <div className="pds-chart">
      {trend.map((point) => {
        const pct = point.amount > 0 ? Math.max(Math.round((point.amount / max) * 100), 4) : 0;
        const month = Number(point.bucket.slice(5, 7)) - 1;
        const label = monthNames[month] ?? point.bucket;
        return (
          <div className="pds-cbar-wrap" key={point.bucket} title={`${point.bucket}: ${fmtRp.format(point.amount)}`}>
            {point.amount > 0 && <div className="pds-cbar" style={{ height: `${pct}%`, background: 'var(--pds-amber)' }} />}
            <div className="pds-cmon">{label}</div>
          </div>
        );
      })}
    </div>
  );
}

function PageOverview({ onTabChange, overview }: { onTabChange: (t: string) => void; overview?: Overview }) {
  const totalReaders = overview?.totalDistinctReaders ?? 0;
  const royalty = overview?.royaltyEstimate ?? 0;
  const fmtRp = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
  const periodLabel = overview?.period.label ?? 'Bulan ini';
  const periodReads = overview?.dailyTrend.reduce((sum, point) => sum + point.reads, 0) ?? 0;
  const activeBooks = overview?.bookStats.filter((book) => book.reads > 0).length ?? 0;
  const activePercent = overview?.totalBooks ? Math.round((activeBooks / overview.totalBooks) * 100) : 0;
  const topBooks = (overview?.topBooks ?? []).slice(0, 5);
  const maxReads = Math.max(...topBooks.map((book) => book.readCount), 1);
  const genres = [...(overview?.genreSplit ?? [])].sort((a, b) => b.readerDays - a.readerDays).slice(0, 6);
  const totalGenreDays = genres.reduce((sum, genre) => sum + genre.readerDays, 0);
  const payouts = (overview?.payouts ?? []).slice(0, 4);

  return (
    <div className="pds-overview">
      <section className="pds-overview-hero">
        <div className="pds-overview-hero-head">
          <div className="pds-overview-eyebrow">Publisher dashboard · {overview?.publisherName || 'Mitra Penerbit'}</div>
          <label className="pds-overview-period">
            <span>Periode</span>
            <select
              aria-label="Pilih periode dashboard"
              value={overview?.period.key ?? 'this_month'}
              onChange={(event) => window.location.assign(`/publisher/dashboard?period=${event.currentTarget.value}`)}
            >
              <option value="this_month">Bulan ini</option>
              <option value="last_month">Bulan lalu</option>
              <option value="this_quarter">Kuartal ini</option>
              <option value="ytd">YTD</option>
              <option value="all_time">Semua waktu</option>
            </select>
          </label>
        </div>
        <h1>Lihat <em>bagaimana</em><br />pembaca membaca Anda</h1>
        <p>Penjualan fisik hanya memberi tahu apa yang terjual. Dashboard penerbit BUKOO memberi tahu apa yang benar-benar <strong>dibaca, dituntaskan, dan diminati</strong> — insight yang membantu Anda mengambil keputusan bisnis.</p>
      </section>

      <div className="pds-kpi-row">
        <div className="pds-kpi amber">
          <div className="pds-kpi-label">Estimasi royalti</div>
          <div className="pds-kpi-num">{royalty > 0 ? fmtRp.format(royalty) : '—'}</div>
          <div className="pds-kpi-chg pds-flat">periode {periodLabel.toLowerCase()}</div>
        </div>
        <div className="pds-kpi teal">
          <div className="pds-kpi-label">Total sesi baca</div>
          <div className="pds-kpi-num">{fmtId.format(periodReads)}<small> / {fmtId.format(overview?.totalLifetimeReads ?? 0)}</small></div>
          <div className="pds-kpi-chg pds-flat">periode {periodLabel.toLowerCase()} / kumulatif</div>
        </div>
        <div className="pds-kpi sky">
          <div className="pds-kpi-label">Judul aktif dibaca</div>
          <div className="pds-kpi-num">{activeBooks}<small> / {overview?.totalBooks ?? 0}</small></div>
          <div className="pds-kpi-chg pds-flat">{activePercent}% katalog aktif · {totalReaders.toLocaleString('id-ID')} pembaca</div>
        </div>
        <div className="pds-kpi coral">
          <div className="pds-kpi-label">Transfer berikutnya</div>
          <div className="pds-kpi-num">Tgl 5</div>
          <div className="pds-kpi-chg pds-flat">Est. {fmtRp.format(royalty)} · tiap tgl 5</div>
        </div>
      </div>

      <div className="pds-grid pds-mb14 pds-overview-split">
        <div className="pds-panel">
          <div className="pds-panel-title">Judul paling banyak dibaca<span className="tag">5 teratas · {periodLabel}</span></div>
          {topBooks.length === 0 ? <div className="pds-empty">Belum ada data pembacaan pada katalog Anda.</div> : (
            <div className="pds-overview-books">
              {topBooks.map((book, index) => (
                <div className="pds-overview-book" key={book.id}>
                  <span className="pds-overview-book-title" title={book.title}>{book.title}</span>
                  <span className="pds-overview-book-track"><span style={{ width: `${Math.max(3, (book.readCount / maxReads) * 100)}%`, background: CHART_COLORS[index % CHART_COLORS.length] }} /></span>
                  <span className="pds-overview-book-count">{fmtId.format(book.readCount)}</span>
                </div>
              ))}
            </div>
          )}
          <button className="pds-overview-link" onClick={() => onTabChange('performa')}>Lihat semua performa</button>
        </div>
        <div className="pds-panel">
          <div className="pds-panel-title">Genre yang diminati<span className="tag">minat pembaca</span></div>
          {genres.length === 0 ? <div className="pds-empty">Belum ada data genre. Lengkapi metadata judul.</div> : (
            <div className="pds-overview-genres">
              {genres.map((genre, index) => {
                const share = totalGenreDays > 0 ? (genre.readerDays / totalGenreDays) * 100 : 0;
                return <div className="pds-overview-genre" key={genre.genre}>
                  <span className="pds-overview-genre-name" title={genre.genre}>{genre.genre}</span>
                  <span className="pds-overview-genre-share" style={{ color: CHART_COLORS[index % CHART_COLORS.length] }}>{fmtId.format(genre.readerDays)} hari · {Math.round(share)}%</span>
                </div>;
              })}
            </div>
          )}
          <div className="pds-overview-insight">Gunakan minat pembaca untuk menentukan judul yang dipromosikan atau dicetak ulang.</div>
        </div>
      </div>

      <div className="pds-panel pds-overview-util pds-mb14">
        <div className="pds-panel-title">Utilisasi koleksi — hidupkan backlist yang belum tersentuh<span className="tag">Peluang</span></div>
        <div className="pds-overview-util-meta"><span>{overview?.totalBooks ?? 0} judul terdaftar</span><span>{activeBooks} judul aktif dibaca</span></div>
        <div className="pds-overview-util-bar" role="img" aria-label={`${activePercent}% judul aktif dibaca, ${100 - activePercent}% belum dibaca`}>
          <div className="active" style={{ width: `${activePercent}%` }}>{activePercent >= 18 ? `${activePercent}% Aktif Dibaca` : ''}</div>
          <div className="idle" style={{ width: `${100 - activePercent}%` }}>{100 - activePercent >= 18 ? `${100 - activePercent}% Belum Dibaca` : ''}</div>
        </div>
        <p>Judul yang belum mendapat pembaca bisa diperkuat lewat promosi, Featured Book, atau pembaruan metadata katalog.</p>
      </div>

      <div className="pds-grid pds-mb14 pds-overview-split">
        <div className="pds-panel pds-overview-trend">
          <div className="pds-panel-title">Tren royalti 6 bulan<span className="tag">estimasi</span></div>
          <RoyaltyTrendChart trend={overview?.royaltyTrend ?? []} />
          <div className="pds-chart-legend"><div className="pds-leg"><span className="sw" style={{ background: 'var(--pds-amber)' }} />Estimasi royalti</div></div>
        </div>
        <div className="pds-panel">
          <div className="pds-panel-title">Riwayat transfer<span className="tag">pembaruan rutin tanggal 5</span></div>
          <div className="pds-overview-payout-head"><span>Periode</span><span>Status</span><span>Nilai</span></div>
          {payouts.length === 0 ? <div className="pds-empty">Belum ada riwayat transfer.</div> : payouts.map((payout) => (
            <div className="pds-overview-payout" key={payout.id}>
              <span>{new Date(payout.createdAt).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span>
              <span className="pds-overview-paid">{payout.status}</span>
              <span>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: payout.currency, maximumFractionDigits: 0 }).format(payout.amount)}</span>
            </div>
          ))}
          <button className="pds-overview-link" onClick={() => onTabChange('royalti')}>Lihat detail royalti</button>
        </div>
      </div>

      <div className="pds-overview-note"><strong>Catatan transparansi.</strong> Estimasi royalti dan seluruh metrik mengikuti data pembacaan yang tercatat. Nilai final mengikuti settlement resmi dan kontrak penerbit.</div>

      <section className="pds-overview-cta">
        <div><h2>Katalog Anda bisa menjangkau lebih banyak pembaca</h2><p>Lengkapi metadata dan unggah judul berikutnya untuk memperluas jangkauan katalog.</p></div>
        <Link href="/publisher/books/new" className="pds-btn pds-btn-primary">+ Upload buku baru</Link>
        <button className="pds-btn pds-btn-line" onClick={() => onTabChange('katalog')}>Buka katalog</button>
      </section>
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
    router.push(`/publisher/dashboard?tab=${nextTab}&period=${period}`);
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
