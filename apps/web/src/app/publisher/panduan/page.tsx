import React from "react";
import Link from "next/link";
import { PublisherNav } from "@/components/publisher/PublisherNav";
import { PanduanFaq } from "./PanduanFaq";

export const metadata = {
  title: "BUKOO — Panduan Penerbit",
  description: "Semua yang perlu Anda tahu tentang bekerja sama dengan BUKOO — dari cara kerja kemitraan, alur onboarding, hingga royalti, kontrol katalog, dan perlindungan konten.",
};

export default function PublisherPanduanPage() {
  return (
    <div className="pub-page-wrap">
      <PublisherNav currentTab="panduan" />

      {/* Hero Section */}
      <section className="phero" style={{ paddingBottom: 40 }}>
        <div className="phero-bg" />
        <div className="phero-grid" />
        <div className="pub-wrap">
          <span className="eyebrow">Panduan Penerbit</span>
          <h1 className="ph-h1">
            Panduan lengkap <em>mitra penerbit</em> BUKOO
          </h1>
          <p className="ph-lead">
            Semua yang perlu Anda tahu tentang bekerja sama dengan BUKOO &mdash; dari cara kerja kemitraan, alur onboarding, hingga royalti, kontrol katalog, dan perlindungan konten.
          </p>
        </div>
      </section>

      {/* Guide Layout Section */}
      <section className="pub-sec" style={{ paddingTop: 24 }}>
        <div className="pub-wrap">
          <div className="guide-layout">
            {/* Sticky Table of Contents Sidebar */}
            <nav className="toc">
              <div className="toc-t">Daftar Isi</div>
              <a href="#cara">Cara kemitraan bekerja</a>
              <a href="#onboarding">Alur onboarding</a>
              <a href="#dashboard">Dashboard &amp; data</a>
              <a href="#royalti">Royalti &amp; pembayaran</a>
              <a href="#kontrol">Kontrol &amp; windowing</a>
              <a href="#proteksi">Perlindungan konten</a>
              <a href="#glosarium">Glosarium</a>
              <a href="#faq">FAQ</a>
            </nav>

            {/* Main Content Area */}
            <div>
              {/* Section 01 */}
              <div className="gsec" id="cara">
                <div className="gsec-n">01</div>
                <h3>Cara kemitraan bekerja</h3>
                <p>
                  BUKOO adalah platform langganan buku digital. Pembaca membayar biaya bulanan untuk akses ke katalog, dan sebagian besar pendapatan itu <strong>dibagikan kembali ke penerbit</strong> berdasarkan seberapa banyak karya Anda dibaca.
                </p>
                <p>
                  Prinsipnya sederhana: <strong>Anda menyediakan buku, kami menyediakan platform, pembaca, dan teknologi.</strong> Anda tidak menanggung biaya cetak, gudang, atau distribusi &mdash; dan tetap memegang kendali penuh atas katalog Anda.
                </p>
                <div className="callout">
                  <b>Inti filosofi kami:</b> BUKOO hadir untuk <b>menambah</b> kanal pendapatan Anda dan menjadi corong penemuan menuju penjualan fisik &mdash; bukan menggantikannya.
                </div>
              </div>

              {/* Section 02 */}
              <div className="gsec" id="onboarding">
                <div className="gsec-n">02</div>
                <h3>Alur onboarding</h3>
                <p>Dari pengajuan hingga buku tayang, prosesnya dipandu penuh oleh tim kami:</p>
                <ul>
                  <li>
                    <b>Pengajuan.</b> Daftar lewat halaman Daftar Penerbit, tim kemitraan menghubungi dalam 3 hari kerja.
                  </li>
                  <li>
                    <b>Kesepakatan.</b> Sepakati judul, tier bagi hasil, dan jendela rilis. Kontrak transparan tanpa klausul tersembunyi.
                  </li>
                  <li>
                    <b>Submit katalog.</b> Unggah judul &amp; metadata lewat halaman Submit Judul, atau serahkan ke tim kami untuk batch besar.
                  </li>
                  <li>
                    <b>Kurasi &amp; tayang.</b> Tim editorial meninjau (5&ndash;7 hari kerja), lalu buku tampil untuk pembaca.
                  </li>
                </ul>
              </div>

              {/* Section 03 */}
              <div className="gsec" id="dashboard">
                <div className="gsec-n">03</div>
                <h3>Dashboard &amp; data pembaca</h3>
                <p>
                  Setiap penerbit mitra mendapat <strong>dashboard real-time</strong> &mdash; untuk pertama kalinya melihat bagaimana pembaca benar-benar berinteraksi dengan buku Anda, bukan sekadar angka penjualan di titik akhir.
                </p>
                <ul>
                  <li>Judul &amp; genre yang paling banyak dibaca saat ini</li>
                  <li>Tingkat penyelesaian: buku mana yang tuntas dibaca</li>
                  <li>Utilisasi koleksi: judul aktif vs &ldquo;tidur&rdquo; yang bisa dihidupkan</li>
                  <li>Royalti berjalan &amp; riwayat transfer</li>
                </ul>
                <p>
                  Data ini menjadi bekal keputusan bisnis: kapan cetak ulang, genre apa yang sedang naik, dan naskah seperti apa yang layak diakuisisi.
                </p>
              </div>

              {/* Section 04 */}
              <div className="gsec" id="royalti">
                <div className="gsec-n">04</div>
                <h3>Royalti &amp; pembayaran</h3>
                <p>
                  Bagi hasil <strong>60&ndash;70% revenue ke penerbit</strong>, dihitung dengan formula terbuka:{" "}
                  <span className="mono" style={{ color: "var(--amber)" }}>
                    Royalti = Revenue Pool &times; Porsi Pembacaan &times; Tier %
                  </span>.
                </p>
                <ul>
                  <li>
                    <b>Tier 50% / 55% / 65%</b> berdasarkan skala katalog &amp; komitmen kerjasama.
                  </li>
                  <li>
                    <b>Transfer tanggal 5</b> setiap bulan, rutin tanpa penundaan.
                  </li>
                  <li>
                    <b>Tanpa biaya tersembunyi</b> &mdash; yang tampil di dashboard adalah yang Anda terima.
                  </li>
                </ul>
                <p>
                  Rincian lengkap ada di halaman{" "}
                  <Link href="/publisher/royalti" style={{ color: "var(--amber)" }}>
                    Kebijakan Royalti
                  </Link>, termasuk kalkulator ilustrasi potensi.
                </p>
              </div>

              {/* Section 05 */}
              <div className="gsec" id="kontrol">
                <div className="gsec-n">05</div>
                <h3>Kontrol katalog &amp; windowing</h3>
                <p>Katalog tetap milik dan kendali Anda sepenuhnya:</p>
                <ul>
                  <li>
                    <b>Pilih judul.</b> Anda menentukan judul mana yang masuk digital dan kapan.
                  </li>
                  <li>
                    <b>Windowing.</b> Atur jeda rilis &mdash; mis. digital menyusul 3&ndash;6 bulan setelah rilis fisik agar penjualan fisik didahulukan.
                  </li>
                  <li>
                    <b>Positioning.</b> Buku unggulan bisa Anda posisikan premium (tier akses atau kredit buku), bukan &ldquo;semua rata&rdquo;.
                  </li>
                  <li>
                    <b>Tarik kapan saja.</b> Opsi keluar yang wajar sesuai kontrak.
                  </li>
                </ul>
              </div>

              {/* Section 06 */}
              <div className="gsec" id="proteksi">
                <div className="gsec-n">06</div>
                <h3>Perlindungan konten</h3>
                <p>
                  Seluruh buku dilindungi <strong>DRM (Digital Rights Management)</strong>. Konten tidak bisa diunduh mentah, disalin, atau disebarluaskan di luar aplikasi BUKOO.
                </p>
                <div className="callout">
                  <b>Aman untuk Anda:</b> pembajakan adalah kekhawatiran utama penerbit digital. Arsitektur BUKOO dirancang agar karya Anda hanya bisa dinikmati di dalam aplikasi, terenkripsi &amp; terlindungi.
                </div>
              </div>

              {/* Section 07 */}
              <div className="gsec" id="glosarium">
                <div className="gsec-n">07</div>
                <h3>Glosarium</h3>
                <div className="glossary">
                  <div className="gl">
                    <b>Revenue Pool</b>
                    <span>Bagian pendapatan platform (65% dari gross) yang dibagikan ke penerbit.</span>
                  </div>
                  <div className="gl">
                    <b>Porsi Pembacaan</b>
                    <span>Proporsi pembacaan katalog Anda dari total pembacaan platform.</span>
                  </div>
                  <div className="gl">
                    <b>Tier</b>
                    <span>Persentase bagi hasil penerbit (50/55/65%) sesuai skala &amp; komitmen.</span>
                  </div>
                  <div className="gl">
                    <b>Windowing</b>
                    <span>Pengaturan jeda waktu rilis digital terhadap rilis fisik.</span>
                  </div>
                  <div className="gl">
                    <b>Backlist tidur</b>
                    <span>Judul terdaftar yang belum aktif dibaca &mdash; berpotensi dihidupkan.</span>
                  </div>
                  <div className="gl">
                    <b>Featured Book</b>
                    <span>Fitur promosi untuk mengangkat judul tertentu ke pembaca.</span>
                  </div>
                </div>
              </div>

              {/* Section 08 */}
              <div className="gsec" id="faq">
                <div className="gsec-n">08</div>
                <h3>Pertanyaan yang sering diajukan</h3>
                <PanduanFaq />
              </div>

              {/* Contact Banner */}
              <div className="contact">
                <div>
                  <h3>Masih ada pertanyaan?</h3>
                  <p>Tim kemitraan penerbit kami siap membantu.</p>
                  <span className="mono">✉ penerbit@bukoo.id</span>
                </div>
                <Link href="/publisher/daftar#daftar" className="btn-cta btn-lg">
                  Daftar sebagai penerbit &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

