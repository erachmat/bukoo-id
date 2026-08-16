import React from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Dashboard Penerbit",
};

export const dynamic = "force-dynamic";

// ── Static illustrative data (design source: publisher/penerbit-dashboard.html) ──
const topBooks = [
  { name: "Judul A", pct: 100, val: "12.4k", color: "var(--forest-lll)" },
  { name: "Judul B", pct: 79, val: "9.8k", color: "var(--forest-lll)" },
  { name: "Judul C", pct: 58, val: "7.2k", color: "var(--amber)" },
  { name: "Judul D", pct: 41, val: "5.1k", color: "var(--amber)" },
  { name: "Judul E", pct: 26, val: "3.2k", color: "var(--coral)" },
];

const genres = [
  { name: "Sastra Indonesia", trend: "▲ +34%", cls: "dash-up" },
  { name: "Self-development", trend: "▲ +28%", cls: "dash-up" },
  { name: "Bisnis & Keuangan", trend: "▲ +19%", cls: "dash-up" },
  { name: "Fiksi Populer", trend: "▲ +12%", cls: "dash-up" },
  { name: "Sains", trend: "— stabil", cls: "dash-flat" },
  { name: "Anak & Remaja", trend: "▲ +9%", cls: "dash-up" },
];

const royaltyTrend = [
  { label: "Sep", height: 38 },
  { label: "Okt", height: 48 },
  { label: "Nov", height: 57 },
  { label: "Des", height: 69 },
  { label: "Jan", height: 84 },
  { label: "Feb", height: 100 },
];

const transfers = [
  { period: "Januari 2026", value: "Rp 132 jt" },
  { period: "Desember 2025", value: "Rp 109 jt" },
  { period: "November 2025", value: "Rp 90 jt" },
  { period: "Oktober 2025", value: "Rp 76 jt" },
];

