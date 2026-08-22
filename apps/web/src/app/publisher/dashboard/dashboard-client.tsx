"use client";

import React, { useState } from "react";
import { DashboardShell } from "../(protected)/dashboard-shell";

interface DashboardClientProps {
  user: { name?: string | null; email?: string | null } | null;
}

// ── static data ──────────────────────────────────────────────
const monthlyBars = [
  { val: "128k", h: 50, bg: "rgba(0,201,167,0.20)", mon: "Jan" },
  { val: "142k", h: 55, bg: "rgba(0,201,167,0.25)", mon: "Feb" },
  { val: "156k", h: 60, bg: "rgba(0,201,167,0.30)", mon: "Mar" },
  { val: "168k", h: 65, bg: "rgba(0,201,167,0.35)", mon: "Apr" },
  { val: "179k", h: 69, bg: "rgba(0,201,167,0.42)", mon: "Mei" },
  { val: "198k", h: 76, bg: "rgba(0,201,167,0.52)", mon: "Jun" },
  { val: "222k", h: 85, bg: "rgba(0,201,167,0.68)", mon: "Jul" },
  { val: "248k", h: 96, bg: "var(--pds-teal)", mon: "Ags ▲", hi: true },
];

const topBooks = [
  { rank: "gold", cover: "pds-bk-laut",    lbl: "LAUT",   title: "Laut Bercerita",       author: "Leila S. Chudori",        reads: "42.841" },
  { rank: "gold", cover: "pds-bk-atomic",  lbl: "ATOMIC", title: "Atomic Habits (ID)",    author: "James Clear · Terjemahan",reads: "38.124" },
  { rank: "silver",cover: "pds-bk-bumi",   lbl: "BUMI",   title: "Bumi Manusia",          author: "Pramoedya Ananta Toer",   reads: "29.556" },
  { rank: "silver",cover: "pds-bk-sapiens",lbl: "SAPI",   title: "Sapiens (ID)",          author: "Y. N. Harari · Terjemahan",reads:"24.210" },
  { rank: "bronze",cover: "pds-bk-think",  lbl: "THINK",  title: "Think & Grow Rich",     author: "Napoleon Hill",           reads: "18.933" },
  { rank: "bronze",cover: "pds-bk-richdad",lbl: "RICH",   title: "Rich Dad Poor Dad",     author: "Robert Kiyosaki",         reads: "17.445" },
];

const royaltyRows = [
  { title:"Laut Bercerita",    reads:"42.841", roy:"Rp 85,7 Jt", chg:"▲18%", chgCls:"pds-up" },
  { title:"Atomic Habits (ID)",reads:"38.124", roy:"Rp 76,2 Jt", chg:"▲22%", chgCls:"pds-up" },
  { title:"Bumi Manusia",      reads:"29.556", roy:"Rp 59,1 Jt", chg:"▲9%",  chgCls:"pds-up" },
  { title:"Sapiens (ID)",      reads:"24.210", roy:"Rp 48,4 Jt", chg:"▼3%",  chgCls:"pds-down" },
];
const royaltyRows2 = [
  { title:"Think & Grow Rich", reads:"18.933", roy:"Rp 37,9 Jt", chg:"▲14%", chgCls:"pds-up" },
  { title:"Rich Dad Poor Dad", reads:"17.445", roy:"Rp 34,9 Jt", chg:"▲6%",  chgCls:"pds-up" },
  { title:"7 Kebiasaan Efektif",reads:"14.220",roy:"Rp 28,4 Jt", chg:"▲11%", chgCls:"pds-up" },
  { title:"Ikigai (ID)",       reads:"11.503", roy:"Rp 23,0 Jt", chg:"▼1%",  chgCls:"pds-down" },
];

const geoData = [
  { city:"Jakarta",    w:88, bg:"var(--pds-teal)",     val:"88,2k" },
  { city:"Surabaya",   w:52, bg:"var(--pds-sky)",      val:"52,1k" },
  { city:"Bandung",    w:44, bg:"var(--pds-amber)",    val:"44,7k" },
  { city:"Yogyakarta", w:38, bg:"var(--pds-coral)",    val:"38,4k" },
  { city:"Medan",      w:28, bg:"var(--pds-lavender)", val:"28,1k" },
  { city:"Makassar",   w:18, bg:"rgba(255,255,255,0.25)", val:"18,5k" },
];

