import React from "react";
import Link from "next/link";
import { PublisherNav } from "@/components/publisher/PublisherNav";
import { PublisherLoginTrigger, PublisherRegisterTrigger } from "@/components/publisher/publisher-login";

export function PublisherDashboardShowcase() {
  const now = new Date();
  const trendMonths = Array.from({ length: 6 }, (_, index) => new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5 + index, 1)));
  const transferMonths = Array.from({ length: 4 }, (_, index) => new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1 - index, 1)));
  const formatMonth = (date: Date) => new Intl.DateTimeFormat("id-ID", { month: "short", year: "2-digit", timeZone: "UTC" }).format(date);
  const trendPeriod = `${formatMonth(trendMonths[0])}–${formatMonth(trendMonths[trendMonths.length - 1])}`;
  const nextTransferMonth = formatMonth(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)));
  return (
    <div className="pub-page-wrap">
      <PublisherNav currentTab="dashboard" />

      {/* Hero Section */}
      <section className="phero" style={{ paddingBottom: 40 }}>
        <div className="phero-bg" />
        <div className="phero-grid" />
        <div className="pub-wrap">
          <span className="dash-note">Contoh data · seluruh angka dan grafik di bawah ini ilustratif</span>
          <br />
          <span className="eyebrow">Publisher Dashboard</span>
          <h1 className="ph-h1">
            Lihat <em>bagaimana</em> pembaca membaca Anda
          </h1>
          <p className="ph-lead">
            Penjualan fisik hanya memberi tahu apa yang terjual. Dashboard penerbit BUKOO memberi tahu apa yang benar-benar <strong>dibaca, dituntaskan, dan diminati</strong> — insight yang mengubah cara Anda mengambil keputusan bisnis.
          </p>
          <div className="dash-hero-actions">
            <PublisherRegisterTrigger callbackUrl="/publisher/dashboard" className="dash-cta-btn">
              Buat akun portal penerbit →
            </PublisherRegisterTrigger>
            <Link href="/publisher/daftar#daftar" className="btn-ghost btn-lg">
              Ajukan kemitraan
            </Link>
          </div>
        </div>
      </section>

      {/* KPI & Interactive Preview Section */}
      <section className="pub-sec" style={{ paddingTop: 20 }}>
        <div className="pub-wrap">
          {/* KPI Cards */}
          <div className="dash-kpi">
            <div className="dash-kpi-card dash-kpi-amber">
              <div className="dash-kpi-label">Estimasi royalti · contoh</div>
              <div className="dash-kpi-value">
                Rp 148<small> jt</small>
              </div>
              <div className="dash-kpi-delta dash-kpi-up">▲ +12% · ilustrasi</div>
            </div>
            <div className="dash-kpi-card">
              <div className="dash-kpi-label">Total sesi baca</div>
              <div className="dash-kpi-value">
                86<small>.240</small>
              </div>
              <div className="dash-kpi-delta dash-kpi-up">▲ +9,4%</div>
            </div>
            <div className="dash-kpi-card">
              <div className="dash-kpi-label">Judul dibaca · 30 hari</div>
              <div className="dash-kpi-value">
                142<small>/320</small>
              </div>
              <div className="dash-kpi-delta" style={{ color: "rgba(240,237,230,0.35)" }}>
                44% judul dibaca dalam periode
              </div>
            </div>
            <div className="dash-kpi-card">
              <div className="dash-kpi-label">Transfer berikutnya</div>
              <div className="dash-kpi-value">5 {nextTransferMonth}</div>
              <div className="dash-kpi-delta" style={{ color: "var(--amber)" }}>
                Contoh jadwal · nilai mengikuti settlement
              </div>
            </div>
          </div>

          {/* Grid 2: Top 5 Books & Rising Genres */}
          <div className="dash-grid2">
            <div className="dash-panel">
              <div className="dash-panel-head">
                <div>
                  <div className="dash-panel-title">Judul paling banyak dibaca</div>
                  <div className="dash-panel-sub">Contoh · 30 hari terakhir</div>
                </div>
                <span className="dash-pill">Top 5</span>
              </div>
              <div className="dash-book-list">
                <div className="dash-book-row">
                  <span className="dash-book-name">Judul A</span>
                  <div className="dash-book-track">
                    <div className="dash-book-fill" style={{ width: "100%", background: "var(--forest-lll)" }} />
                  </div>
                  <span className="dash-book-val">12.4k</span>
                </div>
                <div className="dash-book-row">
                  <span className="dash-book-name">Judul B</span>
                  <div className="dash-book-track">
                    <div className="dash-book-fill" style={{ width: "79%", background: "var(--forest-lll)" }} />
                  </div>
                  <span className="dash-book-val">9.8k</span>
                </div>
                <div className="dash-book-row">
                  <span className="dash-book-name">Judul C</span>
                  <div className="dash-book-track">
                    <div className="dash-book-fill" style={{ width: "58%", background: "var(--amber)" }} />
                  </div>
                  <span className="dash-book-val">7.2k</span>
                </div>
                <div className="dash-book-row">
                  <span className="dash-book-name">Judul D</span>
                  <div className="dash-book-track">
                    <div className="dash-book-fill" style={{ width: "41%", background: "var(--amber)" }} />
                  </div>
                  <span className="dash-book-val">5.1k</span>
                </div>
                <div className="dash-book-row">
                  <span className="dash-book-name">Judul E</span>
                  <div className="dash-book-track">
                    <div className="dash-book-fill" style={{ width: "26%", background: "var(--coral)" }} />
                  </div>
                  <span className="dash-book-val">3.2k</span>
                </div>
              </div>
            </div>

            <div className="dash-panel">
              <div className="dash-panel-head">
                <div>
                  <div className="dash-panel-title">Genre yang sedang naik</div>
                  <div className="dash-panel-sub">Tren minat pembaca</div>
                </div>
                <span className="dash-pill dash-pill-teal">Contoh</span>
              </div>
              <div className="dash-genre">
                <div className="dash-gchip">
                  <span>Sastra Indonesia</span>
                  <b className="dash-up">▲ +34%</b>
                </div>
                <div className="dash-gchip">
                  <span>Self-development</span>
                  <b className="dash-up">▲ +28%</b>
                </div>
                <div className="dash-gchip">
                  <span>Bisnis &amp; Keuangan</span>
                  <b className="dash-up">▲ +19%</b>
                </div>
                <div className="dash-gchip">
                  <span>Fiksi Populer</span>
                  <b className="dash-up">▲ +12%</b>
                </div>
                <div className="dash-gchip">
                  <span>Sains</span>
                  <b className="dash-flat">— stabil</b>
                </div>
                <div className="dash-gchip">
                  <span>Anak &amp; Remaja</span>
                  <b className="dash-up">▲ +9%</b>
                </div>
              </div>
              <div className="dash-insight" style={{ marginTop: 14 }}>
                Minat <b>Sastra Indonesia</b> naik tajam — pertimbangkan cetak ulang atau akuisisi naskah di genre ini.
              </div>
            </div>
          </div>

          {/* Collection Utilization */}
          <div className="dash-panel" style={{ marginBottom: 16 }}>
            <div className="dash-panel-head">
              <div>
                <div className="dash-panel-title">Utilisasi koleksi — hidupkan backlist yang &ldquo;tidur&rdquo;</div>
                <div className="dash-panel-sub">320 judul terdaftar · 142 dibaca dalam 30 hari</div>
              </div>
              <span className="dash-pill dash-pill-coral">Peluang</span>
            </div>
            <div className="dash-util">
              <div className="dash-util-active" style={{ width: "44%" }}>
                44% Dibaca
              </div>
              <div className="dash-util-idle">56% Tidak dibaca dalam 30 hari</div>
            </div>
            <div className="dash-insight">
              Sebagian besar katalog Anda punya potensi yang belum tergali. Lewat fitur <b>Featured Book</b>  dan rekomendasi AI BUKOO, judul yang &ldquo;tidur&rdquo; bisa diaktifkan kembali — menghidupkan pendapatan dari aset yang selama ini pasif, tanpa biaya cetak tambahan.
            </div>
          </div>

          {/* Grid 2: Royalty Trend & Transfer History */}
          <div className="dash-grid2">
            <div className="dash-panel">
              <div className="dash-panel-head">
                <div>
                  <div className="dash-panel-title">Tren royalti 6 bulan</div>
                  <div className="dash-panel-sub">Contoh ilustratif · {trendPeriod} (juta Rupiah)</div>
                </div>
              </div>
              <div className="dash-trend">
                {[38, 48, 57, 69, 84, 100].map((height, index) => (
                  <div className="dash-tbar" key={trendMonths[index].toISOString()}>
                    <div className="dash-tbar-fill" style={{ height: `${height}%` }} />
                    <span className="dash-tbar-label">{formatMonth(trendMonths[index])}</span>
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
                  <tr>
                    <td>{formatMonth(transferMonths[0])}</td>
                    <td><span className="dash-badge-paid">Terbayar</span></td>
                    <td className="r">Rp 132 jt</td>
                  </tr>
                  <tr>
                    <td>{formatMonth(transferMonths[1])}</td>
                    <td><span className="dash-badge-paid">Terbayar</span></td>
                    <td className="r">Rp 109 jt</td>
                  </tr>
                  <tr>
                    <td>{formatMonth(transferMonths[2])}</td>
                    <td><span className="dash-badge-paid">Terbayar</span></td>
                    <td className="r">Rp 90 jt</td>
                  </tr>
                  <tr>
                    <td>{formatMonth(transferMonths[3])}</td>
                    <td><span className="dash-badge-paid">Terbayar</span></td>
                    <td className="r">Rp 76 jt</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Transparency Disclaimer */}
          <div className="dash-disc">
            <b>Catatan transparansi.</b> Seluruh angka &amp; grafik di halaman ini adalah <b>contoh ilustratif</b> untuk menggambarkan struktur dashboard, bukan data atau janji pembayaran untuk penerbit tertentu. Data aktual tersedia di dashboard mitra setelah judul tayang di BUKOO; nilai final mengikuti settlement resmi &amp; perjanjian.
          </div>

          {/* Call to Action Band */}
          <div className="dash-cta">
            <h3>Dashboard ini menanti katalog Anda</h3>
            <p>Setiap penerbit mitra mendapat akses dashboard real-time seperti ini sejak buku pertama tayang.</p>
            <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
              <PublisherRegisterTrigger callbackUrl="/publisher/dashboard" className="dash-cta-btn">
                Buat akun portal penerbit &rarr;
              </PublisherRegisterTrigger>
              <PublisherLoginTrigger callbackUrl="/publisher/dashboard" className="btn-ghost btn-lg">
                Masuk ke Dashboard
              </PublisherLoginTrigger>
              <Link href="/publisher/submit" className="btn-ghost btn-lg">
                Submit Judul
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
