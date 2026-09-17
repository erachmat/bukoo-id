import React from "react";
import Link from "next/link";
import { PublisherNav } from "@/components/publisher/PublisherNav";
import { DaftarForm } from "./DaftarForm";
import { LogoutMarkerCleanup } from "./LogoutMarkerCleanup";

export const metadata = {
  title: "BUKOO — Daftar Penerbit",
  description: "Bergabung sebagai mitra penerbit BUKOO. Jangkau jutaan pembaca digital di Indonesia dengan model pembagian hasil yang adil dan transparan.",
};

export default function PublisherDaftarPage() {
  return (
    <div className="pub-page-wrap">
      <LogoutMarkerCleanup />
      <PublisherNav currentTab="daftar" />

      {/* Hero Section */}
      <section className="phero">
        <img
          className="phero-photo"
          src="/publisher-assets/publisher-hero.jpg"
          srcSet="/publisher-assets/publisher-hero@1280.jpg 1280w, /publisher-assets/publisher-hero.jpg 2560w"
          sizes="100vw"
          alt=""
          fetchPriority="high"
          decoding="async"
        />
        <div className="phero-scrim" />
        <div className="pub-wrap">
          <span className="eyebrow">Undangan Kerjasama Mitra Penerbit</span>
          <h1 className="ph-h1">
            <span className="q">&ldquo;Apakah digital akan mematikan buku fisik kami?&rdquo;</span>
            <br />
            Justru <em>sebaliknya.</em>
          </h1>
          <p className="ph-lead">
            BUKOO bukan pesaing rak buku Anda — kami <strong>etalase</strong> yang memperkenalkan katalog Anda ke jutaan pembaca baru, lalu mengubah mereka menjadi <strong>pembeli buku fisik, pelanggan berulang, dan sumber data</strong> yang selama ini tidak Anda miliki.
          </p>
          <div className="pub-hero-ctas">
            <a href="#daftar" className="btn-cta btn-lg">
              Daftar sebagai penerbit
            </a>
          </div>
        </div>
      </section>

      {/* Intro Statement (light band) — metrics moved here from the hero */}
      <section className="pub-sec light" id="nilai">
        <div className="pub-wrap">
          <div className="pub-sec-head center">
            <h2 className="pub-h2-dk">
              BUKOO bukan pesaing rak buku Penerbit
              <br />
              <em>kami etalasenya</em>
            </h2>
            <p className="pub-sec-desc-dk">
              BUKOO memperkenalkan katalog Anda ke jutaan pembaca baru, lalu mengubah mereka menjadi pembeli buku fisik, pelanggan berulang, dan sumber data yang selama ini tidak Anda miliki; bukan menggantikan rak buku, tapi mengisinya kembali.
            </p>
          </div>
          <div className="dp-metrics light">
            <div className="dp-m">
              <div className="dp-m-n">
                229<small> Jt</small>
              </div>
              <div className="dp-m-l">Pengguna internet aktif &mdash; calon pembaca katalog Anda</div>
            </div>
            <div className="dp-m">
              <div className="dp-m-n">
                60&ndash;65<small>%</small>
              </div>
              <div className="dp-m-l">Bagi hasil revenue digital untuk penerbit mitra</div>
            </div>
            <div className="dp-m">
              <div className="dp-m-n">Tgl 5</div>
              <div className="dp-m-l">Transfer royalti tiap bulan, dashboard real-time</div>
            </div>
            <div className="dp-m">
              <div className="dp-m-n">3</div>
              <div className="dp-m-l">Aliran nilai: royalti &middot; funnel fisik &middot; data pembaca</div>
            </div>
          </div>
        </div>
      </section>

      {/* Menjawab Kekhawatiran (Flip Section) */}
      <section className="pub-sec alt">
        <div className="pub-wrap">
          <div className="pub-sec-head center">
            <span className="eyebrow">Mengapa Bergabung?</span>
            <h2 className="pub-h2">
              Digital dan fisik <em>bukan lawan.</em>
            </h2>
            <p className="pub-sec-desc">
              BUKOO memperkenalkan katalog Anda ke jutaan pembaca baru, lalu mengubah mereka menjadi pembeli buku fisik, pelanggan berulang, dan sumber data yang selama ini tidak Anda miliki; bukan menggantikan rak buku, tapi mengisinya kembali.
            </p>
          </div>
          <div className="flip">
            <div className="flip-c flip-fear">
              <div className="flip-tag">Kekhawatiran</div>
              <h3>&ldquo;Kalau orang bisa baca digital murah, mereka tidak akan beli buku fisik saya lagi.&rdquo;</h3>
              <p>
                Asumsinya: setiap pembacaan digital = satu penjualan fisik yang hilang. Seolah pembaca digital dan pembeli fisik adalah orang yang sama, dengan kebutuhan yang sama.
              </p>
            </div>
            <div className="flip-arr">
              <div>&rarr;</div>
            </div>
            <div className="flip-c flip-truth">
              <div className="flip-tag">Kenyataannya</div>
              <h3>
                Membaca digital adalah <em>mencicipi</em>. Membeli fisik adalah <em>memiliki</em>.
              </h3>
              <p>
                Pembaca berlangganan digital untuk menjelajah luas dan mencoba banyak judul. Mereka membeli fisik untuk buku yang mereka cintai &mdash; dikoleksi, dihadiahkan, dipajang. BUKOO mengubah pembaca pasif menjadi pembeli yang tahu persis buku mana yang layak mereka miliki.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mesin Penemuan (Flywheel Section) */}
      <section className="pub-sec">
        <div className="pub-wrap">
          <div className="pub-sec-head center">
            <span className="eyebrow">Mesin penemuan</span>
            <h2 className="pub-h2">
              Bagaimana satu langganan digital <em>menghasilkan penjualan fisik</em>
            </h2>
            <p className="pub-sec-desc">
              Akses ke ribuan judul bukan mengancam koleksi Anda &mdash; ia menjadi corong yang mengalirkan pembaca menuju keputusan membeli.
            </p>
          </div>
          <div className="fw">
            <div className="fw-s">
              <div className="fw-ico" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="13" height="13" rx="3" />
                  <rect x="8" y="8" width="13" height="13" rx="3" />
                </svg>
              </div>
              <h4>Pembaca Menemukan</h4>
              <p>
                Pembaca yang tak akan pernah membeli buku Anda tanpa mencoba, kini menemukannya di katalog BUKOO &mdash; tanpa risiko finansial.
              </p>
            </div>
            <div className="fw-s">
              <div className="fw-ico" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20s-6.5-4.2-8.4-8.1A4.6 4.6 0 0 1 12 6.7a4.6 4.6 0 0 1 8.4 5.2C18.5 15.8 12 20 12 20Z" />
                  <path d="M2.5 2.5 21.5 21.5" />
                </svg>
              </div>
              <h4>Sebagian jatuh cinta</h4>
              <p>
                Dari banyak yang mencicipi, sebagian menemukan buku yang benar-benar berarti bagi mereka. Ikatan emosional terbentuk.
              </p>
            </div>
            <div className="fw-s">
              <div className="fw-ico" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v15H6.5A2.5 2.5 0 0 0 4 20.5Z" />
                  <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H19v3H6.5A2.5 2.5 0 0 1 4 20.5Z" />
                </svg>
              </div>
              <h4>Mereka Ingin Memiliki</h4>
              <p>
                Buku yang dicintai ingin dikoleksi secara fisik. Ini penjualan yang tidak akan terjadi tanpa penemuan.
              </p>
            </div>
            <div className="fw-s">
              <div className="fw-ico" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7.5 11a3 3 0 1 1 0-6c3.5 0 4.5 3 4.5 3s1-3 4.5-3a3 3 0 1 1 0 6c-3.8 0-4.5 3.2-4.5 3.2S11.3 11 7.5 11Z" />
                  <path d="M8 17.5c1.5 2 4 2.5 4 2.5s2.5-.5 4-2.5" />
                </svg>
              </div>
              <h4>Lalu Merekomendasikan</h4>
              <p>
                Pembaca yang puas membicarakan buku Anda ke komunitas &mdash; memicu gelombang penemuan baru, dan siklus berputar lagi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Yang Anda Dapatkan (Value Streams, light band) */}
      <section className="pub-sec light">
        <div className="pub-wrap">
          <div className="pub-sec-head center">
            <span className="eyebrow dk">Mesin penemuan</span>
            <h2 className="pub-h2-dk">
              Tiga aliran nilai baru, <em>di luar penjualan fisik</em>
            </h2>
            <p className="pub-sec-desc-dk">
              Kerjasama ini menambah tanpa mengurangi. Penjualan fisik Anda tetap berjalan &mdash; BUKOO membuka tiga sumber nilai yang selama ini tidak terjangkau.
            </p>
          </div>
          <div className="vs">
            <div className="vs-c a">
              <div className="vs-ico" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2.5" y="6" width="19" height="12" rx="2.5" />
                  <path d="M2.5 10h19" />
                  <path d="M7 14.5h3" />
                </svg>
              </div>
              <h3>
                <span className="vs-k">1.</span> Royalti digital berulang
              </h3>
              <p>
                Setiap pembacaan menghasilkan royalti &mdash; pendapatan bulanan berulang yang dapat diprediksi, tanpa biaya cetak, gudang, atau retur.
              </p>
              <ul>
                <li>Hidupkan pendapatan dari backlist yang tak lagi dicetak</li>
                <li>Tanpa modal produksi, tanpa risiko stok mati</li>
                <li>Transfer rutin tanggal 5 tiap bulan</li>
              </ul>
            </div>
            <div className="vs-c b">
              <div className="vs-ico" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.5 4h2.2l2.3 10.5a1.6 1.6 0 0 0 1.6 1.3h7.6a1.6 1.6 0 0 0 1.6-1.3L19 7H5.4" />
                  <circle cx="9" cy="19.5" r="1.3" />
                  <circle cx="16" cy="19.5" r="1.3" />
                  <path d="M12 8.5s-2.4-1.6-3.1-3A1.7 1.7 0 0 1 12 4.2a1.7 1.7 0 0 1 3.1 1.3c-.7 1.4-3.1 3-3.1 3Z" />
                </svg>
              </div>
              <h3>
                <span className="vs-k">2.</span> Corong ke penjualan fisik
              </h3>
              <p>
                BUKOO jadi kanal penemuan yang mengarahkan pembaca ke pembelian fisik &mdash; &ldquo;coba dulu, baru beli&rdquo; pada skala jutaan pembaca.
              </p>
              <ul>
                <li>Judul lama hidup kembali &amp; memicu cetak ulang</li>
                <li>Tautan ke toko/marketplace penerbit (opsional)</li>
                <li>Pembaca datang sudah yakin ingin memiliki</li>
              </ul>
            </div>
            <div className="vs-c c">
              <div className="vs-ico" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 20V11" />
                  <path d="M12 20V5" />
                  <path d="M18 20v-6" />
                </svg>
              </div>
              <h3>
                <span className="vs-k">3.</span> Data perilaku pembaca
              </h3>
              <p>
                Untuk pertama kalinya, lihat bagaimana pembaca berinteraksi dengan buku Anda &mdash; bukan sekadar angka penjualan di titik akhir.
              </p>
              <ul>
                <li>Judul &amp; genre yang paling diminati saat ini</li>
                <li>Tingkat penyelesaian: buku mana yang tuntas dibaca</li>
                <li>Bekal keputusan cetak ulang &amp; akuisisi naskah</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Ajukan Kerjasama (Registration Section) */}
      <section className="pub-sec alt" id="daftar">
        <div className="pub-wrap">
          <div className="form-wrap">
            <div className="form-side">
              <h2 className="form-side-h">
                Mulai jadi <em>Mitra Kami</em>
              </h2>
              <p>Isi pengajuan singkat ini. Tim kemitraan kami akan menghubungi Anda dalam 3 hari kerja untuk diskusi awal &mdash; tanpa komitmen.</p>
              <div className="disc">
                <b>Catatan.</b> Pengajuan ini bersifat non-mengikat dan gratis. Data Anda hanya dipakai untuk keperluan komunikasi kemitraan.
              </div>
            </div>

            <DaftarForm />
          </div>
        </div>
      </section>
    </div>
  );
}

