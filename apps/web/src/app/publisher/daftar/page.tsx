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
        <div className="phero-bg" />
        <div className="phero-grid" />
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
              Daftar sebagai penerbit &rarr;
            </a>
            <a href="#nilai" className="btn-ghost btn-lg">
              Lihat nilai yang kami tawarkan
            </a>
          </div>
          <div className="dp-metrics">
            <div className="dp-m">
              <div className="dp-m-n">
                229<small> Jt</small>
              </div>
              <div className="dp-m-l">Pengguna internet aktif &mdash; calon pembaca katalog Anda</div>
            </div>
            <div className="dp-m">
              <div className="dp-m-n">
                60&ndash;70<small>%</small>
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
      <section className="pub-sec">
        <div className="pub-wrap">
          <div className="pub-sec-head center">
            <span className="eyebrow">Menjawab Kekhawatiran</span>
            <h2 className="pub-h2">
              Digital dan fisik <em>bukan lawan</em>
            </h2>
            <p className="pub-sec-desc">
              Kami mendengar kekhawatiran ini dari setiap penerbit. Jadi mari kita hadapi langsung, dengan jujur.
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
      <section className="pub-sec alt">
        <div className="pub-wrap">
          <div className="pub-sec-head center">
            <span className="eyebrow">Mesin Penemuan</span>
            <h2 className="pub-h2">
              Bagaimana satu langganan digital <em>menghasilkan</em> penjualan fisik
            </h2>
            <p className="pub-sec-desc">
              Akses ke ribuan judul bukan mengancam koleksi Anda &mdash; ia menjadi corong yang mengalirkan pembaca menuju keputusan membeli.
            </p>
          </div>
          <div className="fw">
            <div className="fw-s">
              <div className="fw-n">01 &middot; JELAJAH</div>
              <h4>Pembaca menemukan</h4>
              <p>
                Pembaca yang tak akan pernah membeli buku Anda tanpa mencoba, kini menemukannya di katalog BUKOO &mdash; tanpa risiko finansial.
              </p>
            </div>
            <div className="fw-s">
              <div className="fw-n">02 &middot; CINTA</div>
              <h4>Sebagian jatuh cinta</h4>
              <p>
                Dari banyak yang mencicipi, sebagian menemukan buku yang benar-benar berarti bagi mereka. Ikatan emosional terbentuk.
              </p>
            </div>
            <div className="fw-s">
              <div className="fw-n">03 &middot; MILIKI</div>
              <h4>Mereka ingin memiliki</h4>
              <p>
                Buku yang dicintai ingin dikoleksi secara fisik. Ini penjualan yang tidak akan terjadi tanpa penemuan.
              </p>
            </div>
            <div className="fw-s">
              <div className="fw-n">04 &middot; SEBAR</div>
              <h4>Lalu merekomendasikan</h4>
              <p>
                Pembaca yang puas membicarakan buku Anda ke komunitas &mdash; memicu gelombang penemuan baru, dan siklus berputar lagi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Yang Anda Dapatkan (Value Streams Section) */}
      <section className="pub-sec" id="nilai">
        <div className="pub-wrap">
          <div className="pub-sec-head">
            <span className="eyebrow">Yang Anda Dapatkan</span>
            <h2 className="pub-h2">
              Tiga aliran nilai baru, <em>di luar</em> penjualan fisik
            </h2>
            <p className="pub-sec-desc">
              Kerjasama ini menambah tanpa mengurangi. Penjualan fisik Anda tetap berjalan &mdash; BUKOO membuka tiga sumber nilai yang selama ini tidak terjangkau.
            </p>
          </div>
          <div className="vs">
            <div className="vs-c a">
              <div className="vs-ico">💸</div>
              <div className="vs-k">Aliran 01</div>
              <h3>Royalti digital berulang</h3>
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
              <div className="vs-ico">🛒</div>
              <div className="vs-k">Aliran 02</div>
              <h3>Corong ke penjualan fisik</h3>
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
              <div className="vs-ico">📊</div>
              <div className="vs-k">Aliran 03</div>
              <h3>Data perilaku pembaca</h3>
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
          <div className="pub-sec-head">
            <span className="eyebrow">Ajukan Kerjasama</span>
            <h2 className="pub-h2">
              Mulai jadi <em>mitra penerbit</em> BUKOO
            </h2>
            <p className="pub-sec-desc">
              Isi pengajuan singkat ini. Tim kemitraan kami akan menghubungi Anda dalam 3 hari kerja untuk diskusi awal &mdash; tanpa komitmen.
            </p>
          </div>
          <div className="form-wrap">
            <div className="form-side">
              <h3>Yang terjadi setelah Anda mendaftar</h3>
              <p>Prosesnya ringan dan dipandu penuh oleh tim kami. Anda tidak butuh tim teknis.</p>
              <div className="form-check">
                <span>✓</span>
                <div>
                  <b>Diskusi awal (3 hari kerja)</b>
                  <p>Kami pelajari katalog &amp; tujuan bisnis Anda.</p>
                </div>
              </div>
              <div className="form-check">
                <span>✓</span>
                <div>
                  <b>Kesepakatan tier &amp; jendela rilis</b>
                  <p>Kontrak transparan, Anda pilih judul yang masuk.</p>
                </div>
              </div>
              <div className="form-check">
                <span>✓</span>
                <div>
                  <b>Onboarding katalog oleh tim BUKOO</b>
                  <p>Anda cukup menyediakan berkas &amp; metadata.</p>
                </div>
              </div>
              <div className="form-check">
                <span>✓</span>
                <div>
                  <b>Tayang &amp; pantau via dashboard</b>
                  <p>Buku Anda tampil untuk jutaan pembaca.</p>
                </div>
              </div>
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

