"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardShell } from "../(protected)/dashboard-shell";
import type { PublisherDashboardOverview } from "./queries";
import { CatalogTable, type PublisherCatalogBook } from "../catalog-table";
import { getCoverUrl } from "@/lib/cover-url";
import { countryLabel } from "./metrics";

interface DashboardClientProps {
  user: { name?: string | null; email?: string | null } | null;
  overview?: PublisherDashboardOverview;
  catalog?: PublisherCatalogBook[];
  tab: string;
}

// ── page: overview ────────────────────────────────────────────
type Overview = PublisherDashboardOverview;

const CHART_COLORS = ['var(--pds-teal)', 'var(--pds-sky)', 'var(--pds-amber)', 'var(--pds-coral)', 'var(--pds-lavender)', 'rgba(255,255,255,0.28)'];

function deltaClass(current: number, previous: number): { cls: string; sign: string; pct: string } {
  if (previous <= 0) return { cls: 'pds-flat', sign: '●', pct: 'baru' };
  const change = ((current - previous) / previous) * 100;
  if (Math.abs(change) < 0.05) return { cls: 'pds-flat', sign: '=', pct: 'stabil' };
  const rounded = Math.abs(change).toLocaleString('id-ID', { maximumFractionDigits: 1 });
  return change > 0
    ? { cls: 'pds-up', sign: '▲', pct: `${rounded}%` }
    : { cls: 'pds-down', sign: '▼', pct: `${rounded}%` };
}

/** CSS bar chart from trend points (daily or monthly buckets). */
function TrendChart({ trend }: { trend: Overview['dailyTrend'] }) {
  if (trend.length === 0) {
    return <div className="pds-empty">Belum ada aktivitas baca pada periode ini.</div>;
  }
  const max = Math.max(...trend.map((p) => p.reads), 1);
  const monthly = trend[0].bucket.length === 7; // 'YYYY-MM'
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
  return (
    <div className="pds-chart">
      {trend.map((point) => {
        const pct = Math.max(Math.round((point.reads / max) * 100), 4);
        const isMax = point.reads === max;
        const label = monthly
          ? monthNames[Number(point.bucket.slice(5, 7)) - 1] ?? point.bucket
          : point.bucket.slice(8, 10);
        return (
          <div className="pds-cbar-wrap" key={point.bucket} title={`${point.bucket}: ${point.reads.toLocaleString('id-ID')} baca`}>
            <div className="pds-cval" style={isMax ? { color: 'var(--pds-teal)' } : undefined}>
              {point.reads >= 1000 ? `${(point.reads / 1000).toLocaleString('id-ID', { maximumFractionDigits: 1 })}k` : point.reads}
            </div>
            <div className="pds-cbar" style={{
              height: `${pct}%`,
              background: isMax ? 'var(--pds-teal)' : 'rgba(0,201,167,0.35)',
            }} />
            <div className="pds-cmon" style={isMax ? { color: 'var(--pds-teal)', fontWeight: 700 } : undefined}>{label}</div>
          </div>
        );
      })}
    </div>
  );
}

