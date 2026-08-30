import React from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { PublisherNav } from "@/components/publisher/PublisherNav";
import { SubmitForm } from "./SubmitForm";

export const metadata = {
  title: "BUKOO — Submit Judul",
  description: "Kirim judul Anda ke jutaan pembaca. Ajukan judul untuk masuk katalog BUKOO.",
};

// Auth-dependent render (PUBLISHER wizard vs public CTA band) — must not be statically cached.
export const dynamic = "force-dynamic";

// Public signup band shown instead of the 4-step wizard to visitors who are not
// signed-in PUBLISHER users. Pure server component, reuses publisher.css CTA styles.
function SubmitSignupBand() {
  return (
    <div className="dash-cta">
      <h3>Siap mengajukan judul pertama Anda?</h3>
      <p>
        Daftar sebagai penerbit mitra BUKOO atau masuk ke akun penerbit Anda untuk membuka formulir pengajuan 4 langkah.
      </p>
      <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
        <Link href="/publisher/register" className="dash-cta-btn">
          Daftar sebagai penerbit &rarr;
        </Link>
        <Link href="/publisher/login?callbackUrl=/publisher/submit" className="btn-ghost btn-lg">
          Masuk
        </Link>
      </div>
    </div>
  );
}

export default async function PublisherSubmitPage() {
  const session = await auth();
  const userRole = (session?.user as { role?: string } | undefined)?.role;
  const isPublisher = userRole === "PUBLISHER";
  return (
    <div className="pub-page-wrap">
      <PublisherNav currentTab="submit" />

      {/* Hero Section */}
      <section className="phero" style={{ paddingBottom: 40 }}>
        <div className="phero-bg" />
        <div className="phero-grid" />
        <div className="pub-wrap">
          <span className="eyebrow">Submit Judul</span>
          <h1 className="ph-h1">
            Kirim judul Anda ke <em>jutaan pembaca</em>
          </h1>
          <p className="ph-lead">
            Ajukan judul untuk masuk katalog BUKOO. Anda tetap memegang kendali penuh: pilih judul, atur jendela rilis, dan tentukan positioning. Tim kurasi kami memandu setiap langkah.
          </p>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="pub-sec" style={{ paddingTop: 24 }}>
        <div className="pub-wrap">
          <div className="sec-head" style={{ marginBottom: 24 }}>
            <span className="eyebrow">Syarat Berkas</span>
            <h2 className="h2">
              Yang perlu Anda <em>siapkan</em>
            </h2>
          </div>
          <div className="req">
            <div className="req-c">
              <div className="req-i">📄</div>
              <h4>File buku</h4>
              <p>
                Format <code>EPUB</code> atau <code>PDF</code> berkualitas. EPUB direkomendasikan untuk pengalaman baca terbaik.
              </p>
            </div>
            <div className="req-c">
              <div className="req-i">🖼️</div>
              <h4>Cover</h4>
              <p>
                Resolusi tinggi, minimal <code>1400&times;2100 px</code>, format JPG/PNG.
              </p>
            </div>
            <div className="req-c">
              <div className="req-i">🏷️</div>
              <h4>Metadata</h4>
              <p>Judul, penulis, ISBN, sinopsis, genre, tahun terbit, &amp; bahasa.</p>
            </div>
            <div className="req-c">
              <div className="req-i">🔒</div>
              <h4>Hak digital</h4>
              <p>Konfirmasi Anda memegang hak distribusi digital untuk judul tersebut.</p>
            </div>
          </div>
          <div className="disc">
            <b>Perlindungan konten.</b> Semua buku dilindungi DRM &mdash; tidak bisa diunduh mentah, disalin, atau disebarluaskan di luar aplikasi BUKOO. Anda menentukan jendela rilis (windowing), mis. digital menyusul beberapa bulan setelah rilis fisik.
          </div>
        </div>
      </section>

      {/* Submission Form Section */}
      <section className="pub-sec alt">
        <div className="pub-wrap">
          <div className="sec-head" style={{ marginBottom: 24 }}>
            <span className="eyebrow">Formulir Pengajuan</span>
            <h2 className="h2">
              Ajukan judul dalam <em>4 langkah</em>
            </h2>
          </div>
          {isPublisher ? <SubmitForm /> : <SubmitSignupBand />}
        </div>
      </section>

      {/* Process Timeline Section */}
      <section className="pub-sec">
        <div className="pub-wrap">
          <div className="sec-head center">
            <span className="eyebrow">Proses Setelah Submit</span>
            <h2 className="h2">
              Dari pengajuan ke <em>tayang</em>
            </h2>
          </div>
          <div className="proc">
            <div className="proc-line" />
            <div className="proc-s">
              <div className="proc-d">📤</div>
              <h4>1. Pengajuan</h4>
              <p>Anda kirim judul &amp; berkas lewat formulir ini.</p>
            </div>
            <div className="proc-s">
              <div className="proc-d">🔍</div>
              <h4>2. Kurasi</h4>
              <p>Tim editorial meninjau kualitas &amp; kelengkapan (5&ndash;7 hari kerja).</p>
            </div>
            <div className="proc-s">
              <div className="proc-d">⚙️</div>
              <h4>3. Onboarding</h4>
              <p>Buku diproses, di-DRM, &amp; disiapkan sesuai pengaturan Anda.</p>
            </div>
            <div className="proc-s">
              <div className="proc-d">🚀</div>
              <h4>4. Tayang</h4>
              <p>Buku tampil untuk pembaca, royalti mulai berjalan di dashboard.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
