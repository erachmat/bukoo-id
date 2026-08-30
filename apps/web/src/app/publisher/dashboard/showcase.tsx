import React from "react";
import Link from "next/link";
import { PublisherNav } from "@/components/publisher/PublisherNav";

export function PublisherDashboardShowcase() {
  return (
    <div className="pub-page-wrap">
      <PublisherNav currentTab="dashboard" />

      {/* Hero Section */}
      <section className="phero" style={{ paddingBottom: 40 }}>
        <div className="phero-bg" />
        <div className="phero-grid" />
        <div className="pub-wrap">
          <span className="dash-note">● Contoh tampilan · data ilustratif (platform rilis 3 Sep 2026)</span>
          <br />
          <span className="eyebrow">Publisher Dashboard</span>
          <h1 className="ph-h1">
            Lihat <em>bagaimana</em> pembaca membaca Anda
          </h1>
          <p className="ph-lead">
            Penjualan fisik hanya memberi tahu apa yang terjual. Dashboard penerbit BUKOO memberi tahu apa yang benar-benar <strong>dibaca, dituntaskan, dan diminati</strong> — insight yang mengubah cara Anda mengambil keputusan bisnis.
          </p>
        </div>
      </section>

      {/* KPI & Interactive Preview Section */}
      <section className="pub-sec" style={{ paddingTop: 20 }}>
        <div className="pub-wrap">
          {/* KPI Cards */}
          <div className="dash-kpi">
            <div className="dash-kpi-card dash-kpi-amber">
              <div className="dash-kpi-label">Royalti bulan ini</div>
              <div className="dash-kpi-value">
                Rp 148<small> jt</small>
              </div>
              <div className="dash-kpi-delta dash-kpi-up">▲ +12% vs bulan lalu</div>
            </div>
            <div className="dash-kpi-card">
              <div className="dash-kpi-label">Total sesi baca</div>
              <div className="dash-kpi-value">
                86<small>.240</small>
              </div>
              <div className="dash-kpi-delta dash-kpi-up">▲ +9,4%</div>
            </div>
            <div className="dash-kpi-card">
              <div className="dash-kpi-label">Judul aktif dibaca</div>
              <div className="dash-kpi-value">
                142<small>/320</small>
              </div>
              <div className="dash-kpi-delta" style={{ color: "rgba(240,237,230,0.35)" }}>
                44% katalog aktif
              </div>
            </div>
            <div className="dash-kpi-card">
              <div className="dash-kpi-label">Transfer berikutnya</div>
              <div className="dash-kpi-value">Tgl 5</div>
              <div className="dash-kpi-delta" style={{ color: "var(--amber)" }}>
                Rp 148 jt terjadwal
              </div>
            </div>
          </div>

          {/* Grid 2: Top 5 Books & Rising Genres */}
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
                <span className="dash-pill dash-pill-teal">Live</span>
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
                <div className="dash-panel-sub">320 judul terdaftar · 142 aktif</div>
              </div>
              <span className="dash-pill dash-pill-coral">Peluang</span>
            </div>
            <div className="dash-util">
              <div className="dash-util-active" style={{ width: "44%" }}>
                44% Aktif Dibaca
              </div>
              <div className="dash-util-idle">56% Belum Tersentuh</div>
            </div>
            <div className="dash-insight">
              Sebagian besar katalog Anda punya potensi yang belum tergali. Lewat fitur <b>Featured Book</b> dan rekomendasi AI BUKOO, judul yang &ldquo;tidur&rdquo; bisa diaktifkan kembali — menghidupkan pendapatan dari aset yang selama ini pasif, tanpa biaya cetak tambahan.
            </div>
          </div>

          {/* Grid 2: Royalty Trend & Transfer History */}
          <div className="dash-grid2">
            <div className="dash-panel">
              <div className="dash-panel-head">
                <div>
                  <div className="dash-panel-title">Tren royalti 6 bulan</div>
                  <div className="dash-panel-sub">Ilustrasi pertumbuhan (juta Rupiah)</div>
                </div>
              </div>
              <div className="dash-trend">
                <div className="dash-tbar">
                  <div className="dash-tbar-fill" style={{ height: "38%" }} />
                  <span className="dash-tbar-label">Sep</span>
                </div>
                <div className="dash-tbar">
                  <div className="dash-tbar-fill" style={{ height: "48%" }} />
                  <span className="dash-tbar-label">Okt</span>
                </div>
                <div className="dash-tbar">
                  <div className="dash-tbar-fill" style={{ height: "57%" }} />
                  <span className="dash-tbar-label">Nov</span>
                </div>
                <div className="dash-tbar">
                  <div className="dash-tbar-fill" style={{ height: "69%" }} />
                  <span className="dash-tbar-label">Des</span>
                </div>
                <div className="dash-tbar">
                  <div className="dash-tbar-fill" style={{ height: "84%" }} />
                  <span className="dash-tbar-label">Jan</span>
                </div>
                <div className="dash-tbar">
                  <div className="dash-tbar-fill" style={{ height: "100%" }} />
                  <span className="dash-tbar-label">Feb</span>
                </div>
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
                    <td>Januari 2026</td>
                    <td><span className="dash-badge-paid">Terbayar</span></td>
                    <td className="r">Rp 132 jt</td>
                  </tr>
                  <tr>
                    <td>Desember 2025</td>
                    <td><span className="dash-badge-paid">Terbayar</span></td>
                    <td className="r">Rp 109 jt</td>
                  </tr>
                  <tr>
                    <td>November 2025</td>
                    <td><span className="dash-badge-paid">Terbayar</span></td>
                    <td className="r">Rp 90 jt</td>
                  </tr>
                  <tr>
                    <td>Oktober 2025</td>
                    <td><span className="dash-badge-paid">Terbayar</span></td>
                    <td className="r">Rp 76 jt</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Transparency Disclaimer */}
          <div className="dash-disc">
            <b>Catatan transparansi.</b> Seluruh angka &amp; grafik di halaman ini adalah <b>contoh ilustratif</b> untuk menggambarkan struktur dashboard. Data pembaca aktual tersedia setelah peluncuran platform pada 3 September 2026.
          </div>

          {/* Call to Action Band */}
          <div className="dash-cta">
            <h3>Dashboard ini menanti katalog Anda</h3>
            <p>Setiap penerbit mitra mendapat akses dashboard real-time seperti ini sejak buku pertama tayang.</p>
            <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
              <Link href="/publisher/register" className="dash-cta-btn">
                Daftar sebagai penerbit &rarr;
              </Link>
              <Link href="/publisher/login?callbackUrl=/publisher/dashboard" className="btn-ghost btn-lg">
                Masuk ke Dashboard
              </Link>
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