function PageOverview({ onTabChange, overview }: { onTabChange: (t: string) => void; overview?: Overview }) {
  const totalReaders = overview?.totalDistinctReaders ?? 0;
  const totalMinutes = Math.round((overview?.totalReadingSeconds ?? 0) / 60);
  const royalty = overview?.monthlyRoyaltyEstimate ?? 0;
  const fmtRp = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
  const cmp = overview?.comparison;
  const periodLabel = overview?.period.label ?? 'Bulan ini';

  const readerDelta = deltaClass(totalReaders, cmp?.readers.previous ?? 0);
  const minuteDelta = deltaClass(totalMinutes, Math.round((cmp?.seconds.previous ?? 0) / 60));
  const completionDelta = deltaClass(overview?.totalCompletions ?? 0, cmp?.completions.previous ?? 0);
  const royaltyDelta = deltaClass(royalty, cmp?.royalty.previous ?? 0);

  return (
    <>
      <div className="pds-page-head">
        <div>
          <div className="pds-page-title">Selamat datang, {overview?.publisherName || 'Mitra Penerbit'}</div>
          <div className="pds-page-sub">Data real-time · Periode {periodLabel}</div>
        </div>
        <div className="pds-head-actions">
          <button className="pds-btn pds-btn-primary" onClick={() => window.location.href = "/publisher/books/new"}>+ Upload Buku Baru</button>
        </div>
      </div>
      <PeriodChips period={overview?.period.key ?? 'this_month'} />

      <div className="pds-kpi-row">
        <div className="pds-kpi teal">
          <div className="pds-kpi-label">Pembaca ({periodLabel})</div>
          <div className="pds-kpi-num">{totalReaders.toLocaleString('id-ID')}</div>
          <div className={`pds-kpi-chg ${readerDelta.cls}`}>{readerDelta.sign} {readerDelta.pct} vs periode lalu</div>
        </div>
        <div className="pds-kpi amber">
          <div className="pds-kpi-label">Estimasi Royalti</div>
          <div className="pds-kpi-num">{royalty > 0 ? fmtRp.format(royalty) : '—'}</div>
          <div className={`pds-kpi-chg ${royalty > 0 && cmp?.royalty.hasData ? royaltyDelta.cls : 'pds-flat'}`}>{royalty > 0 && cmp?.royalty.hasData ? `${royaltyDelta.sign} ${royaltyDelta.pct} vs periode lalu` : 'estimasi · pool diatur admin'}</div>
        </div>
        <div className="pds-kpi coral">
          <div className="pds-kpi-label">Total Waktu Baca</div>
          <div className="pds-kpi-num">{totalMinutes.toLocaleString('id-ID')} mnt</div>
          <div className={`pds-kpi-chg ${minuteDelta.cls}`}>{minuteDelta.sign} {minuteDelta.pct} vs periode lalu</div>
        </div>
        <div className="pds-kpi sky">
          <div className="pds-kpi-label">Baca Selesai</div>
          <div className="pds-kpi-num">{(overview?.totalCompletions ?? 0).toLocaleString('id-ID')}</div>
          <div className={`pds-kpi-chg ${completionDelta.cls}`}>{completionDelta.sign} {completionDelta.pct} vs periode lalu</div>
        </div>
      </div>

      {/* Trend + top books */}
      <div className="pds-grid pds-mb14" style={{ gridTemplateColumns: "1.6fr 1fr", alignItems: "start" }}>
        <div className="pds-panel">
          <div className="pds-panel-title">📈 Tren Pembacaan<span className="tag">{periodLabel}</span></div>
          <TrendChart trend={overview?.dailyTrend ?? []} />
          <div className="pds-chart-legend">
            <div className="pds-leg"><span className="sw" style={{ background: 'var(--pds-teal)' }} />Pembacaan (read starts)</div>
          </div>
        </div>
        <div className="pds-panel">
          <div className="pds-panel-title">🏆 Top Buku Anda<button className="more" onClick={() => onTabChange("performa")}>Lihat semua →</button></div>
          <div className="pds-tbl-scroll">
            <table className="pds-tbl">
              <tbody>
                {(overview?.topBooks ?? []).length === 0 ? (
                  <tr><td style={{ padding: "40px 16px", textAlign: "center", color: "var(--pds-muted)", fontSize: 12 }}>
                    Belum ada data pembacaan. Unggah buku untuk mulai melihat performa.
                  </td></tr>
                ) : (
                  overview!.topBooks.map((b, i) => (
                    <tr key={b.id}>
                      <td style={{ width: 24 }}><div className={`pds-rank ${i === 0 ? 'gold' : i < 3 ? 'silver' : 'bronze'}`}>{i + 1}</div></td>
                      <td style={{ width: 34 }}><div className="pds-thumb">{b.coverKey ? <img src={getCoverUrl(b.coverKey)} alt="" /> : '📕'}</div></td>
                      <td><div className="t-main">{b.title}</div><div className="t-sub">{b.author}</div></td>
                      <td className="r"><div className="t-main num" style={{ color: "var(--pds-teal)" }}>{b.readCount.toLocaleString('id-ID')}</div><div className="t-sub">pembacaan</div></td>
                      <td className="r"><div className="t-main num">{Math.round(b.readSeconds / 60).toLocaleString('id-ID')} mnt</div><div className="t-sub">waktu baca</div></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Genre donut + demographics + geo */}
      <div className="pds-grid pds-mb14 pds-grid-3">
        <GenrePanel overview={overview} />
        <DemographicsPanel overview={overview} />
        <GeoPanelCompact overview={overview} onTabChange={onTabChange} />
      </div>

      <FunnelPanel overview={overview} periodLabel={periodLabel} />

      <PremiumInsightsPanel insights={overview?.premiumInsights} />

      {/* Notifications */}
      <div className="pds-panel">
        <div className="pds-panel-title">🔔 Notifikasi Terbaru<button className="more" onClick={() => onTabChange("notifikasi")}>Semua →</button></div>
        <div className="pds-tbl-scroll">
          {(overview?.recentNotifications ?? []).length === 0 ? (
            <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--pds-muted)", fontSize: 12 }}>
              Belum ada notifikasi.
            </div>
          ) : (
            overview!.recentNotifications.map((n) => (
              <div className={`pds-notif-item${n.read ? '' : ' unread'}`} key={n.id} style={{ cursor: 'default' }}>
                <div className="pds-notif-ic" style={{ background: 'rgba(0,201,167,0.14)' }}>🔔</div>
                <div className="pds-notif-body">
                  <div className="pds-notif-t">{n.title}</div>
                  <div className="pds-notif-d">{n.body}</div>
                  <div className="pds-notif-time">{new Date(n.createdAt).toLocaleString('id-ID')}</div>
                </div>
                {!n.read && <div className="pds-notif-dot" />}
              </div>
            ))
          )}
        </div>
      </div>
      <div className="pds-panel" style={{ marginTop: 14 }}>
        <div className="pds-panel-title">Riwayat settlement <span className="tag">ledger manual · bukan transfer langsung</span></div>
        <div className="pds-tbl-scroll"><table className="pds-tbl"><thead><tr><th>Tanggal</th><th>Status</th><th className="r">Jumlah</th><th>Referensi</th></tr></thead><tbody>{(overview?.payouts ?? []).length === 0 ? <tr><td colSpan={4} style={{ padding: 36, textAlign: 'center', color: 'var(--pds-muted)' }}>Belum ada settlement.</td></tr> : overview!.payouts.map((payout) => <tr key={payout.id}><td>{new Date(payout.createdAt).toLocaleDateString('id-ID')}</td><td>{payout.status}</td><td className="r num">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: payout.currency, maximumFractionDigits: 0 }).format(payout.amount)}</td><td>{payout.externalRef || '—'}</td></tr>)}</tbody></table></div>
      </div>
    </>
  );
}