const demoBars = [
  { age:"18–24 th", w:82, color:"var(--pds-teal)" },
  { age:"25–34 th", w:64, color:"var(--pds-sky)" },
  { age:"35–44 th", w:38, color:"var(--pds-amber)" },
  { age:"45–54 th", w:22, color:"var(--pds-coral)" },
  { age:"55+ th",   w:12, color:"rgba(255,255,255,0.2)" },
];

const catalogBooks = [
  { cover:"pds-bk-laut",    lbl:"LAUT BERCERITA",   title:"Laut Bercerita",    author:"Leila S. Chudori",    reads:"42.841", rating:"4,8", status:"live" },
  { cover:"pds-bk-atomic",  lbl:"ATOMIC HABITS",    title:"Atomic Habits (ID)",author:"James Clear",         reads:"38.124", rating:"4,9", status:"live" },
  { cover:"pds-bk-bumi",    lbl:"BUMI MANUSIA",     title:"Bumi Manusia",      author:"Pramoedya A. Toer",   reads:"29.556", rating:"4,9", status:"live" },
  { cover:"pds-bk-sapiens", lbl:"SAPIENS",          title:"Sapiens (ID)",      author:"Y. N. Harari",        reads:"24.210", rating:"4,8", status:"live" },
  { cover:"pds-bk-think",   lbl:"THINK & GROW RICH",title:"Think & Grow Rich", author:"Napoleon Hill",       reads:"18.933", rating:"4,7", status:"live" },
  { cover:"pds-bk-richdad", lbl:"RICH DAD",         title:"Rich Dad Poor Dad", author:"Robert Kiyosaki",     reads:"17.445", rating:"4,6", status:"live" },
  { cover:"pds-bk-7hab",    lbl:"7 HABITS",         title:"7 Kebiasaan Efektif",author:"Stephen Covey",      reads:"14.220", rating:"4,5", status:"live" },
  { cover:"pds-bk-ikigai",  lbl:"IKIGAI",           title:"Ikigai (ID)",       author:"Héctor García",       reads:"11.503", rating:"4,6", status:"live" },
  { cover:"pds-bk-g",       lbl:"PULANG",           title:"Pulang",            author:"Tere Liye",           reads:"9.870",  rating:"4,7", status:"review" },
  { cover:"pds-bk-g",       lbl:"CANTIK ITU LUKA",  title:"Cantik Itu Luka",   author:"Eka Kurniawan",       reads:"8.412",  rating:"4,8", status:"draft" },
];

const notifications = [
  { ic:"📈", bg:"rgba(52,211,153,0.14)",  title:"Atomic Habits masuk Top 3 minggu ini",     desc:"Naik 18% dibanding bulan lalu. Pertimbangkan promosi lanjutan.", time:"2 jam lalu",          unread:true },
  { ic:"💰", bg:"rgba(201,149,42,0.14)",  title:"Payout Ags 2026 dijadwalkan",              desc:"Rp 284,2 Juta akan cair 5 Sep 2026 ke rekening BCA •••4821.",   time:"5 jam lalu",          unread:true },
  { ic:"✅", bg:"rgba(75,163,227,0.14)",  title:"\"Pulang\" (Tere Liye) lolos review",      desc:"Buku telah aktif di katalog dan tersedia untuk pembaca.",        time:"Kemarin, 14:20",      unread:true },
  { ic:"⚠️", bg:"rgba(255,107,107,0.12)", title:"37 judul tanpa sampul HD",                 desc:"Perbarui sampul beresolusi tinggi untuk meningkatkan impresi.", time:"Kemarin, 09:05",      unread:true },
  { ic:"🎯", bg:"rgba(167,139,250,0.14)", title:"Kampanye \"Sastra Nusantara\" berjalan baik",desc:"+6.540 pembacaan tambahan sejauh ini. Berakhir 25 Ags.",       time:"2 hari lalu",         unread:false },
  { ic:"💵", bg:"rgba(0,201,167,0.12)",   title:"Payout Jul 2026 telah cair",               desc:"Rp 271,0 Juta berhasil ditransfer ke rekening BCA •••4821.",    time:"5 Ags 2026",          unread:false },
];

