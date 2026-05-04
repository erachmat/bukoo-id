import type { Metadata } from 'next'
import { MarketingDocPage } from '@/components/marketing/MarketingDocPage'

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan',
}

export default function SyaratKetentuanPage() {
  return (
    <MarketingDocPage
      eyebrow="Legal"
      title="Syarat & Ketentuan"
      intro="Ringkasan ketentuan penggunaan layanan BUKOO. Untuk pertanyaan hukum spesifik, konsultasikan penasihat hukum Anda."
    >
      <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 12 }}>1. Penerimaan ketentuan</h2>
      <p style={{ marginBottom: 20 }}>
        Dengan mengakses atau menggunakan layanan BUKOO, Anda menyetujui syarat ini. Jika tidak setuju, mohon tidak menggunakan layanan kami.
      </p>

      <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginTop: 28, marginBottom: 12 }}>2. Akun pengguna</h2>
      <p style={{ marginBottom: 20 }}>
        Anda bertanggung jawab atas kerahasiaan kredensial akun dan aktivitas yang terjadi di akun Anda. Segera hubungi kami jika menduga akses tidak sah.
      </p>

      <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginTop: 28, marginBottom: 12 }}>3. Langganan & pembayaran</h2>
      <p style={{ marginBottom: 20 }}>
        Biaya langganan mengikuti paket yang dipilih pada saat pembelian. Pembayaran diproses melalui penyedia pembayaran pihak ketiga sesuai ketentuan mereka.
      </p>

      <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginTop: 28, marginBottom: 12 }}>4. Pembatalan</h2>
      <p style={{ marginBottom: 20 }}>
        Anda dapat menghentikan perpanjangan langganan sesuai alur di akun atau kebijakan yang berlaku pada saat itu. Akses premium biasanya tetap aktif hingga akhir periode berlangganan berjalan.
      </p>

      <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginTop: 28, marginBottom: 12 }}>5. Batasan penggunaan</h2>
      <p style={{ marginBottom: 20 }}>
        Konten digital dilindungi hak cipta. Dilarang menyalin, membagikan, atau mendistribusikan konten di luar fitur yang disediakan oleh BUKOO.
      </p>

      <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginTop: 28, marginBottom: 12 }}>6. Perubahan ketentuan</h2>
      <p>
        Kami dapat memperbarui syarat ini sewaktu-waktu. Perubahan material akan diumumkan melalui situs atau email sesuai kebijakan kami.
      </p>
    </MarketingDocPage>
  )
}
