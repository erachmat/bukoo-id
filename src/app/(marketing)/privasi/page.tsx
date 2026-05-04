import type { Metadata } from 'next'
import { MarketingDocPage } from '@/components/marketing/MarketingDocPage'

export const metadata: Metadata = {
  title: 'Kebijakan Privasi',
}

export default function PrivasiPage() {
  return (
    <MarketingDocPage
      eyebrow="Legal"
      title="Kebijakan Privasi"
      intro="Bagaimana BUKOO mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda."
    >
      <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 12 }}>1. Data yang kami kumpulkan</h2>
      <p style={{ marginBottom: 20 }}>
        Misalnya: alamat email, nama, data penggunaan aplikasi (seperti judul yang dibaca dan preferensi), serta informasi teknis
        perangkat untuk keamanan dan diagnostik.
      </p>

      <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginTop: 28, marginBottom: 12 }}>2. Penggunaan data</h2>
      <p style={{ marginBottom: 20 }}>
        Data digunakan untuk menyediakan layanan, memproses pembayaran, meningkatkan produk, komunikasi layanan penting, dan
        memenuhi kewajiban hukum.
      </p>

      <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginTop: 28, marginBottom: 12 }}>3. Penyimpanan & keamanan</h2>
      <p style={{ marginBottom: 20 }}>
        Kami menerapkan langkah teknis dan organisasi yang wajar untuk melindungi data. Tidak ada sistem yang sepenuhnya bebas risiko;
        harap menjaga keamanan akun Anda.
      </p>

      <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginTop: 28, marginBottom: 12 }}>4. Pembagian kepada pihak ketiga</h2>
      <p style={{ marginBottom: 20 }}>
        Kami dapat membagikan data kepada penyedia infrastruktur, pembayaran, atau analitik sesuai kebutuhan operasional, dengan
        kewajiban kerahasiaan dan pemrosesan yang sah.
      </p>

      <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginTop: 28, marginBottom: 12 }}>5. Hak Anda</h2>
      <p style={{ marginBottom: 20 }}>
        Anda dapat meminta akses, koreksi, atau penghapusan data tertentu sesuai hukum yang berlaku, dengan menghubungi kami melalui saluran resmi.
      </p>

      <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginTop: 28, marginBottom: 12 }}>6. Cookie & teknologi serupa</h2>
      <p style={{ marginBottom: 20 }} id="cookie">
        Situs dapat menggunakan cookie untuk preferensi sesi dan analitik. Anda dapat mengatur browser untuk membatasi cookie;
        beberapa fitur mungkin tidak berfungsi optimal.
      </p>

      <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginTop: 28, marginBottom: 12 }} id="aksesibilitas">7. Aksesibilitas</h2>
      <p>
        Kami berkomiten meningkatkan aksesibilitas produk secara bertahap. Saran konkret dapat disampaikan melalui Pusat Bantuan.
      </p>
    </MarketingDocPage>
  )
}
