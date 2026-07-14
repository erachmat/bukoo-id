import type { Metadata } from 'next'
import { MarketingDocPage } from '@/components/marketing/MarketingDocPage'
import { BantuanFAQ } from '@/components/marketing/BantuanFAQ'

export const metadata: Metadata = {
  title: 'Pusat Bantuan',
}

export default function BantuanPage() {
  return (
    <>
      <MarketingDocPage
        eyebrow="Dukungan"
        title="Pusat Bantuan"
        intro="Temukan jawaban cepat di bawah ini, atau hubungi kami melalui saluran resmi BUKOO."
      >
        <p style={{ marginBottom: 24 }} id="kontak">
          Untuk pertanyaan yang belum tercakup, kirim email ke{' '}
          <a href="mailto:support@bukoo.id" style={{ color: 'var(--amber)', fontWeight: 700 }}>
            support@bukoo.id
          </a>
          {' '}dengan subjek yang jelas dan lampiran tangkapan layar jika relevan.
        </p>
      </MarketingDocPage>
      <BantuanFAQ />
    </>
  )
}
