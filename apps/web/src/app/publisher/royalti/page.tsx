import React from "react";
import { PublisherNav } from "@/components/publisher/PublisherNav";
import { RoyaltiCalculator } from "./RoyaltiCalculator";
import { RoyaltiFaq } from "./RoyaltiFaq";

export const metadata = {
  title: "BUKOO — Kebijakan Royalti",
  description: "Model royalti penerbit BUKOO yang adil, transparan, dan dibayarkan secara berkala setiap bulan.",
};

export default function PublisherRoyaltiPage() {
  return (
    <div className="pub-page-wrap">
      <PublisherNav currentTab="royalti" />

      {/* Hero Section */}
      <section className="phero" style={{ paddingBottom: 40 }}>
        <div className="phero-bg" />
        <div className="phero-grid" />
        <div className="pub-wrap">
          <span className="eyebrow">Kebijakan Royalti</span>
          <h1 className="ph-h1">
            Bagi hasil yang <em>adil</em> dan transparan penuh
          </h1>
          <p className="ph-lead">
            Kami tidak menyembunyikan cara royalti dihitung. Formulanya sederhana, terbuka, dan dapat Anda pantau setiap saat lewat dashboard penerbit.
          </p>
        </div>
      </section>

      {/* Formula, Tiers, Guarantees Section */}
      <section className="pub-sec" style={{ paddingTop: 24 }}>
        <div className="pub-wrap">
          <div className="formula">
            <span className="v">Royalti Anda</span> <span className="op">=</span> Revenue Pool{" "}
            <span className="op">&times;</span> <span className="v">Porsi Pembacaan</span>{" "}
            <span className="op">&times;</span> <span className="v">Tier %</span>
          </div>

          <div className="pub-sec-head" style={{ marginBottom: 24 }}>
            <span className="eyebrow">Tiga Tier Bagi Hasil</span>
            <h2 className="pub-h2">
              Semakin dalam komitmen, semakin tinggi <em>bagian Anda</em>
            </h2>
          </div>

          <div className="tiers">
            <div className="tier t1">
              <div className="tier-top">
                <div className="tier-pct">
                  65<span style={{ fontSize: 20 }}>%</span>
                </div>
                <span className="tier-badge">Big Publisher</span>
              </div>
              <h4>Penerbit Besar</h4>
              <p>Katalog luas, judul unggulan, komitmen eksklusif. Tier bagi hasil tertinggi.</p>
            </div>

            <div className="tier t2">
              <div className="tier-top">
                <div className="tier-pct">
                  55<span style={{ fontSize: 20 }}>%</span>
                </div>
                <span className="tier-badge">Growth</span>
              </div>
              <h4>Penerbit Menengah</h4>
              <p>Katalog berkembang dengan judul kuat di genre spesifik. Tier menengah yang kompetitif.</p>
            </div>

            <div className="tier t3">
              <div className="tier-top">
                <div className="tier-pct">
                  50<span style={{ fontSize: 20 }}>%</span>
                </div>
                <span className="tier-badge">Partner</span>
              </div>
              <h4>Penerbit Mitra Baru</h4>
              <p>Titik awal kerjasama. Tier naik seiring performa katalog &amp; komitmen jangka panjang.</p>
            </div>
          </div>

          <div className="guar">
            <div className="guar-c">
              <div className="guar-i">🗓️</div>
              <div>
                <h5>Transfer tanggal 5</h5>
                <p>Royalti dibayar rutin tiap tanggal 5, tanpa penundaan.</p>
              </div>
            </div>
            <div className="guar-c">
              <div className="guar-i">📈</div>
              <div>
                <h5>Dashboard real-time</h5>
                <p>Pantau pembacaan, share, &amp; royalti berjalan kapan saja.</p>
              </div>
            </div>
            <div className="guar-c">
              <div className="guar-i">🤝</div>
              <div>
                <h5>60&ndash;70% ke penerbit</h5>
                <p>Janji tetap. Kami transparan soal angka, sekarang &amp; selamanya.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="pub-sec alt">
        <div className="pub-wrap">
          <div className="pub-sec-head center">
            <span className="eyebrow">Ilustrasi Potensi</span>
            <h2 className="pub-h2">
              Perkirakan potensi <em>royalti Anda</em>
            </h2>
            <p className="pub-sec-desc">
              Geser untuk melihat bagaimana skala pelanggan &amp; porsi pembacaan memengaruhi royalti bulanan. Semua angka bersifat ilustratif.
            </p>
          </div>

          <RoyaltiCalculator />

          <div className="disc" style={{ marginTop: 28 }}>
            <b>Catatan transparansi (Radikal Transparansi BUKOO).</b> Aplikasi rilis 3 September 2026 &mdash; angka di atas adalah <b>ilustrasi berbasis asumsi</b>, bukan jaminan pendapatan. Asumsi: ARPU campuran Rp 45.000/pelanggan berbayar/bulan; revenue pool 65% dari gross; royalti = pool &times; porsi pembacaan &times; tier. Angka nyata bergantung jumlah pelanggan aktual, perilaku baca, &amp; komposisi katalog.
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="pub-sec">
        <div className="pub-wrap">
          <div className="pub-sec-head center">
            <span className="eyebrow">Pertanyaan Umum</span>
            <h2 className="pub-h2">
              FAQ <em>Royalti</em>
            </h2>
          </div>

          <RoyaltiFaq />
        </div>
      </section>
    </div>
  );
}