// ── helper chip ───────────────────────────────────────────────
function Chip({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    live:   { cls: "pds-chip-live",   label: "Aktif" },
    review: { cls: "pds-chip-review", label: "Review" },
    draft:  { cls: "pds-chip-draft",  label: "Draft" },
    off:    { cls: "pds-chip-off",    label: "Nonaktif" },
  };
  const { cls, label } = map[status] ?? map.draft;
  return (
    <span className={`pds-chip ${cls}`}>
      <span className="pds-dotk" />
      {label}
    </span>
  );
}

// ── page: overview ────────────────────────────────────────────
function PageOverview({ onTabChange }: { onTabChange: (t: string) => void }) {
  return (
    <>
      <div className="pds-page-head">
        <div>
          <div className="pds-page-title">Selamat datang, Gramedia Pustaka Utama</div>
          <div className="pds-page-sub">Data terupdate: Hari ini, 22 Agu 2026 · 09:41 WIB · Periode Ags 2026</div>
        </div>
        <div className="pds-head-actions">
          <button className="pds-btn pds-btn-ghost">📥 Unduh Laporan</button>
          <button className="pds-btn pds-btn-primary" onClick={() => window.location.href = "/publisher/books/new"}>+ Upload Buku Baru</button>
        </div>
      </div>

      <div className="pds-alert">
        <span className="ic">🔔</span>
        <span className="txt"><strong>Atomic Habits (ID)</strong> masuk Top 3 buku terbanyak dibaca minggu ini — naik 18% dari bulan lalu. Pertimbangkan promosi lanjutan.</span>
        <button className="cta" onClick={() => onTabChange("promosi")}>Lihat detail →</button>
      </div>

      <div className="pds-kpi-row">
        <div className="pds-kpi teal"><div className="pds-kpi-label">Total Pembaca Bulan Ini</div><div className="pds-kpi-num">247.832</div><div className="pds-kpi-chg pds-up">▲ 18,4% vs bulan lalu</div></div>
        <div className="pds-kpi amber"><div className="pds-kpi-label">Pendapatan Royalti (Ags)</div><div className="pds-kpi-num">Rp 284 Jt</div><div className="pds-kpi-chg pds-up">▲ 22,1% YoY</div></div>
        <div className="pds-kpi coral"><div className="pds-kpi-label">Tingkat Selesai Baca</div><div className="pds-kpi-num">67,3%</div><div className="pds-kpi-chg pds-up">▲ 4,2 poin</div></div>
        <div className="pds-kpi sky"><div className="pds-kpi-label">Judul Aktif di Platform</div><div className="pds-kpi-num">1.847</div><div className="pds-kpi-chg pds-up">▲ 12 judul baru</div></div>
      </div>

      {/* Monthly trend + Top books */}
      <div className="pds-grid pds-mb14" style={{ gridTemplateColumns: "1.6fr 1fr", alignItems: "start" }}>
        <div className="pds-panel">
          <div className="pds-panel-title">📈 Tren Pembacaan Bulanan (Total Buku Dibaca)<span className="tag">Jan–Ags 2026</span></div>
          <div className="pds-chart">
            {monthlyBars.map((b) => (
              <div className="pds-cbar-wrap" key={b.mon}>
                <div className="pds-cval" style={b.hi ? { color: "var(--pds-teal)" } : {}}>{b.val}</div>
                <div className="pds-cbar" style={{ height: `${b.h}%`, background: b.bg }} />
                <div className="pds-cmon" style={b.hi ? { color: "var(--pds-teal)", fontWeight: 700 } : {}}>{b.mon}</div>
              </div>
            ))}
          </div>
          <div className="pds-chart-legend">
            <div className="pds-leg"><div className="sw" style={{ background: "var(--pds-teal)" }} />Total dibaca</div>
            <div className="pds-leg">YTD 2026: 1.641.000 pembacaan total</div>
          </div>
        </div>

        <div className="pds-panel">
          <div className="pds-panel-title">🏆 Top Buku Bulan Ini<button className="more" onClick={() => onTabChange("performa")}>Lihat semua →</button></div>
          <div className="pds-tbl-scroll">
            <table className="pds-tbl">
              <tbody>
                {topBooks.map((b) => (
                  <tr key={b.title}>
                    <td style={{ width: 24 }}><div className={`pds-rank ${b.rank}`}>{topBooks.indexOf(b) + 1}</div></td>
                    <td style={{ width: 34 }}><div className={`pds-thumb ${b.cover}`}>{b.lbl}</div></td>
                    <td><div className="t-main">{b.title}</div><div className="t-sub">{b.author}</div></td>
                    <td className="r"><div className="t-main num" style={{ color: "var(--pds-teal)" }}>{b.reads}</div><div className="t-sub">pembacaan</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Genre + Geo + Demographics */}
      <div className="pds-grid pds-g3 pds-mb14">
        <div className="pds-panel">
          <div className="pds-panel-title">🎯 Distribusi Genre Dibaca</div>
          <div className="pds-donut-wrap">
            <div className="pds-donut" style={{ background: "conic-gradient(var(--pds-teal) 0 38%,var(--pds-amber) 38% 61%,var(--pds-coral) 61% 75%,var(--pds-sky) 75% 87%,rgba(255,255,255,0.14) 87% 100%)" }}>
              <div className="dctr"><b>38%</b><span>Self-Dev</span></div>
            </div>
            <div className="pds-dleg">
              {[["var(--pds-teal)","Self-Dev","38%"],["var(--pds-amber)","Novel/Fiksi","23%"],["var(--pds-coral)","Bisnis","14%"],["var(--pds-sky)","Sains","12%"],["rgba(255,255,255,0.25)","Lainnya","13%"]].map(([c,n,p]) => (
                <div className="li" key={n}><div className="sw" style={{ background: c }} /><div className="nm">{n}</div><div className="pc">{p}</div></div>
              ))}
            </div>
          </div>
        </div>

        <div className="pds-panel">
          <div className="pds-panel-title">🗺️ Sebaran Pembaca (Kota)<button className="more" onClick={() => onTabChange("geo")}>Peta →</button></div>
          {geoData.map((g) => (
            <div className="pds-geo-row" key={g.city}>
              <div className="pds-geo-label">{g.city}</div>
              <div className="pds-track" style={{ flex: 1 }}><div className="fill" style={{ width: `${g.w}%`, background: g.bg }} /></div>
              <div className="pds-geo-val">{g.val}</div>
            </div>
          ))}
          <div className="pds-muted-note">📍 Total 34 provinsi terjangkau</div>
        </div>

        <div className="pds-panel">
          <div className="pds-panel-title">👥 Demografi Pembaca<button className="more" onClick={() => onTabChange("demografi")}>Detail →</button></div>
          {demoBars.map((d) => (
            <div className="pds-demo-row" key={d.age}>
              <div className="pds-demo-lab">{d.age}</div>
              <div className="pds-track" style={{ flex: 1 }}><div className="fill" style={{ width: `${d.w}%`, background: d.color }} /></div>
              <div className="pds-demo-pc" style={{ color: d.color }}>{d.w}%</div>
            </div>
          ))}
          <div className="pds-divider" />
          <div className="pds-flex pds-jsb" style={{ marginBottom: 5 }}><span style={{ fontSize: 9.5, color: "var(--pds-dim)" }}>Perempuan</span><span style={{ fontSize: 9.5, fontWeight: 700, color: "#fff" }}>54,3%</span></div>
          <div className="pds-flex pds-jsb" style={{ marginBottom: 7 }}><span style={{ fontSize: 9.5, color: "var(--pds-dim)" }}>Laki-laki</span><span style={{ fontSize: 9.5, fontWeight: 700, color: "#fff" }}>45,7%</span></div>
          <div className="pds-track"><div className="fill" style={{ width: "54.3%", background: "linear-gradient(90deg,var(--pds-teal),var(--pds-sky))" }} /></div>
        </div>
      </div>

      {/* Revenue table */}
      <div className="pds-panel">
        <div className="pds-panel-title">💰 Rincian Pendapatan Royalti — Top 8 Buku
          <div className="pds-flex pds-ctr pds-gap8">
            <span className="tag">Model: 65% dari harga · tanpa cap</span>
            <button className="more" onClick={() => onTabChange("royalti")}>Selengkapnya →</button>
          </div>
        </div>
        <div className="pds-tbl-scroll">
          <table className="pds-tbl">
            <thead><tr><th>Judul Buku</th><th className="r">Dibaca</th><th className="r">Royalti</th><th className="r">Tren</th><th>Judul Buku</th><th className="r">Dibaca</th><th className="r">Royalti</th><th className="r">Tren</th></tr></thead>
            <tbody>
              {royaltyRows.map((r, i) => (
                <tr key={r.title}>
                  <td className="t-main">{r.title}</td>
                  <td className="r num">{r.reads}</td>
                  <td className="r num" style={{ color: "var(--pds-teal)" }}>{r.roy}</td>
                  <td className={`r ${r.chgCls}`}>{r.chg}</td>
                  <td className="t-main">{royaltyRows2[i]?.title}</td>
                  <td className="r num">{royaltyRows2[i]?.reads}</td>
                  <td className="r num" style={{ color: "var(--pds-teal)" }}>{royaltyRows2[i]?.roy}</td>
                  <td className={`r ${royaltyRows2[i]?.chgCls}`}>{royaltyRows2[i]?.chg}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pds-flex pds-jsb pds-ctr" style={{ marginTop: 12, borderTop: "1px solid rgba(201,149,42,0.2)", paddingTop: 12 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "#fff" }}>Total Royalti Bulan Ini</div>
          <div className="pds-flex pds-ctr pds-gap12">
            <div style={{ fontSize: 10, color: "var(--pds-dim)" }}>196.832 total pembacaan</div>
            <div style={{ fontFamily: "var(--pds-serif)", fontSize: 21, fontWeight: 700, color: "var(--pds-amber)" }}>Rp 284,2 Juta</div>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: "var(--pds-pos)" }}>▲ 22,1% YoY</div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── page: katalog (tab view) ──────────────────────────────────
function PageKatalog() {
  const [filter, setFilter] = useState("all");
  const filters = [
    { id: "all",    label: "Semua · 1.847" },
    { id: "live",   label: "Aktif · 1.792" },
    { id: "review", label: "Review · 31" },
    { id: "draft",  label: "Draft · 18" },
    { id: "off",    label: "Nonaktif · 6" },
  ];
  const visible = filter === "all" ? catalogBooks : catalogBooks.filter(b => b.status === filter);

  return (
    <>
      <div className="pds-page-head">
        <div><div className="pds-page-title">Katalog Buku</div><div className="pds-page-sub">1.847 judul aktif · kelola cover, status, dan ketersediaan</div></div>
        <div className="pds-head-actions">
          <input className="pds-search" placeholder="🔍 Cari judul, penulis, ISBN…" />
          <a href="/publisher/books/new" className="pds-btn pds-btn-primary">+ Upload Buku Baru</a>
        </div>
      </div>
      <div className="pds-flex pds-jsb pds-ctr pds-wrap pds-gap10 pds-mb14">
        <div className="pds-flex pds-gap8 pds-wrap">
          {filters.map(f => (
            <button key={f.id} className={`pds-pill-f${filter === f.id ? " on" : ""}`} onClick={() => setFilter(f.id)}>{f.label}</button>
          ))}
        </div>
      </div>
      <div className="pds-catalog-grid">
        {visible.map(b => (
          <div className="pds-book-card" key={b.title}>
            <div className={`pds-book-cover ${b.cover}`}>
              {b.lbl}
              <div className="pds-book-cover-badge"><Chip status={b.status} /></div>
            </div>
            <div className="pds-book-info">
              <div className="pds-book-title">{b.title}</div>
              <div className="pds-book-author">{b.author}</div>
              <div className="pds-book-meta">
                <span className="pds-book-reads">📖 {b.reads}</span>
                <span className="pds-book-rating">⭐ {b.rating}</span>
              </div>
              <div className="pds-flex pds-gap8" style={{ marginTop: 9 }}>
                <a href="/publisher/books" className="pds-btn pds-btn-line pds-btn-sm" style={{ flex: 1 }}>Edit</a>
                <button className="pds-btn pds-btn-ghost pds-btn-sm" style={{ flex: 1 }}>Statistik</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="pds-flex pds-jsb pds-ctr pds-mt14">
        <span style={{ fontSize: 9.5, color: "var(--pds-muted)" }}>Menampilkan {visible.length} dari 1.847 judul</span>
        <div className="pds-flex pds-gap8">
          <button className="pds-btn pds-btn-line pds-btn-sm">← Sebelumnya</button>
          <button className="pds-btn pds-btn-ghost pds-btn-sm">1</button>
          <button className="pds-btn pds-btn-line pds-btn-sm">2</button>
          <button className="pds-btn pds-btn-line pds-btn-sm">Berikutnya →</button>
        </div>
      </div>
    </>
  );
}

// ── page: notifikasi ──────────────────────────────────────────
function PageNotifikasi() {
  const [items, setItems] = useState(notifications);
  return (
    <>
      <div className="pds-page-head">
        <div><div className="pds-page-title">Notifikasi</div><div className="pds-page-sub">{items.filter(i => i.unread).length} belum dibaca · aktivitas terbaru akun penerbit Anda</div></div>
        <div className="pds-head-actions">
          <button className="pds-btn pds-btn-line" onClick={() => setItems(items.map(i => ({ ...i, unread: false })))}>✓ Tandai semua dibaca</button>
        </div>
      </div>
      <div className="pds-panel">
        {items.map((n, i) => (
          <div className={`pds-notif-item${n.unread ? " unread" : ""}`} key={i} onClick={() => setItems(items.map((x, j) => j === i ? { ...x, unread: false } : x))}>
            <div className="pds-notif-ic" style={{ background: n.bg }}>{n.ic}</div>
            <div className="pds-notif-body">
              <div className="pds-notif-t">{n.title}</div>
              <div className="pds-notif-d">{n.desc}</div>
              <div className="pds-notif-time">{n.time}</div>
            </div>
            {n.unread && <div className="pds-notif-dot" />}
          </div>
        ))}
      </div>
    </>
  );
}

// ── page: royalti ─────────────────────────────────────────────
function PageRoyalti() {
  const transfers = [
    { period:"Agustus 2026",   status:"Dijadwalkan", value:"Rp 284,2 Jt", pending:true },
    { period:"Juli 2026",      status:"Terbayar",    value:"Rp 271,0 Jt", pending:false },
    { period:"Juni 2026",      status:"Terbayar",    value:"Rp 248,5 Jt", pending:false },
    { period:"Mei 2026",       status:"Terbayar",    value:"Rp 231,8 Jt", pending:false },
  ];
  return (
    <>
      <div className="pds-page-head">
        <div><div className="pds-page-title">Royalti</div><div className="pds-page-sub">Pendapatan, transfer, dan rincian per judul · Model: 65% tanpa cap</div></div>
        <div className="pds-head-actions"><button className="pds-btn pds-btn-ghost">📥 Unduh Statement</button></div>
      </div>
      <div className="pds-kpi-row">
        <div className="pds-kpi amber"><div className="pds-kpi-label">Total Royalti Bulan Ini</div><div className="pds-kpi-num">Rp 284 Jt</div><div className="pds-kpi-chg pds-up">▲ 22,1% YoY</div></div>
        <div className="pds-kpi teal"><div className="pds-kpi-label">Payout Berikutnya</div><div className="pds-kpi-num">5 Sep</div><div className="pds-kpi-chg pds-flat">2026 · BCA •••4821</div></div>
        <div className="pds-kpi sky"><div className="pds-kpi-label">Total Pembacaan</div><div className="pds-kpi-num">196.832</div><div className="pds-kpi-chg pds-up">▲ 16,8% MoM</div></div>
        <div className="pds-kpi mint"><div className="pds-kpi-label">Royalti YTD 2026</div><div className="pds-kpi-num">Rp 1,5 M</div><div className="pds-kpi-chg pds-up">▲ 19% vs 2025</div></div>
      </div>
      <div className="pds-panel pds-mb14">
        <div className="pds-panel-title">💳 Riwayat Transfer</div>
        <div className="pds-tbl-scroll">
          <table className="pds-tbl">
            <thead><tr><th>Periode</th><th>Status</th><th className="r">Nilai</th><th>Bank</th></tr></thead>
            <tbody>
              {transfers.map(t => (
                <tr key={t.period}>
                  <td className="t-main">{t.period}</td>
                  <td><span className={`pds-chip ${t.pending ? "pds-chip-review" : "pds-chip-live"}`}><span className="pds-dotk"/>{t.status}</span></td>
                  <td className="r num" style={{ color: t.pending ? "var(--pds-amber-lt)" : "var(--pds-teal)" }}>{t.value}</td>
                  <td style={{ fontSize: 9.5, color: "var(--pds-dim)" }}>BCA •••4821</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="pds-panel">
        <div className="pds-panel-title">📊 Royalti per Judul — Ags 2026<span className="tag">65% dari harga langganan</span></div>
        <div className="pds-tbl-scroll">
          <table className="pds-tbl">
            <thead><tr><th>Judul Buku</th><th className="r">Pembacaan</th><th className="r">Royalti</th><th className="r">Tren MoM</th></tr></thead>
            <tbody>
              {[...royaltyRows,...royaltyRows2].map(r => (
                <tr key={r.title}>
                  <td className="t-main">{r.title}</td>
                  <td className="r num">{r.reads}</td>
                  <td className="r num" style={{ color: "var(--pds-teal)" }}>{r.roy}</td>
                  <td className={`r ${r.chgCls}`}>{r.chg}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
        <div style={{ fontSize: 12, color: "var(--pds-dim)" }}>Halaman ini menampilkan data ilustratif. Data aktual tersedia setelah peluncuran platform.</div>
      </div>
    </>
  );
}

// ── main dashboard client ─────────────────────────────────────
export function DashboardClient({ user }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const renderPage = () => {
    switch (activeTab) {
      case "overview":   return <PageOverview onTabChange={setActiveTab} />;
      case "katalog":    return <PageKatalog />;
      case "royalti":    return <PageRoyalti />;
      case "notifikasi": return <PageNotifikasi />;
      case "performa":   return <PagePlaceholder title="Performa Buku" sub="Analisis per judul — pembacaan, tingkat selesai, rating, dan tren" icon="📈" />;
      case "pembaca":    return <PagePlaceholder title="Pembaca" sub="Metrik retensi, frekuensi baca, dan loyalitas pembaca" icon="👥" />;
      case "demografi":  return <PagePlaceholder title="Demografi" sub="Profil usia, gender, dan segmen audiens Anda" icon="🧬" />;
      case "geo":        return <PagePlaceholder title="Sebaran Geografis" sub="Distribusi pembaca lintas kota & provinsi di Indonesia" icon="🗺️" />;
      case "waktu":      return <PagePlaceholder title="Waktu Baca" sub="Pola durasi, jam sibuk, dan ritme membaca audiens Anda" icon="⏱️" />;
      case "promosi":    return <PagePlaceholder title="Promosi & Kampanye" sub="Dorong pembacaan dengan slot unggulan, diskon, dan kampanye tematik" icon="📣" />;
      case "metadata":   return <PagePlaceholder title="Metadata" sub="Kelengkapan metadata menentukan seberapa mudah buku ditemukan" icon="📝" />;
      case "pengaturan": return <PagePlaceholder title="Pengaturan" sub="Profil penerbit, rekening pencairan, tim, dan preferensi akun" icon="⚙️" />;
      default:           return <PageOverview onTabChange={setActiveTab} />;
    }
  };

  return (
    <DashboardShell user={user ?? {}} activeTab={activeTab} onTabChange={setActiveTab}>
      {renderPage()}
    </DashboardShell>
  );
}
