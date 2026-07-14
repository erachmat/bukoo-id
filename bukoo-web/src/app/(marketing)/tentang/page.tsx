import type { Metadata } from 'next'
import { MarketingDocPage } from '@/components/marketing/MarketingDocPage'

export const metadata: Metadata = {
  title: 'Tentang BUKOO',
}

export default function TentangPage() {
  return (
    <MarketingDocPage
      eyebrow="Perusahaan"
      title="Tentang BUKOO"
      intro="Kami percaya bahwa akses terhadap bacaan berkualitas memperkaya kehidupan dan membuka peluang bagi setiap orang."
    >
      <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginTop: 8, marginBottom: 12 }}>Cerita kami</h2>
      <p style={{ marginBottom: 20 }}>
        BUKOO lahir dari keinginan untuk membuat buku digital mudah diakses oleh pembaca di Indonesia—dengan koleksi yang luas,
        pengalaman membaca yang nyaman, dan model langganan yang adil bagi pembaca maupun penerbit.
      </p>

      <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginTop: 28, marginBottom: 12 }}>Misi</h2>
      <p style={{ marginBottom: 20 }}>
        Menghubungkan pembaca dengan ribuan judul bacaan digital melalui platform yang aman, andal, dan terus berkembang—sambil
        mendukung ekosistem penerbitan Indonesia.
      </p>

      <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginTop: 28, marginBottom: 12 }}>Visi</h2>
      <p>
        Menjadi platform langganan buku digital pilihan utama di Asia Tenggara, dikenal karena kualitas layanan, kurasi konten,
        dan komunitas pembaca yang aktif.
      </p>
    </MarketingDocPage>
  )
}
