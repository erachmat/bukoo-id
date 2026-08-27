"use client";

import React, { useState } from "react";
import { DashboardShell } from "../(protected)/dashboard-shell";
import type { PublisherDashboardOverview } from "./queries";

interface DashboardClientProps {
  user: { name?: string | null; email?: string | null } | null;
  overview?: PublisherDashboardOverview;
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

      <div className="pds-kpi-row">
        <div className="pds-kpi teal"><div className="pds-kpi-label">Pembaca Bulan Ini</div><div className="pds-kpi-num">{totalReaders.toLocaleString('id-ID')}</div><div className="pds-kpi-chg pds-flat">pembaca aktif unik</div></div>
        <div className="pds-kpi amber"><div className="pds-kpi-label">Estimasi Royalti (Bulan Ini)</div><div className="pds-kpi-num">{royalty > 0 ? fmtRp.format(royalty) : 'Belum tersedia'}</div><div className="pds-kpi-chg pds-flat">estimasi dari data baca</div></div>
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
                      <td style={{ width: 34 }}><div className="pds-thumb">{b.coverKey ? '📖' : '📕'}</div></td>
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
    </>
  );
}

// ── page: katalog (tab view) ──────────────────────────────────
function PageKatalog() {
  return (
    <>
      <div className="pds-page-head">
        <div>
          <div className="pds-page-title">Katalog Buku</div>
          <div className="pds-page-sub">Kelola judul, status, dan berkas dari halaman katalog.</div>
        </div>
        <div className="pds-head-actions">
          <a href="/publisher/books" className="pds-btn pds-btn-primary">Buka Katalog →</a>
        </div>
      </div>
      <div className="pds-panel" style={{ textAlign: "center", padding: "60px 24px" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
        <div style={{ fontFamily: "var(--pds-serif)", fontSize: 20, color: "#fff", marginBottom: 8 }}>Katalog Buku</div>
        <div style={{ fontSize: 12, color: "var(--pds-dim)" }}>
          Kelola buku Anda di <a href="/publisher/books" style={{ color: "var(--pds-teal)" }}>halaman katalog</a> — unggah, edit, dan pantau status review.
        </div>
      </div>
    </>
  );
}

// ── page: notifikasi ──────────────────────────────────────────
function PageNotifikasi() {
  return (
    <>
      <div className="pds-page-head">
        <div>
          <div className="pds-page-title">Notifikasi</div>
          <div className="pds-page-sub">Aktivitas akun penerbit Anda.</div>
        </div>
      </div>
      <div className="pds-panel" style={{ textAlign: "center", padding: "60px 24px" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔔</div>
        <div style={{ fontFamily: "var(--pds-serif)", fontSize: 20, color: "#fff", marginBottom: 8 }}>Notifikasi</div>
        <div style={{ fontSize: 12, color: "var(--pds-dim)" }}>
          Buka <a href="/publisher/notifications" style={{ color: "var(--pds-teal)" }}>halaman notifikasi</a> untuk melihat semua aktivitas.
        </div>
      </div>
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
        <div><div className="pds-page-title">Royalti</div><div className="pds-page-sub">Estimasi berbasis data baca · nilai final dihitung dari settlement resmi</div></div>
      </div>
      <div className="pds-kpi-row">
        <div className="pds-kpi amber"><div className="pds-kpi-label">Estimasi Royalti Bulan Ini</div><div className="pds-kpi-num">{estimate > 0 ? fmtRp.format(estimate) : 'Belum tersedia'}</div><div className="pds-kpi-chg pds-flat">estimasi · formula 65%</div></div>
        <div className="pds-kpi teal"><div className="pds-kpi-label">Total Pembacaan</div><div className="pds-kpi-num">{entries.reduce((s, b) => s + b.readCount, 0).toLocaleString('id-ID')}</div><div className="pds-kpi-chg pds-flat">pembacaan kumulatif</div></div>
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
    </>
  );
}

// ── page: metadata ────────────────────────────────────────────
function PageMetadata() {
  return (
    <>
      <div className="pds-page-head">
        <div><div className="pds-page-title">Metadata</div><div className="pds-page-sub">Kelengkapan metadata buku Anda</div></div>
      </div>
      <div className="pds-panel">
        <div style={{ textAlign: "center", padding: "24px 16px", fontSize: 12, color: "var(--pds-dim)" }}>
          Metadata dapat dikelola dari halaman <a href="/publisher/books" style={{ color: "var(--pds-teal)" }}>Katalog</a> &gt; pilih buku &gt; Edit. Pastikan judul, penulis, ISBN, sinopsis, genre, dan sampul terisi lengkap untuk daya temu yang baik.
        </div>
      </div>
    </>
  );
}

// ── page: generic placeholder ─────────────────────────────────
function PagePlaceholder({ title, sub, icon }: { title: string; sub: string; icon: string }) {
  return (
    <>
      <div className="pds-page-head">
        <div><div className="pds-page-title">{title}</div><div className="pds-page-sub">{sub}</div></div>
      </div>
      <div className="pds-panel" style={{ textAlign: "center", padding: "60px 24px" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>
        <div style={{ fontFamily: "var(--pds-serif)", fontSize: 20, color: "#fff", marginBottom: 8 }}>{title}</div>
        <div style={{ fontSize: 12, color: "var(--pds-dim)" }}>Fitur ini belum tersedia. Data aktual akan ditampilkan setelah fitur rilis.</div>
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
export function DashboardClient({ user, overview }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const renderPage = () => {
    switch (activeTab) {
      case "overview":   return <PageOverview onTabChange={setActiveTab} overview={overview} />;
      case "katalog":    return <PageKatalog />;
      case "royalti":    return <PageRoyalti overview={overview} />;
      case "notifikasi": return <PageNotifikasi />;
      case "performa":   return <PagePlaceholder title="Performa Buku" sub="Analisis per judul — pembacaan, tingkat selesai, rating, dan tren" icon="📈" />;
      case "pembaca":    return <PagePlaceholder title="Pembaca" sub="Metrik retensi, frekuensi baca, dan loyalitas pembaca" icon="👥" />;
      case "demografi":  return <PageUnavailable title="Demografi" sub="Data demografi pembaca belum tersedia" icon="🧬" />;
      case "geo":        return <PageUnavailable title="Sebaran Geografis" sub="Data geografis pembaca belum tersedia" icon="🗺️" />;
      case "waktu":      return <PageUnavailable title="Waktu Baca" sub="Data ritme baca belum tersedia" icon="⏱️" />;
      case "metadata":   return <PageMetadata />;
      default:           return <PageOverview onTabChange={setActiveTab} overview={overview} />;
    }
  };

  return (
    <DashboardShell user={user ?? {}} activeTab={activeTab} onTabChange={setActiveTab}>
      {renderPage()}
    </DashboardShell>
  );
}