function GenrePanel({ overview }: { overview?: Overview }) {
  const split = overview?.genreSplit ?? [];
  const total = split.reduce((s, g) => s + g.readerDays, 0);
  const top = split.slice(0, 5);
  const segments = top.reduce<Array<{ color: string; from: number; to: number; pct: number; genre: string }>>((list, g, i) => {
    const pct = total > 0 ? (g.readerDays / total) * 100 : 0;
    const from = list.length > 0 ? list[list.length - 1].to : 0;
    list.push({ color: CHART_COLORS[i % CHART_COLORS.length], from, to: from + pct, pct, genre: g.genre });
    return list;
  }, []);
  const gradient = segments.map((s) => `${s.color} ${s.from.toFixed(1)}% ${s.to.toFixed(1)}%`).join(', ');
  return (
    <div className="pds-panel">
      <div className="pds-panel-title">🎯 Distribusi Genre<span className="tag">reader-days</span></div>
      {top.length === 0 ? (
        <div className="pds-empty">Belum ada data — lengkapi genre pada metadata judul.</div>
      ) : (
        <div className="pds-donut-wrap">
          <div className="pds-donut" style={{ background: gradient || 'rgba(255,255,255,0.08)' }}>
            <div className="dctr"><b>{segments[0] ? `${Math.round(segments[0].pct)}%` : '—'}</b><span>{segments[0]?.genre ?? ''}</span></div>
          </div>
          <div className="pds-dleg">
            {segments.map((s) => (
              <div className="li" key={s.genre}>
                <span className="sw" style={{ background: s.color }} />
                <span className="nm">{s.genre}</span>
                <span className="pc">{Math.round(s.pct)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DemographicsPanel({ overview }: { overview?: Overview }) {
  const demo = overview?.demographics;
  const known = demo?.knownCount ?? 0;
  return (
    <div className="pds-panel">
      <div className="pds-panel-title">👥 Demografi<span className="tag">agregat anonim</span></div>
      {!demo || known === 0 ? (
        <div className="pds-empty">Belum ada data demografi pembaca.</div>
      ) : (
        <>
          {demo.ageGroups.filter((a) => a.count > 0).map((a, i) => {
            const pct = (a.count / known) * 100;
            const color = CHART_COLORS[i % CHART_COLORS.length];
            return (
              <div className="pds-demo-row" key={a.label}>
                <div className="pds-demo-lab">{a.label} th</div>
                <div className="pds-track" style={{ flex: 1 }}><div className="fill" style={{ width: `${Math.max(pct, 3)}%`, background: color }} /></div>
                <div className="pds-demo-pc" style={{ color }}>{Math.round(pct)}%</div>
              </div>
            );
          })}
          <div style={{ borderTop: '1px solid var(--pds-border-soft)', marginTop: 10, paddingTop: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 9.5, color: 'var(--pds-dim)' }}>Perempuan</span>
              <span style={{ fontSize: 9.5, fontWeight: 700, color: '#fff' }}>{Math.round((demo.gender.female / known) * 100)}%</span>
            </div>
            <div className="pds-track">
              <div className="fill" style={{ width: `${(demo.gender.female / known) * 100}%`, background: 'linear-gradient(90deg, var(--pds-teal), var(--pds-sky))' }} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function GeoPanelCompact({ overview, onTabChange }: { overview?: Overview; onTabChange: (t: string) => void }) {
  const geo = overview?.geo ?? [];
  const total = geo.reduce((s, g) => s + g.readerDays, 0) || 1;
  const top = geo.slice(0, 5);
  return (
    <div className="pds-panel">
      <div className="pds-panel-title">🗺️ Sebaran<button className="more" onClick={() => onTabChange('geo')}>Detail →</button></div>
      {top.length === 0 ? (
        <div className="pds-empty">Belum ada data geografis.</div>
      ) : (
        top.map((row) => {
          const pct = (row.readerDays / total) * 100;
          return (
            <div className="pds-geo-row" key={row.countryCode}>
              <div className="pds-geo-label">{countryLabel(row.countryCode)}</div>
              <div className="pds-track" style={{ flex: 1 }}><div className="fill" style={{ width: `${Math.max(pct, 3)}%`, background: 'var(--pds-teal)' }} /></div>
              <div className="pds-geo-val">{Math.round(pct)}%</div>
            </div>
          );
        })
      )}
    </div>
  );
}

function FunnelPanel({ overview, periodLabel }: { overview?: Overview; periodLabel: string }) {
  const funnel = overview?.funnel;
  const opened = funnel?.opened ?? 0;
  const completed = funnel?.completed ?? 0;
  const completionPct = opened > 0 ? (completed / opened) * 100 : 0;
  const steps = [
    { label: 'Buka buku (read starts)', value: opened, pct: opened > 0 ? 100 : 0, color: 'var(--pds-teal)' },
    { label: 'Selesai baca', value: completed, pct: completionPct, color: 'var(--pds-amber)' },
  ];
  return (
    <div className="pds-panel pds-mb14">
      <div className="pds-panel-title">📉 Corong Keterlibatan<span className="tag">{periodLabel}</span></div>
      {opened === 0 ? (
        <div className="pds-empty">Belum ada aktivitas baca pada periode ini.</div>
      ) : (
        <div>
          {steps.map((step) => (
            <div key={step.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 10, color: 'var(--pds-dim2)' }}>{step.label}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>{step.value.toLocaleString('id-ID')} · {Math.round(step.pct)}%</span>
              </div>
              <div className="pds-track pds-mb14" style={{ height: 14 }}>
                <div className="fill" style={{ width: `${Math.max(step.pct, 2)}%`, background: step.color }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PremiumInsightsPanel({ insights }: { insights?: PublisherDashboardOverview['premiumInsights'] }) {
  const data = insights ?? { premiumBookCount: 0, books: [] };
  return (
    <div className="pds-panel">
      <div className="pds-panel-title">💎 Potensi Premium <span className="tag">agregat · tanpa identitas pembaca</span></div>
      {data.premiumBookCount === 0 ? (
        <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--pds-muted)', fontSize: 12 }}>
          Belum ada buku premium. Tetapkan tier akses premium pada judul untuk melihat potensi konversi.
        </div>
      ) : (
        <div className="pds-tbl-scroll">
          <table className="pds-tbl">
            <thead><tr><th>Judul</th><th>Tier wajib</th><th className="r">Pembaca</th><th className="r">Berpotensi upgrade</th><th className="r">Sudah memenuhi</th></tr></thead>
            <tbody>
              {data.books.map((book) => (
                <tr key={book.id}>
                  <td className="t-main">{book.title}</td>
                  <td>{book.requiredTier}</td>
                  <td className="r num">{book.distinctReaders.toLocaleString('id-ID')}</td>
                  <td className="r num" style={{ color: 'var(--pds-coral)' }}>{book.belowTierReaders.toLocaleString('id-ID')}</td>
                  <td className="r num" style={{ color: 'var(--pds-teal)' }}>{book.eligibleReaders.toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PeriodChips({ period }: { period: PublisherDashboardOverview['period']['key'] }) {
  const options = [
    { key: 'this_month' as const, label: 'Bulan ini' },
    { key: 'last_month' as const, label: 'Bulan lalu' },
    { key: 'this_quarter' as const, label: 'Kuartal ini' },
    { key: 'ytd' as const, label: 'YTD' },
    { key: 'all_time' as const, label: 'Semua waktu' },
  ];
  return (
    <div className="pds-period-chips" aria-label="Periode data">
      {options.map((option) => (
        <Link
          href={`/publisher/dashboard?period=${option.key}`}
          key={option.key}
          className={`pds-period-chip${period === option.key ? ' active' : ''}`}
          aria-current={period === option.key ? 'page' : undefined}
        >
          {option.label}
        </Link>
      ))}
    </div>
  );
}

// ── page: katalog (tab view) ──────────────────────────────────
function PageKatalog({ catalog }: { catalog: PublisherCatalogBook[] }) {
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
      <CatalogTable books={catalog} />
    </>
  );
}

// ── page: royalti ─────────────────────────────────────────────
function PageRoyalti({ overview }: { overview?: PublisherDashboardOverview }) {
  const fmtRp = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
  const estimate = overview?.monthlyRoyaltyEstimate ?? 0;
  const entries = overview?.topBooks ?? [];

  return (
    <>
      <div className="pds-page-head">
        <div><div className="pds-page-title">Royalti</div><div className="pds-page-sub">Estimasi berbasis data baca · {overview?.period.label ?? 'Bulan ini'} · nilai final dihitung dari settlement resmi</div></div>
      </div>
      <div className="pds-kpi-row">
        <div className="pds-kpi amber"><div className="pds-kpi-label">Estimasi Royalti Bulan Ini</div><div className="pds-kpi-num">{estimate > 0 ? fmtRp.format(estimate) : 'Belum tersedia'}</div><div className="pds-kpi-chg pds-flat">estimasi · pool diatur admin</div></div>
        <div className="pds-kpi teal"><div className="pds-kpi-label">Total Pembacaan</div><div className="pds-kpi-num">{(overview?.totalLifetimeReads ?? 0).toLocaleString('id-ID')}</div><div className="pds-kpi-chg pds-flat">pembacaan kumulatif</div></div>
        <div className="pds-kpi sky"><div className="pds-kpi-label">Total Waktu Baca</div><div className="pds-kpi-num">{Math.round((overview?.totalReadingSeconds ?? 0) / 3600).toLocaleString('id-ID')} jam</div><div className="pds-kpi-chg pds-flat">bulan ini</div></div>
      </div>
      <div className="pds-panel">
        <div className="pds-panel-title">📊 Estimasi Royalti per Judul<span className="tag">estimasi dari data baca</span></div>
        <div className="pds-tbl-scroll">
          <table className="pds-tbl">
            <thead><tr><th>Judul Buku</th><th className="r">Pembacaan</th><th className="r">Waktu Baca</th><th className="r">Selesai</th></tr></thead>
            <tbody>
              {entries.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: "40px 16px", textAlign: "center", color: "var(--pds-muted)", fontSize: 12 }}>
                  Belum ada data pembacaan untuk diestimasi.
                </td></tr>
              ) : entries.map((b) => (
                <tr key={b.id}>
                  <td className="t-main">{b.title}</td>
                  <td className="r num">{b.readCount.toLocaleString('id-ID')}</td>
                  <td className="r num">{Math.round(b.readSeconds / 3600).toLocaleString('id-ID')} jam</td>
                  <td className="r num">{b.completedReads.toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 12, borderTop: "1px solid rgba(201,149,42,0.2)", paddingTop: 12, fontSize: 11, color: "var(--pds-dim)" }}>
          Royalti ditampilkan sebagai <b>estimasi</b> berbasis aktivitas baca. Nilai final mengikuti settlement dan kebijakan kontrak penerbit.
        </div>
      </div>
      <div className="pds-panel" style={{ marginTop: 14 }}>
        <div className="pds-panel-title">Riwayat settlement <span className="tag">ledger manual · bukan transfer langsung</span></div>
        <div className="pds-tbl-scroll"><table className="pds-tbl"><thead><tr><th>Tanggal</th><th>Status</th><th className="r">Jumlah</th><th>Referensi</th></tr></thead><tbody>{(overview?.payouts ?? []).length === 0 ? <tr><td colSpan={4} style={{ padding: 36, textAlign: 'center', color: 'var(--pds-muted)' }}>Belum ada settlement.</td></tr> : overview!.payouts.map((payout) => <tr key={payout.id}><td>{new Date(payout.createdAt).toLocaleDateString('id-ID')}</td><td>{payout.status}</td><td className="r num">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: payout.currency, maximumFractionDigits: 0 }).format(payout.amount)}</td><td>{payout.externalRef || '—'}</td></tr>)}</tbody></table></div>
      </div>
    </>
  );
}

function PagePerforma({ catalog }: { catalog: PublisherCatalogBook[] }) {
  return <>
    <div className="pds-page-head"><div><div className="pds-page-title">Performa Buku</div><div className="pds-page-sub">Pilih judul untuk melihat pembacaan dan tren berdasarkan periode.</div></div></div>
    <div className="pds-panel"><div className="pds-tbl-scroll"><table className="pds-tbl"><thead><tr><th>Judul</th><th>Penulis</th><th className="r">Pembacaan kumulatif</th><th className="c">Aksi</th></tr></thead><tbody>{catalog.length === 0 ? <tr><td colSpan={4} style={{ padding: 40, textAlign: 'center', color: 'var(--pds-muted)' }}>Belum ada buku untuk dianalisis.</td></tr> : catalog.map((book) => <tr key={book.id}><td className="t-main">{book.title}</td><td>{book.author}</td><td className="r num">{book.readCount.toLocaleString('id-ID')}</td><td className="c"><Link href={`/publisher/books/${book.id}/analytics`} style={{ color: 'var(--pds-teal)', textDecoration: 'none', fontWeight: 600 }}>Lihat analitik →</Link></td></tr>)}</tbody></table></div></div>
  </>;
}

function PagePembaca({ overview }: { overview?: PublisherDashboardOverview }) {
  const loyalty = overview?.readerLoyalty ?? { oneDay: 0, twoToFourDays: 0, fivePlusDays: 0 };
  return <>
    <div className="pds-page-head"><div><div className="pds-page-title">Pembaca</div><div className="pds-page-sub">Retensi berdasarkan jumlah hari baca dalam {overview?.period.label ?? 'periode terpilih'}.</div></div></div>
    <div className="pds-panel"><div className="pds-panel-title">Retensi pembaca <span className="tag">tanpa usia, gender, atau lokasi</span></div><div className="pds-kpi-row"><div className="pds-kpi teal"><div className="pds-kpi-label">1 hari baca</div><div className="pds-kpi-num">{loyalty.oneDay.toLocaleString('id-ID')}</div></div><div className="pds-kpi sky"><div className="pds-kpi-label">2–4 hari baca</div><div className="pds-kpi-num">{loyalty.twoToFourDays.toLocaleString('id-ID')}</div></div><div className="pds-kpi amber"><div className="pds-kpi-label">5+ hari baca</div><div className="pds-kpi-num">{loyalty.fivePlusDays.toLocaleString('id-ID')}</div></div></div></div>
  </>;
}

function PageGeo({ overview }: { overview?: PublisherDashboardOverview }) {
  const geo = overview?.geo ?? [];
  return <>
    <div className="pds-page-head"><div><div className="pds-page-title">Sebaran Geografis</div><div className="pds-page-sub">Reader-days berdasarkan negara · {overview?.period.label ?? 'periode terpilih'}</div></div></div>
    <div className="pds-panel"><div className="pds-panel-title">Negara pembaca <span className="tag">agregat negara · tanpa alamat/IP</span></div>
      {geo.length === 0 ? <div style={{ padding: 48, textAlign: 'center', color: 'var(--pds-muted)', fontSize: 12 }}>Belum ada data geografis. Data dikumpulkan dari pembacaan baru.</div> : <div className="pds-tbl-scroll"><table className="pds-tbl"><thead><tr><th>Negara</th><th>Kode</th><th className="r">Hari baca</th></tr></thead><tbody>{geo.map((row) => <tr key={row.countryCode}><td className="t-main">{countryLabel(row.countryCode)}</td><td>{row.countryCode}</td><td className="r num">{row.readerDays.toLocaleString('id-ID')}</td></tr>)}</tbody></table></div>}
    </div>
  </>;
}

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

// ── page: unavailable (explicitly out of scope) ───────────────
function PageUnavailable({ title, sub, icon }: { title: string; sub: string; icon: string }) {
  return (
    <>
      <div className="pds-page-head">
        <div><div className="pds-page-title">{title}</div><div className="pds-page-sub">{sub}</div></div>
      </div>
      <div className="pds-panel" style={{ textAlign: "center", padding: "60px 24px" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>
        <div style={{ fontFamily: "var(--pds-serif)", fontSize: 20, color: "#fff", marginBottom: 8 }}>{title}</div>
        <div style={{ fontSize: 12, color: "var(--pds-dim)" }}>Data untuk fitur ini belum dikumpulkan.</div>
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
    router.replace(`/publisher/dashboard?tab=${nextTab}&period=${period}`);
  };

  const renderPage = () => {
    switch (activeTab) {
      case "overview":   return <PageOverview onTabChange={onTabChange} overview={overview} />;
      case "katalog":    return <PageKatalog catalog={catalog} />;
      case "royalti":    return <PageRoyalti overview={overview} />;
      case "performa":   return <PagePerforma catalog={catalog} />;
      case "pembaca":    return <PagePembaca overview={overview} />;
      case "demografi":  return <PageUnavailable title="Demografi" sub="Data demografi pembaca belum tersedia" icon="🧬" />;
      case "geo":        return <PageGeo overview={overview} />;
      case "waktu":      return <PageUnavailable title="Waktu Baca" sub="Data ritme baca belum tersedia" icon="⏱️" />;
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
