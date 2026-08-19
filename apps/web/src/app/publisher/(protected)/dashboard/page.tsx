import React from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { PublisherNav } from "@/components/publisher/PublisherNav";

export const metadata = {
  title: "BUKOO — Publisher Dashboard",
  description: "Dashboard penerbit BUKOO memberi tahu apa yang benar-benar dibaca, dituntaskan, dan diminati pembaca.",
};

const topBooks = [
  { name: "Judul A", pct: 100, val: "12.4k", color: "var(--forest-lll)" },
  { name: "Judul B", pct: 79, val: "9.8k", color: "var(--forest-lll)" },
  { name: "Judul C", pct: 58, val: "7.2k", color: "var(--amber)" },
  { name: "Judul D", pct: 41, val: "5.1k", color: "var(--amber)" },
  { name: "Judul E", pct: 26, val: "3.2k", color: "#FF6B4A" },
];

const genres = [
  { name: "Sastra Indonesia", trend: "▲ +34%", cls: "up" },
  { name: "Self-development", trend: "▲ +28%", cls: "up" },
  { name: "Bisnis & Keuangan", trend: "▲ +19%", cls: "up" },
  { name: "Fiksi Populer", trend: "▲ +12%", cls: "up" },
  { name: "Sains", trend: "— stabil", cls: "flat" },
  { name: "Anak & Remaja", trend: "▲ +9%", cls: "up" },
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
  const isPublisher = user && (user as { role?: string }).role === "PUBLISHER";

  return (
    <div className="pub-page-wrap">
      <PublisherNav currentTab="dashboard" />

      {/* Hero Section */}
      <section className="phero" style={{ paddingBottom: 40 }}>
        <div className="phero-bg" />
        <div className="phero-grid" />
        <div className="pub-wrap">
          <span className="dash-note">● Contoh tampilan &middot; data ilustratif (platform rilis 3 Sep 2026)</span>
          <br />
          <span className="eyebrow">Publisher Dashboard</span>
          <h1 className="ph-h1">
            Lihat <em>bagaimana</em> pembaca membaca Anda
          </h1>
          <p className="ph-lead">
            Penjualan fisik hanya memberi tahu apa yang terjual. Dashboard penerbit BUKOO memberi tahu apa yang benar-benar{" "}
            <strong>dibaca, dituntaskan, dan diminati</strong> &mdash; insight yang mengubah cara Anda mengambil keputusan bisnis.
          </p>
        </div>
      </section>

      {/* Dashboard Main Section */}
      <section className="pub-sec" style={{ paddingTop: 20 }}>
        <div className="pub-wrap">
          {/* KPI Cards */}
          <div className="kpi">
            <div className="kpi-c kpi-amber">
              <div className="kpi-l">Royalti bulan ini</div>
              <div className="kpi-v">
                Rp 148<small> jt</small>
              </div>
              <div className="kpi-d kpi-up">&blacktriangle; +12% vs bulan lalu</div>
            </div>
            <div className="kpi-c">
              <div className="kpi-l">Total sesi baca</div>
              <div className="kpi-v">
                86<small>.240</small>
              </div>
              <div className="kpi-d kpi-up">&blacktriangle; +9,4%</div>
            </div>
            <div className="kpi-c">
              <div className="kpi-l">Judul aktif dibaca</div>
              <div className="kpi-v">
                142<small>/320</small>
              </div>
              <div className="kpi-d" style={{ color: "rgba(240,237,230,0.35)" }}>
                44% katalog aktif
              </div>
            </div>
            <div className="kpi-c">
              <div className="kpi-l">Transfer berikutnya</div>
              <div className="kpi-v">Tgl 5</div>
              <div className="kpi-d" style={{ color: "var(--amber)" }}>
                Rp 148 jt terjadwal
              </div>
            </div>
          </div>

          {/* Grid 2: Top books & Rising genres */}
          <div className="pub-grid2" style={{ marginBottom: 16 }}>
            <div className="panel">
              <div className="panel-h">
                <div>
                  <div className="panel-t">Judul paling banyak dibaca</div>
                  <div className="panel-s">Periode contoh &middot; 30 hari terakhir</div>
                </div>
                <span className="pub-pill">Top 5</span>
              </div>
              <div className="blist">
                {topBooks.map((b) => (
                  <div className="brow" key={b.name}>
                    <span className="bname">{b.name}</span>
                    <div className="btrack">
                      <div className="bfill" style={{ width: `${b.pct}%`, background: b.color }} />
                    </div>
                    <span className="bval">{b.val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel">
              <div className="panel-h">
                <div>
                  <div className="panel-t">Genre yang sedang naik</div>
                  <div className="panel-s">Tren minat pembaca</div>
                </div>
                <span className="pub-pill pub-pill-teal">Live</span>
              </div>
              <div className="genre">
                {genres.map((g) => (
                  <div className="gchip" key={g.name}>
                    <span>{g.name}</span>
                    <b className={g.cls}>{g.trend}</b>
                  </div>
                ))}
              </div>
              <div className="insight" style={{ marginTop: 14 }}>
                Minat <b>Sastra Indonesia</b> naik tajam &mdash; pertimbangkan cetak ulang atau akuisisi naskah di genre ini.
              </div>
            </div>
          </div>

          {/* Collection Utilization */}
          <div className="panel" style={{ marginBottom: 16 }}>
            <div className="panel-h">
              <div>
                <div className="panel-t">Utilisasi koleksi &mdash; hidupkan backlist yang &ldquo;tidur&rdquo;</div>
                <div className="panel-s">320 judul terdaftar &middot; 142 aktif</div>
              </div>
              <span className="pub-pill" style={{ color: "#FF6B4A", borderColor: "rgba(255,107,74,0.3)" }}>
                Peluang
              </span>
            </div>
            <div className="util">
              <div className="util-a" style={{ width: "44%" }}>
                44% Aktif Dibaca
              </div>
              <div className="util-s">56% Belum Tersentuh</div>
            </div>
            <div className="insight">
              Sebagian besar katalog Anda punya potensi yang belum tergali. Lewat fitur <b>Featured Book</b> dan rekomendasi AI BUKOO, judul yang &ldquo;tidur&rdquo; bisa diaktifkan kembali &mdash; menghidupkan pendapatan dari aset yang selama ini pasif, tanpa biaya cetak tambahan.
            </div>
          </div>

          {/* Grid 2: Royalty trend & Transfer history */}
          <div className="pub-grid2">
            <div className="panel">
              <div className="panel-h">
                <div>
                  <div className="panel-t">Tren royalti 6 bulan</div>
                  <div className="panel-s">Ilustrasi pertumbuhan (juta Rupiah)</div>
                </div>
              </div>
              <div className="trend-chart">
                {royaltyTrend.map((m) => (
                  <div className="tbar" key={m.label}>
                    <div className="tbar-fill" style={{ height: `${m.height}%` }} />
                    <span className="tbar-lbl">{m.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel">
              <div className="panel-h">
                <div>
                  <div className="panel-t">Riwayat transfer</div>
                  <div className="panel-s">Dibayar rutin tanggal 5</div>
                </div>
              </div>
              <table className="ttable">
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
                      <td>
                        <span className="badge-paid">Terbayar</span>
                      </td>
                      <td className="r">{t.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Transparency note */}
          <div className="disc" style={{ marginTop: 20 }}>
            <b>Catatan transparansi.</b> Seluruh angka &amp; grafik di halaman ini adalah <b>contoh ilustratif</b> untuk menggambarkan struktur dashboard. Data pembaca aktual tersedia setelah peluncuran platform pada 3 September 2026.
          </div>

          {/* CTA band */}
          <div className="cta-band">
            <h3>Dashboard ini menanti katalog Anda</h3>
            <p>Setiap penerbit mitra mendapat akses dashboard real-time seperti ini sejak buku pertama tayang.</p>
            {isPublisher ? (
              <Link href="/publisher/books/new" className="btn-cta btn-lg">
                Unggah buku pertama Anda &rarr;
              </Link>
            ) : (
              <Link href="/publisher/daftar#daftar" className="btn-cta btn-lg">
                Daftar sebagai penerbit &rarr;
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
