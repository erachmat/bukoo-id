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
function PageOverview({ onTabChange, overview }: { onTabChange: (t: string) => void; overview?: PublisherDashboardOverview }) {
  const totalReaders = overview?.totalDistinctReaders ?? 0;
  const totalMinutes = Math.round((overview?.totalReadingSeconds ?? 0) / 60);
  const royalty = overview?.monthlyRoyaltyEstimate ?? 0;
  const fmtRp = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

  return (
    <>
      <div className="pds-page-head">
        <div>
          <div className="pds-page-title">Selamat datang, {overview?.publisherName || 'Mitra Penerbit'}</div>
          <div className="pds-page-sub">Data real-time dari katalog dan aktivitas baca Anda</div>
        </div>
        <div className="pds-head-actions">
          <button className="pds-btn pds-btn-primary" onClick={() => window.location.href = "/publisher/books/new"}>+ Upload Buku Baru</button>
        </div>
      </div>
      <PeriodChips period={overview?.period.key ?? 'this_month'} />

      <div className="pds-kpi-row">
        <div className="pds-kpi teal"><div className="pds-kpi-label">Pembaca Bulan Ini</div><div className="pds-kpi-num">{totalReaders.toLocaleString('id-ID')}</div><div className="pds-kpi-chg pds-flat">pembaca aktif unik</div></div>
        <div className="pds-kpi amber"><div className="pds-kpi-label">Estimasi Royalti (Bulan Ini)</div><div className="pds-kpi-num">{royalty > 0 ? fmtRp.format(royalty) : 'Belum tersedia'}</div><div className="pds-kpi-chg pds-flat">estimasi · pool diatur admin</div></div>
        <div className="pds-kpi coral"><div className="pds-kpi-label">Total Waktu Baca</div><div className="pds-kpi-num">{totalMinutes.toLocaleString('id-ID')} mnt</div><div className="pds-kpi-chg pds-flat">menit bulan ini</div></div>
        <div className="pds-kpi sky"><div className="pds-kpi-label">Judul Aktif</div><div className="pds-kpi-num">{overview?.publishedBooks ?? 0}</div><div className="pds-kpi-chg pds-flat">{(overview?.inReviewBooks ?? 0) + ' dalam review'}</div></div>
      </div>

      {/* Top books */}
      <div className="pds-grid pds-mb14" style={{ gridTemplateColumns: "1fr", alignItems: "start" }}>
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
                      <td style={{ width: 24 }}><div className="pds-rank bronze">{i + 1}</div></td>
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

function PeriodChips({ period }: { period: PublisherDashboardOverview['period']['key'] }) {
  const options = [
    { key: 'this_month' as const, label: 'Bulan ini' },
    { key: 'last_month' as const, label: 'Bulan lalu' },
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
