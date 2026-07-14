import React from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Dashboard Royalti",
};

export default async function PublisherDashboardPage() {
  const session = await auth();
  const user = session?.user;

  if (!user || (user as any).role !== "PUBLISHER") {
    redirect("/login");
  }

  const name = user.name || "Gramedia Pustaka Utama";

  // 1. Total books registered by this publisher
  const totalBooks = await prisma.book.count({
    where: { publisherUserId: user.id },
  });

  // 2. Total active books (books with at least 1 reading progress record)
  const activeBooks = await prisma.book.count({
    where: {
      publisherUserId: user.id,
      readingProgress: { some: {} },
    },
  });

  // 3. Total reading progress sessions (completed sessions >= 80%)
  const totalSessions = await prisma.readingProgress.count({
    where: {
      book: { publisherUserId: user.id },
      progressPercent: { gte: 80 },
    },
  });

  // 4. Total reads on the entire platform (completed sessions >= 80%)
  const platformTotalSessions = await prisma.readingProgress.count({
    where: {
      progressPercent: { gte: 80 },
    },
  }) || 1; // avoid division by zero

  // Let's compute dynamic royalty parameters:
  const grossRevenue = 573000000; // Mock platform gross revenue (Rp 573 Juta)
  const poolRate = 0.65; // 65% revenue pool
  const revenuePool = grossRevenue * poolRate;

  // Check if we should fall back to demo/seeded data if the publisher database is empty
  const isDemo = totalBooks === 0;

  const displayTotalSessions = isDemo ? 18500 : totalSessions;
  const displayPlatformSessions = isDemo ? 29000 : platformTotalSessions;
  const displayTotalBooks = isDemo ? 1000 : totalBooks;
  const displayActiveBooks = isDemo ? 400 : activeBooks;
  const displayInactiveBooks = displayTotalBooks - displayActiveBooks;

  const shareBaca = displayTotalSessions / displayPlatformSessions;
  const porsiPool = revenuePool * shareBaca;
  const tierRate = 0.65; // 65% contractual tier
  const finalRoyalty = porsiPool * tierRate;

  // Format currency helpers
  const formatRupiah = (val: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);

  const formatJuta = (val: number) => {
    return (val / 1000000).toFixed(2) + " Jt";
  };

  const avgReadsPerActiveBook = displayActiveBooks > 0 ? (displayTotalSessions / displayActiveBooks).toFixed(2) : "0";

  return (
    <>
      {/* topbar */}
      <header className="topbar">
        <div className="topbar-left">
          <div className="topbar-title">Dashboard Royalti</div>
          <div className="topbar-sub">{name} · Periode Januari 2026</div>
        </div>
        <div className="topbar-right">
          <button className="btn-outline">📅 Ganti Periode</button>
          <button className="btn-outline">🔄 Refresh Data</button>
          <button className="btn-export">⬇️ Export PDF</button>
        </div>
      </header>

      {/* main content */}
      <main className="main">
        {isDemo && (
          <div className="alert info" style={{ marginBottom: "24px" }}>
            <span className="alert-icon">💡</span>
            <div>
              <strong>Mode Demo Diaktifkan:</strong> Karena akun penerbit Anda belum mengunggah buku atau mencatat sesi membaca, kami menampilkan data simulasi berkinerja tinggi (seperti template Gramedia Pustaka Utama) untuk meninjau kalkulasi royalti. Unggah buku baru di menu Koleksi Buku untuk mengaktifkan pelacakan nyata.
            </div>
          </div>
        )}

        {/* Hero banner */}
        <div className="hero-banner fade-in">
          <div>
            <div className="hero-eyebrow">Total Royalti Bulan Ini</div>
            <div className="hero-amount">{formatRupiah(finalRoyalty)}</div>
            <div className="hero-label">Royalti Final yang Ditransfer ke Rekening Mitra Penerbit</div>
            <div className="hero-formula">
              <span className="f-pill highlight" data-tip="Total pendapatan BUKOO dari semua subscriber">
                Gross Revenue: {formatRupiah(grossRevenue)}
              </span>
              <span className="f-op">×</span>
              <span className="f-pill" data-tip="Porsi yang dialokasikan untuk penerbit">
                65% Pool
              </span>
              <span className="f-op">×</span>
              <span className="f-pill" data-tip="Proporsi baca penerbit dari total platform">
                {(shareBaca * 100).toFixed(2)}% Share Baca
              </span>
              <span className="f-op">×</span>
              <span className="f-pill" data-tip="Hak royalti kontraktual mitra">
                65% Tier
              </span>
              <span className="f-op">=</span>
              <span className="f-pill highlight">{formatRupiah(finalRoyalty)}</span>
            </div>
          </div>
          <div className="hero-stats">
            <div className="hero-stat-item c-teal">
              <div className="hsi-label">Total Buku Dibaca</div>
              <div className="hsi-val">{displayTotalSessions.toLocaleString("id-ID")}</div>
              <div className="hsi-sub">dari {displayActiveBooks} judul aktif</div>
            </div>
            <div className="hero-stat-item c-amber">
              <div className="hsi-label">Royalti per Judul Terdaftar</div>
              <div className="hsi-val">{formatRupiah(finalRoyalty / displayTotalBooks)}</div>
              <div className="hsi-sub">dari {displayTotalBooks} judul di platform</div>
            </div>
            <div className="hero-stat-item c-coral">
              <div className="hsi-label">Royalti per Sesi Baca Selesai</div>
              <div className="hsi-val">{formatRupiah(finalRoyalty / displayTotalSessions)}</div>
              <div className="hsi-sub">per pembacaan ≥80% halaman</div>
            </div>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="kpi-grid">
          <div className="kpi-card k-forest fade-in fade-in-d1">
            <span className="kpi-icon">📚</span>
            <div className="kpi-label">Judul di Platform</div>
            <div className="kpi-val">{displayTotalBooks}</div>
            <div className="kpi-sub">Total koleksi terdaftar</div>
            <div className="kpi-trend neutral">= Target terpenuhi</div>
          </div>
          <div className="kpi-card k-amber fade-in fade-in-d2">
            <span className="kpi-icon">📖</span>
            <div className="kpi-label">Judul Aktif Dibaca</div>
            <div className="kpi-val">{displayActiveBooks}</div>
            <div className="kpi-sub">Memiliki ≥1 pembacaan selesai</div>
            <div className="kpi-trend down">
              ▼ {((displayActiveBooks / displayTotalBooks) * 100).toFixed(0)}% dari koleksi
            </div>
          </div>
          <div className="kpi-card k-teal fade-in fade-in-d3">
            <span className="kpi-icon">✅</span>
            <div className="kpi-label">Total Sesi Baca Selesai</div>
            <div className="kpi-val">{displayTotalSessions.toLocaleString("id-ID")}</div>
            <div className="kpi-sub">Threshold ≥80% halaman</div>
            <div className="kpi-trend up">▲ +12% vs bulan lalu</div>
          </div>
          <div className="kpi-card k-coral fade-in fade-in-d4">
            <span className="kpi-icon">💰</span>
            <div className="kpi-label">Royalti Final (Rp)</div>
            <div className="kpi-val" style={{ fontSize: "20px" }}>
              {formatJuta(finalRoyalty)}
            </div>
            <div className="kpi-sub">Transfer tgl 5 Februari 2026</div>
            <div className="kpi-trend up">▲ +9.3% vs bulan lalu</div>
          </div>
        </div>

        {/* Waterfall and Calculations layout */}
        <div className="three-col">
          {/* calculation logic */}
          <div className="card fade-in">
            <div className="card-header">
              <div>
                <div className="section-label">Transparansi Kalkulasi</div>
                <div className="card-title">Alur Perhitungan Royalti</div>
                <div className="card-sub">Setiap langkah dapat diverifikasi</div>
              </div>
              <span className="card-badge badge-forest">6 Langkah</span>
            </div>
            <div className="card-body">
              <div className="calc-steps">
                <div className="calc-step">
                  <div className="step-num">1</div>
                  <div className="step-content">
                    <div className="step-title">Gross Revenue Platform BUKOO</div>
                    <div className="step-desc">Total pendapatan dari 15.000 subscriber aktif dengan mix tier berbeda.</div>
                    <div className="step-formula">
                      <span className="var">Subscriber Tier Baca</span>: <span className="num">5.250</span> × Rp 19.900 = Rp 104.475.000<br />
                      <span className="var">Subscriber Tier Plus</span>: <span className="num">6.750</span> × Rp 49.900 = Rp 336.825.000<br />
                      <span className="var">Subscriber Tier Prem</span>: <span className="num">3.000</span> × Rp 79.900 = Rp 239.700.000<br />
                      <span className="result">Gross Revenue = {formatRupiah(grossRevenue)}</span>
                    </div>
                  </div>
                </div>

                <div className="step-connector"></div>

                <div className="calc-step">
                  <div className="step-num">2</div>
                  <div className="step-content">
                    <div className="step-title">Revenue Pool Royalti (65%)</div>
                    <div className="step-desc">BUKOO mengalokasikan 65% gross revenue untuk membayar semua penerbit mitra.</div>
                    <div className="step-formula">
                      <span className="var">Revenue Pool</span> = {formatRupiah(grossRevenue)} × <span className="num">65%</span><br />
                      <span className="result">Revenue Pool = {formatRupiah(revenuePool)}</span><br />
                      <span className="var">Biaya Operasional BUKOO</span> = {formatRupiah(grossRevenue * 0.35)}
                    </div>
                  </div>
                </div>

                <div className="step-connector"></div>

                <div className="calc-step">
                  <div className="step-num">3</div>
                  <div className="step-content">
                    <div className="step-title">Total Baca Semua Penerbit</div>
                    <div className="step-desc">Jumlah sesi baca selesai dari seluruh penerbit di platform bulan ini.</div>
                    <div className="step-formula">
                      <span className="var">{name} (Mitra)</span>: <span className="num">{displayTotalSessions.toLocaleString("id-ID")}</span> pembacaan<br />
                      {isDemo && (
                        <>
                          <span className="var">Mizan Group</span>: <span className="num">8.200</span> pembacaan<br />
                          <span className="var">Bentang Pustaka</span>: <span className="num">2.300</span> pembacaan<br />
                        </>
                      )}
                      <span className="result">Total Baca Platform = {displayPlatformSessions.toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                </div>

                <div className="step-connector"></div>

                <div className="calc-step">
                  <div className="step-num">4</div>
                  <div className="step-content">
                    <div className="step-title">Proporsi Pembacaan Mitra</div>
                    <div className="step-desc">Bobot distribusi berdasarkan pembacaan aktual, bukan jumlah judul terdaftar.</div>
                    <div className="step-formula">
                      <span className="var">Share Baca</span> = {displayTotalSessions.toLocaleString("id-ID")} ÷ {displayPlatformSessions.toLocaleString("id-ID")}<br />
                      <span className="result">Share Baca {name} = {(shareBaca * 100).toFixed(2)}%</span>
                    </div>
                  </div>
                </div>

                <div className="step-connector"></div>

                <div className="calc-step">
                  <div className="step-num">5</div>
                  <div className="step-content">
                    <div className="step-title">Porsi Revenue Pool Mitra</div>
                    <div className="step-desc">Bagian revenue pool yang menjadi hak mitra sebelum dikali tier royalti.</div>
                    <div className="step-formula">
                      <span className="var">Porsi Pool</span> = {formatRupiah(revenuePool)} × <span className="num">{(shareBaca * 100).toFixed(2)}%</span><br />
                      <span className="result">Porsi Pool {name} = {formatRupiah(porsiPool)}</span>
                    </div>
                  </div>
                </div>

                <div className="step-connector"></div>

                <div className="calc-step">
                  <div className="step-num">6</div>
                  <div className="step-content">
                    <div className="step-title">Royalti Final (× Tier 65%)</div>
                    <div className="step-desc">Persentase tier royalti kontraktual yang disepakati dalam kontrak kerjasama.</div>
                    <div className="step-formula">
                      <span className="var">Royalti Final</span> = {formatRupiah(porsiPool)} × <span className="num">65%</span><br />
                      <span className="result">✦ Royalti Final = {formatRupiah(finalRoyalty)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Waterfall & Charts */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="card fade-in">
              <div className="card-header">
                <div>
                  <div className="card-title">Waterfall Royalti</div>
                  <div className="card-sub">Dari Gross Revenue ke Pembayaran Final</div>
                </div>
              </div>
              <div className="card-body">
                <div className="waterfall">
                  <div className="wf-row">
                    <div className="wf-label"><span className="wf-label-icon">💳</span> Gross Revenue</div>
                    <div className="wf-bar-wrap">
                      <div className="wf-bar bar-gross" style={{ width: "100%" }}>
                        <div className="wf-bar-inner"></div>
                      </div>
                    </div>
                    <div>
                      <div className="wf-val val-green font-mono" style={{ fontSize: "12px" }}>{formatRupiah(grossRevenue)}</div>
                      <div className="wf-pct">100%</div>
                    </div>
                  </div>

                  <div className="wf-row">
                    <div className="wf-label"><span className="wf-label-icon">⚙️</span> Biaya Operasional</div>
                    <div className="wf-bar-wrap">
                      <div className="wf-bar bar-opex" style={{ width: "35%" }}>
                        <div className="wf-bar-inner"></div>
                      </div>
                    </div>
                    <div>
                      <div className="wf-val val-red font-mono" style={{ fontSize: "12px" }}>({formatRupiah(grossRevenue * 0.35)})</div>
                      <div className="wf-pct">−35%</div>
                    </div>
                  </div>

                  <div className="wf-row">
                    <div className="wf-label"><span className="wf-label-icon">📦</span> Revenue Pool (65%)</div>
                    <div className="wf-bar-wrap">
                      <div className="wf-bar bar-pool" style={{ width: "65%" }}>
                        <div className="wf-bar-inner"></div>
                      </div>
                    </div>
                    <div>
                      <div className="wf-val val-amber font-mono" style={{ fontSize: "12px" }}>{formatRupiah(revenuePool)}</div>
                      <div className="wf-pct">65%</div>
                    </div>
                  </div>

                  <div className="wf-row">
                    <div className="wf-label"><span className="wf-label-icon">📊</span> × Share Baca</div>
                    <div className="wf-bar-wrap">
                      <div className="wf-bar bar-share" style={{ width: `${(shareBaca * 65).toFixed(0)}%` }}>
                        <div className="wf-bar-inner"></div>
                      </div>
                    </div>
                    <div>
                      <div className="wf-val val-teal font-mono" style={{ fontSize: "12px" }}>{formatRupiah(porsiPool)}</div>
                      <div className="wf-pct">{(shareBaca * 100).toFixed(1)}% Share</div>
                    </div>
                  </div>

                  <div className="wf-row">
                    <div className="wf-label"><span className="wf-label-icon">📑</span> × Tier Contract</div>
                    <div className="wf-bar-wrap">
                      <div className="wf-bar bar-tier" style={{ width: `${(shareBaca * 65 * 0.65).toFixed(0)}%` }}>
                        <div className="wf-bar-inner"></div>
                      </div>
                    </div>
                    <div>
                      <div className="wf-val val-sky font-mono" style={{ fontSize: "12px" }}>{formatRupiah(finalRoyalty)}</div>
                      <div className="wf-pct">65% Tier</div>
                    </div>
                  </div>

                  <div className="wf-row total-row">
                    <div className="wf-label fw-700" style={{ color: "var(--forest)" }}>
                      <span className="wf-label-icon">🏦</span> Royalti Final
                    </div>
                    <div className="wf-bar-wrap">
                      <div className="wf-bar bar-final" style={{ width: `${(shareBaca * 65 * 0.65).toFixed(0)}%` }}>
                        <div className="wf-bar-inner"></div>
                      </div>
                    </div>
                    <div>
                      <div className="wf-val font-mono" style={{ color: "var(--forest)", fontSize: "13px", fontWeight: 700 }}>
                        {formatRupiah(finalRoyalty)}
                      </div>
                      <div className="wf-pct" style={{ color: "var(--forest)" }}>
                        ✦ Ditransfer 5 Feb
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Distribution */}
            <div className="card fade-in">
              <div className="card-header">
                <div className="card-title">Share Pembacaan Platform</div>
                <div className="card-sub">Total {displayPlatformSessions.toLocaleString("id-ID")} sesi baca selesai bulan ini</div>
              </div>
              <div className="card-body">
                <div className="donut-wrap">
                  <svg width="130" height="130" className="donut-svg" viewBox="0 0 42 42">
                    <circle cx="21" cy="21" r="15.9" fill="none" stroke="#E5E0D8" strokeWidth="5" />
                    <circle
                      cx="21"
                      cy="21"
                      r="15.9"
                      fill="none"
                      stroke="#1E4035"
                      strokeWidth="5"
                      strokeDasharray={`${(shareBaca * 100).toFixed(2)} ${100 - shareBaca * 100}`}
                      strokeDashoffset="25"
                    />
                    <text x="21" y="21" textAnchor="middle" fontSize="6" fontWeight="700" fill="#1E4035" fontFamily="Georgia">
                      {(shareBaca * 100).toFixed(0)}%
                    </text>
                  </svg>
                  <div className="donut-legend">
                    <div className="legend-item">
                      <div className="legend-dot" style={{ backgroundColor: "var(--forest)" }}></div>
                      <div className="legend-text" style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", maxWidth: "80px" }}>{name}</div>
                      <div className="legend-val">
                        {displayTotalSessions.toLocaleString("id-ID")}
                        <span className="legend-pct">{(shareBaca * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                    {isDemo && (
                      <>
                        <div className="legend-item">
                          <div className="legend-dot" style={{ backgroundColor: "var(--teal)" }}></div>
                          <div className="legend-text">Mizan</div>
                          <div className="legend-val">
                            8.200
                            <span className="legend-pct">28,3%</span>
                          </div>
                        </div>
                        <div className="legend-item">
                          <div className="legend-dot" style={{ backgroundColor: "var(--amber)" }}></div>
                          <div className="legend-text">Bentang</div>
                          <div className="legend-val">
                            2.300
                            <span className="legend-pct">7,9%</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Active/Inactive Analysis */}
        <div className="two-col">
          <div className="card fade-in">
            <div className="card-header">
              <div>
                <div className="section-label">Analisis Koleksi</div>
                <div className="card-title">Koleksi Judul: Aktif vs Tidak Aktif</div>
                <div className="card-sub">
                  {displayActiveBooks} judul dibaca · {displayInactiveBooks} judul belum terjangkau pembaca
                </div>
              </div>
              <span className="card-badge badge-amber">Januari 2026</span>
            </div>
            <div className="card-body">
              {displayInactiveBooks > 0 && (
                <div className="alert warn">
                  <span className="alert-icon">⚠️</span>
                  <div>
                    <strong>{displayInactiveBooks} judul ({((displayInactiveBooks / displayTotalBooks) * 100).toFixed(0)}%) belum dibaca sama sekali</strong> bulan ini. Buku yang tidak terbaca tidak menghasilkan royalti dalam model pembayaran berbasis pembacaan BUKOO.
                  </div>
                </div>
              )}

              <div className="inactive-summary">
                <div className="inactive-card">
                  <div className="inactive-num text-teal">{displayActiveBooks}</div>
                  <div className="inactive-label">Judul Aktif Dibaca</div>
                </div>
                <div className="inactive-card">
                  <div className="inactive-num" style={{ color: "var(--coral)" }}>
                    {displayInactiveBooks}
                  </div>
                  <div className="inactive-label">Judul Tidak Dibaca</div>
                </div>
                <div className="inactive-card">
                  <div className="inactive-num text-amber">{avgReadsPerActiveBook}</div>
                  <div className="inactive-label">Rata-rata Baca / Judul Aktif</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card fade-in">
            <div className="card-header">
              <div>
                <div className="section-label">Tindakan Rekomendasi</div>
                <div className="card-title">Maksimalkan Pendapatan Royalti</div>
                <div className="card-sub">Strategi untuk menaikkan volume membaca</div>
              </div>
            </div>
            <div className="card-body">
              <div className="calc-steps">
                <div className="calc-step">
                  <div className="step-num">📢</div>
                  <div className="step-content">
                    <div className="step-title" style={{ color: "var(--forest)" }}>Promosikan Koleksi Non-Aktif</div>
                    <div className="step-desc">
                      Tingkatkan visibilitas {displayInactiveBooks} buku yang belum terbaca dengan menambahkan tagar dan genre yang relevan di metadata buku Anda.
                    </div>
                  </div>
                </div>
                <div className="calc-step">
                  <div className="step-num">🆕</div>
                  <div className="step-content">
                    <div className="step-title" style={{ color: "var(--forest)" }}>Unggah Buku Baru Berpotensi Tinggi</div>
                    <div className="step-desc">
                      Pembaca menyukai konten segar. Tambahkan judul-judul terlaris Anda yang baru terbit langsung dari panel kemitraan.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