export default async function PublisherDashboardPage() {
  const session = await auth();
  const user = session?.user;

  const userRole = (user as { role?: string } | undefined)?.role;
  if (!user || userRole !== "PUBLISHER") {
    redirect("/login");
  }

  const name = user.name || "Gramedia Pustaka Utama";

  return (
    <>
      {/* topbar */}
      <header className="topbar dash-topbar">
        <div className="topbar-left">
          <div className="topbar-title">Dashboard Penerbit</div>
          <div className="topbar-sub">{name} · Periode Januari 2026</div>
        </div>
        <div className="topbar-right">
          <button className="btn-outline">📅 Ganti Periode</button>
          <button className="btn-outline">🔄 Refresh Data</button>
          <button className="btn-export">⬇️ Export PDF</button>
        </div>
      </header>

      {/* main content */}
      <main className="main dash-main">
        <span className="dash-note">● Contoh tampilan · data ilustratif (platform rilis 3 Sep 2026)</span>

        {/* Compact hero header */}
        <div className="dash-head">
          <span className="dash-eyebrow">Publisher Dashboard</span>
          <h1 className="dash-h1">Lihat <em>bagaimana</em> pembaca membaca Anda</h1>
          <p className="dash-lead">
            Penjualan fisik hanya memberi tahu apa yang terjual. Dashboard penerbit BUKOO memberi tahu apa yang benar-benar{" "}
            <strong>dibaca, dituntaskan, dan diminati</strong> — insight yang mengubah cara Anda mengambil keputusan bisnis.
          </p>
        </div>

        {/* KPI row */}
        <div className="dash-kpi">
          <div className="dash-kpi-card dash-kpi-amber">
            <div className="dash-kpi-label">Royalti bulan ini</div>
            <div className="dash-kpi-value">Rp 148<small> jt</small></div>
            <div className="dash-kpi-delta dash-kpi-up">▲ +12% vs bulan lalu</div>
          </div>
          <div className="dash-kpi-card">
            <div className="dash-kpi-label">Total sesi baca</div>
            <div className="dash-kpi-value">86<small>.240</small></div>
            <div className="dash-kpi-delta dash-kpi-up">▲ +9,4%</div>
          </div>
          <div className="dash-kpi-card">
            <div className="dash-kpi-label">Judul aktif dibaca</div>
            <div className="dash-kpi-value">142<small>/320</small></div>
            <div className="dash-kpi-delta" style={{ color: "rgba(240,237,230,0.35)" }}>44% katalog aktif</div>
          </div>
          <div className="dash-kpi-card">
            <div className="dash-kpi-label">Transfer berikutnya</div>
            <div className="dash-kpi-value">Tgl 5</div>
            <div className="dash-kpi-delta" style={{ color: "var(--amber)" }}>Rp 148 jt terjadwal</div>
          </div>
        </div>

        {/* Top books + rising genres */}
        <div className="dash-grid2">
          <div className="dash-panel">
            <div className="dash-panel-head">
              <div>
                <div className="dash-panel-title">Judul paling banyak dibaca</div>
                <div className="dash-panel-sub">Periode contoh · 30 hari terakhir</div>
              </div>
              <span className="dash-pill">Top 5</span>
            </div>
            <div className="dash-book-list">
              {topBooks.map((b) => (
                <div className="dash-book-row" key={b.name}>
                  <span className="dash-book-name">{b.name}</span>
                  <div className="dash-book-track">
                    <div className="dash-book-fill" style={{ width: `${b.pct}%`, background: b.color }} />
                  </div>
                  <span className="dash-book-val">{b.val}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="dash-panel">
            <div className="dash-panel-head">
              <div>
                <div className="dash-panel-title">Genre yang sedang naik</div>
                <div className="dash-panel-sub">Tren minat pembaca</div>
              </div>
              <span className="dash-pill dash-pill-teal">Live</span>
            </div>
            <div className="dash-genre">
              {genres.map((g) => (
                <div className="dash-gchip" key={g.name}>
                  <span>{g.name}</span>
                  <b className={g.cls}>{g.trend}</b>
                </div>
              ))}
            </div>
            <div className="dash-insight" style={{ marginTop: 14 }}>
              Minat <b>Sastra Indonesia</b> naik tajam — pertimbangkan cetak ulang atau akuisisi naskah di genre ini.
            </div>
          </div>
        </div>

        {/* Collection utilization */}
        <div className="dash-panel" style={{ marginBottom: 16 }}>
          <div className="dash-panel-head">
            <div>
              <div className="dash-panel-title">Utilisasi koleksi — hidupkan backlist yang &quot;tidur&quot;</div>
              <div className="dash-panel-sub">320 judul terdaftar · 142 aktif</div>
            </div>
            <span className="dash-pill dash-pill-coral">Peluang</span>
          </div>
          <div className="dash-util">
            <div className="dash-util-active" style={{ width: "44%" }}>44% Aktif Dibaca</div>
            <div className="dash-util-idle">56% Belum Tersentuh</div>
          </div>
          <div className="dash-insight">
            Sebagian besar katalog Anda punya potensi yang belum tergali. Lewat fitur <b>Featured Book</b> dan rekomendasi AI BUKOO, judul yang &quot;tidur&quot; bisa diaktifkan kembali — menghidupkan pendapatan dari aset yang selama ini pasif, tanpa biaya cetak tambahan.
          </div>
        </div>

        {/* Royalty trend + transfer history */}
        <div className="dash-grid2">
          <div className="dash-panel">
            <div className="dash-panel-head">
              <div>
                <div className="dash-panel-title">Tren royalti 6 bulan</div>
                <div className="dash-panel-sub">Ilustrasi pertumbuhan (juta Rupiah)</div>
              </div>
            </div>
            <div className="dash-trend">
              {royaltyTrend.map((m) => (
                <div className="dash-tbar" key={m.label}>
                  <div className="dash-tbar-fill" style={{ height: `${m.height}%` }} />
                  <span className="dash-tbar-label">{m.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="dash-panel">
            <div className="dash-panel-head">
              <div>
                <div className="dash-panel-title">Riwayat transfer</div>
                <div className="dash-panel-sub">Dibayar rutin tanggal 5</div>
              </div>
            </div>
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Periode</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Nilai</th>
                </tr>
              </thead>
              <tbody>
                {transfers.map((t) => (
                  <tr key={t.period}>
                    <td>{t.period}</td>
                    <td><span className="dash-badge-paid">Terbayar</span></td>
                    <td className="r">{t.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Transparency note */}
        <div className="dash-disc">
          <b>Catatan transparansi.</b> Seluruh angka &amp; grafik di halaman ini adalah <b>contoh ilustratif</b> untuk menggambarkan struktur dashboard. Data pembaca aktual tersedia setelah peluncuran platform pada 3 September 2026.
        </div>

        {/* CTA band */}
        <div className="dash-cta">
          <h3>Dashboard ini menanti <em>katalog Anda</em></h3>
          <p>Setiap penerbit mitra mendapat akses dashboard real-time seperti ini sejak buku pertama tayang.</p>
          <Link href="/publisher/books/new" className="dash-cta-btn">Unggah buku pertama Anda →</Link>
        </div>
      </main>
    </>
  );
}
