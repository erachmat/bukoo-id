import React from "react";
import { DaftarForm } from "./DaftarForm";
import { LandingFooter } from "./LandingFooter";
import { LandingNav } from "./LandingNav";
import { LogoutMarkerCleanup } from "./LogoutMarkerCleanup";
import {
  IconArrowRight,
  IconBars,
  IconBookRibbon,
  IconCartHeart,
  IconCheckBadge,
  IconFingerHeart,
  IconQuotes,
  IconStream,
  IconTiles,
} from "./icons";
import "./landing.css";

export const metadata = {
  title: "BUKOO — Daftar Penerbit",
  description:
    "BUKOO bukan pesaing rak buku Anda — kami etalase yang memperkenalkan katalog Anda ke jutaan pembaca baru, lalu mengubah mereka menjadi pembeli buku fisik, pelanggan berulang, dan sumber data.",
};

const FLYWHEEL = [
  {
    title: "Pembaca Menemukan",
    body: "Pembaca yang tak akan pernah membeli buku Anda tanpa mencoba, kini menemukannya di katalog BUKOO tanpa risiko finansial.",
    Icon: IconTiles,
  },
  {
    title: "Sebagian jatuh cinta",
    body: "Dari banyak yang mencicipi, sebagian menemukan buku yang benar-benar berarti bagi mereka. Ikatan emosional terbentuk.",
    Icon: IconFingerHeart,
  },
  {
    title: "Mereka Ingin Memiliki",
    body: "Buku yang dicintai ingin dikoleksi secara fisik. Ini penjualan yang tidak akan terjadi tanpa penemuan.",
    Icon: IconBookRibbon,
  },
  {
    title: "Lalu Merekomendasikan",
    body: "Pembaca yang puas membicarakan buku Anda ke komunitas, memicu gelombang penemuan baru, dan siklus berputar lagi.",
    Icon: IconQuotes,
  },
];

const VALUE_STREAMS = [
  {
    accent: "a",
    Icon: IconStream,
    title: "1. Royalti digital berulang",
    body: "Setiap pembacaan menghasilkan royalti pendapatan bulanan berulang yang dapat diprediksi, tanpa biaya cetak, gudang, atau retur.",
    items: [
      "Hidupkan pendapatan dari backlist yang tak lagi dicetak",
      "Tanpa modal produksi, tanpa risiko stok mati",
      "Transfer rutin tanggal 5 tiap bulan",
    ],
  },
  {
    accent: "b",
    Icon: IconCartHeart,
    title: "2. Corong ke penjualan fisik",
    body: "BUKOO jadi kanal penemuan yang mengarahkan pembaca ke pembelian fisik — \u201ccoba dulu, baru beli\u201d pada skala jutaan pembaca.",
    items: [
      "Judul lama hidup kembali & memicu cetak ulang",
      "Tautan ke toko/marketplace penerbit (opsional)",
      "Pembaca datang sudah yakin ingin memiliki",
    ],
  },
  {
    accent: "c",
    Icon: IconBars,
    title: "3. Data perilaku pembaca",
    body: "Untuk pertama kalinya, lihat bagaimana pembaca berinteraksi dengan buku Anda, bukan sekadar angka penjualan di titik akhir.",
    items: [
      "Judul & genre yang paling diminati saat ini",
      "Tingkat penyelesaian: buku mana yang tuntas dibaca",
      "Bekal keputusan cetak ulang & akuisisi naskah",
    ],
    topAccent: true,
  },
];

