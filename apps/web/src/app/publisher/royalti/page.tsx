import React from "react";
import { PublisherNav } from "@/components/publisher/PublisherNav";
import "../publisher.css";

export const metadata = {
  title: "BUKOO — Kebijakan & Laporan Royalti",
  description: "Model royalti penerbit BUKOO yang adil, transparan, dan dibayarkan secara berkala setiap bulan.",
};

export default function PublisherRoyaltiPage() {
  return (
    <div className="pub-page-wrap">
      <PublisherNav currentTab="royalti" />

      {/* Hero Section */}
      <section className="pub-hero">
        <div className="pub-hero-bg" />
        <div className="pub-wrap">
          <span className="pub-eyebrow">Kebijakan &amp; Skema Pembagian Hasil</span>
          <h1 className="pub-h1">
            Model royalti yang <em>transparan dan adil</em>
          </h1>
          <p className="pub-lead">
            Di BUKOO, penerbit mendapatkan <strong>pembagian hasil 60%</strong> dari pendapatan bersih langganan dan penjualan e-book. Tanpa potongan tersembunyi, ditransfer tepat waktu setiap tanggal 5.
          </p>
        </div>
      </section>

      {/* Royalty Calculation Breakdown */}
      <section className="pub-sec">
        <div className="pub-wrap">
          <div className="pub-sec-head center">
            <span className="pub-eyebrow">Bagaimana Royalti Dihitung?</span>
            <h2 className="pub-h2">Dua skema pendapatan <em>penerbit</em></h2>
          </div>

          <div className="pub-grid2">
            <div className="pub-card">
              <div className="pub-pill pub-pill-teal" style={{ marginBottom: 12 }}>Model Langganan BUKOO Unlimited</div>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 22, color: "#fff", marginBottom: 10 }}>
                Pool Halaman Dibaca (Read-Pool)
              </h3>
              <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.7, marginBottom: 16 }}>
                60% dari seluruh pendapatan langganan bulanan BUKOO dimasukkan ke dalam Pool Royalti Mitra. Penerbit menerima pembagian proporsional berdasarkan <b>jumlah total halaman aktual yang dituntaskan oleh pembaca</b>.
              </p>
              <div className="pub-callout">
                <b>Contoh:</b> Jika total bacaan buku Anda menyumbang 5% dari total halaman yang dibaca seluruh pengguna BUKOO bulan ini, Anda menerima 5% dari total Pool Royalti.
              </div>
            </div>

            <div className="pub-card">
              <div className="pub-pill" style={{ marginBottom: 12 }}>Model Pembelian A la Carte</div>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 22, color: "#fff", marginBottom: 10 }}>
                Penjualan Satuan (Single Purchase)
              </h3>
              <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.7, marginBottom: 16 }}>
                Untuk buku yang dijual secara satuan atau edisi terbatas, penerbit menerima <b>60% bersih dari harga jual e-book</b> setelah dikurangi pajak sesuai ketentuan berlaku.
              </p>
              <div className="pub-disc">
                <b>Transparansi Pajak:</b> BUKOO menerbitkan bukti potong PPh Pasal 23 / PPh Pasal 21 secara otomatis di dashboard penerbit Anda setiap bulan.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Payout Schedule Section */}
      <section className="pub-sec alt">
        <div className="pub-wrap">
          <div className="pub-sec-head center">
            <span className="pub-eyebrow">Jadwal Pencairan Saldo</span>
            <h2 className="pub-h2">Rutin ditransfer setiap <em>tanggal 5</em></h2>
            <p className="pub-sec-desc">
              Pencairan royalti dilakukan otomatis ke rekening bank resmi penerbit di Indonesia tanpa ambang batas minimum pencairan yang menyulitkan.
            </p>
          </div>

          <div className="pub-steps s3">
            <div className="step">
              <div className="d">1</div>
              <h4>Penutupan Periode</h4>
              <p>Setiap akhir bulan (tgl 30/31), sistem membekukan total halaman dibaca dan transaksi.</p>
            </div>
            <div className="step">
              <div className="d">2</div>
              <h4>Verifikasi &amp; Laporan</h4>
              <p>Tanggal 1-3, laporan audit otomatis diterbitkan dan dapat ditinjau di dashboard.</p>
            </div>
            <div className="step">
              <div className="d">3</div>
              <h4>Transfer Bank</h4>
              <p>Tanggal 5, saldo royalti dikirimkan langsung ke rekening bank penerbit mitra.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
