import React from "react";
import Link from "next/link";
import { PublisherNav } from "@/components/publisher/PublisherNav";
import { DaftarForm } from "./DaftarForm";

export const metadata = {
  title: "BUKOO — Daftar Penerbit Mitra",
  description: "Bergabung sebagai mitra penerbit BUKOO. Jangkau jutaan pembaca digital di Indonesia dengan model pembagian hasil yang adil dan transparan.",
};

export default function PublisherDaftarPage() {
  return (
    <div className="pub-page-wrap">
      <PublisherNav currentTab="daftar" />

      {/* Hero Section */}
      <section className="pub-hero">
        <div className="pub-hero-bg" />
        <div className="pub-wrap">
          <span className="pub-eyebrow">Kemitraan Penerbit BUKOO</span>
          <h1 className="pub-h1">
            Bawa karya Anda ke <em>jutaan pembaca</em> digital Indonesia
          </h1>
          <p className="pub-lead">
            BUKOO membantu penerbit independen hingga rumah terbit nasional mendistribusikan karya secara digital dengan <strong>model royalti transparan, perlindungan DRM berlapis, dan dashboard analytics real-time</strong>.
          </p>
          <div className="pub-hero-ctas">
            <a href="#form-daftar" className="btn-cta btn-lg">Daftar Sekarang →</a>
            <Link href="/publisher/royalti" className="btn-ghost btn-lg">Pelajari Kebijakan Royalti</Link>
          </div>
        </div>
      </section>

      {/* Why Join Section */}
      <section className="pub-sec">
        <div className="pub-wrap">
          <div className="pub-sec-head center">
            <span className="pub-eyebrow">Keunggulan Kemitraan</span>
            <h2 className="pub-h2">Mengapa menerbitkan buku di <em>BUKOO</em>?</h2>
            <p className="pub-sec-desc">
              Kami membangun ekosistem yang menghargai hak cipta dan kerja keras para penerbit serta penulis.
            </p>
          </div>

          <div className="pub-grid3">
            <div className="pub-card">
              <div className="pub-card-icon">💰</div>
              <h3>Royalti Transparan 60%</h3>
              <p>
                Dapatkan pembagian hasil hingga 60% dari setiap bacaan dan pembelian. Laporan keuangan dapat diakses kapan saja dari dashboard Anda.
              </p>
            </div>
            <div className="pub-card">
              <div className="pub-card-icon">🔒</div>
              <h3>Perlindungan DRM Kelas Dunia</h3>
              <p>
                Naskah EPUB & PDF Anda dilindungi enkripsi AES-256 dan DRM dinamis untuk mencegah pembajakan dan penggandaan ilegal.
              </p>
            </div>
            <div className="pub-card">
              <div className="pub-card-icon">📊</div>
              <h3>Dashboard Analytics Real-Time</h3>
              <p>
                Ketahui judul yang paling banyak dibaca, tingkat penuntasan bab, hingga demografi pembaca untuk strategi penerbitan berikutnya.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Form Section */}
      <section className="pub-sec alt" id="form-daftar">
        <div className="pub-wrap">
          <div className="pub-contact-grid">
            <div>
              <span className="pub-eyebrow">Formulir Pendaftaran</span>
              <h2 className="pub-h2">Mulai langkah pertama <em>hari ini</em></h2>
              <p className="pub-sec-desc">
                Isi formulir pendaftaran di bawah ini. Tim partnership BUKOO akan meninjau profil penerbit Anda dan menghubungi dalam 1x24 jam kerja.
              </p>
              <div className="pub-checklist" style={{ marginTop: 24 }}>
                <li><b>Gratis biaya pendaftaran</b> tanpa komitmen tersembunyi</li>
                <li><b>Proses verifikasi cepat</b> dalam 24 jam</li>
                <li><b>Bantuan teknis komprehensif</b> untuk konversi format EPUB</li>
              </div>
            </div>

            <DaftarForm />
          </div>
        </div>
      </section>
    </div>
  );
}