export default function PublisherDaftarPage() {
  return (
    <div className="bl-root">
      <LogoutMarkerCleanup />

      {/* ───────────────────────── Hero ───────────────────────── */}
      <section className="bl-hero">
        <div className="bl-hero-bg" />
        <div className="bl-hero-scrim" />
        <LandingNav currentTab="daftar" />
        <div className="bl-hero-body">
          <span className="bl-eyebrow-hero">Undangan Kerjasama Mitra Penerbit</span>
          <h1 className="bl-h1">
            Dari rak Penerbit,
            <br />
            <em>ke layar jutaan</em> Pembaca
          </h1>
          <p className="bl-lead">
            BUKOO bukan pesaing rak buku Anda — kami etalase yang memperkenalkan
            katalog Anda ke jutaan pembaca baru, lalu mengubah mereka menjadi
            pembeli buku fisik, pelanggan berulang, dan sumber data yang selama
            ini tidak Anda miliki.
          </p>
          <div className="bl-hero-cta">
            <a href="#daftar" className="bl-btn-gold bl-lg">
              Daftar sebagai penerbit
            </a>
          </div>
        </div>
      </section>

      {/* ───────────────────── B — brand stance ───────────────────── */}
      <section className="bl-b">
        <div className="bl-container">
          <div className="bl-b-head">
            <h2 className="bl-b-h">
              BUKOO bukan pesaing rak buku Penerbit
              <em>kami etalasenya</em>
            </h2>
          </div>
          <p className="bl-b-body">
            BUKOO memperkenalkan katalog Anda ke jutaan pembaca baru, lalu
            mengubah mereka menjadi pembeli buku fisik, pelanggan berulang, dan
            sumber data yang selama ini tidak Anda miliki; bukan menggantikan
            rak buku, tapi mengisinya kembali.
          </p>
        </div>
      </section>

      {/* ───────────────────── C — Mengapa Bergabung ───────────────────── */}
      <section className="bl-c">
        <div className="bl-container">
          <div className="bl-c-head">
            <span className="bl-eyebrow">Mengapa Bergabung?</span>
            <h2 className="bl-c-h">
              Digital dan fisik <em>bukan lawan.</em>
            </h2>
            <p className="bl-c-sub">
              BUKOO memperkenalkan katalog Anda ke jutaan pembaca baru, lalu
              mengubah mereka menjadi pembeli buku fisik, pelanggan berulang,
              dan sumber data yang selama ini tidak Anda miliki; bukan
              menggantikan rak buku, tapi mengisinya kembali.
            </p>
          </div>

          <div className="bl-compare">
            <div className="bl-card bl-card-fear">
              <div className="bl-card-eyebrow">Kekhawatiran</div>
              <h3 className="bl-card-h">
                &ldquo;Kalau orang bisa baca digital murah, mereka tidak akan
                beli buku fisik saya lagi.&rdquo;
              </h3>
              <p className="bl-card-p">
                Asumsinya: setiap pembacaan digital = satu penjualan fisik yang
                hilang. Seolah pembaca digital dan pembeli fisik adalah orang
                yang sama, dengan kebutuhan yang sama.
              </p>
            </div>

            <div className="bl-arrow" aria-hidden="true">
              <IconArrowRight />
            </div>

            <div className="bl-card bl-card-truth">
              <div className="bl-card-eyebrow">Kenyataannya</div>
              <h3 className="bl-card-h">
                Membaca digital adalah mencicipi.
                <br />
                Membeli fisik adalah memiliki.
              </h3>
              <p className="bl-card-p">
                Pembaca berlangganan digital untuk menjelajah luas dan mencoba
                banyak judul. Mereka membeli fisik untuk buku yang mereka
                cintai; dikoleksi, dihadiahkan, dipajang.
              </p>
              <p className="bl-card-p">
                BUKOO mengubah pembaca pasif menjadi pembeli yang tahu persis
                buku mana yang layak mereka miliki.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────── D — Mesin penemuan ───────────────────── */}
      <section className="bl-d">
        <div className="bl-container">
          <div className="bl-d-head">
            <span className="bl-eyebrow">Mesin penemuan</span>
            <h2 className="bl-d-h">
              Bagaimana satu langganan digital
              <em>Menghasilkan penjualan fisik</em>
            </h2>
            <p className="bl-d-sub">
              Akses ke ribuan judul bukan mengancam koleksi Anda — ia menjadi
              corong yang mengalirkan pembaca menuju keputusan membeli.
            </p>
          </div>

          <div className="bl-d-grid">
            {FLYWHEEL.map(({ title, body, Icon }) => (
              <div className="bl-d-card" key={title}>
                <div className="bl-d-ico">
                  <Icon />
                </div>
                <h3 className="bl-d-title">{title}</h3>
                <p className="bl-d-body">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────── E — Tiga aliran nilai ───────────────────── */}
      <section className="bl-e">
        <div className="bl-container">
          <div className="bl-e-head">
            <span className="bl-eyebrow">Mesin penemuan</span>
            <h2 className="bl-e-h">
              Tiga aliran nilai baru, <em>di luar penjualan fisik</em>
            </h2>
            <p className="bl-e-sub">
              Kerjasama ini menambah tanpa mengurangi. Penjualan fisik Anda
              tetap berjalan. BUKOO membuka tiga sumber nilai yang selama ini
              tidak terjangkau.
            </p>
          </div>

          <div className="bl-e-grid">
            {VALUE_STREAMS.map(({ accent, Icon, title, body, items, topAccent }) => (
              <div
                className={`bl-e-card${topAccent ? " bl-top-accent" : ""}`}
                key={title}
              >
                <div className={`bl-e-ico ${accent}`}>
                  <Icon />
                </div>
                <h3 className="bl-e-title">{title}</h3>
                <p className="bl-e-body">{body}</p>
                <ul className="bl-e-list">
                  {items.map((item) => (
                    <li key={item}>
                      <span className="bl-check">
                        <IconCheckBadge />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────── F — Mulai jadi Mitra ───────────────────── */}
      <section className="bl-f" id="daftar">
        <div className="bl-container">
          <div className="bl-f-grid">
            <div>
              <h2 className="bl-f-h">
                Mulai jadi
                <br />
                <em>Mitra Kami</em>
              </h2>
              <p className="bl-f-p">
                Isi pengajuan singkat ini. Tim kemitraan kami akan menghubungi
                Anda dalam 3 hari kerja untuk diskusi awal tanpa komitmen.
              </p>
              <div className="bl-callout">
                <div className="bl-callout-t">Catatan:</div>
                <p className="bl-callout-b">
                  Pengajuan ini bersifat non-mengikat dan gratis. Data Anda
                  hanya dipakai untuk keperluan komunikasi kemitraan.
                </p>
              </div>
            </div>

            <div className="bl-form-card">
              <DaftarForm />
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
