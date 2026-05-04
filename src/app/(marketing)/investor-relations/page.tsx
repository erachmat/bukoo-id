import type { Metadata } from 'next'
import { ComingSoonPage } from '@/components/marketing/ComingSoonPage'

export const metadata: Metadata = {
  title: 'Investor Relations',
}

export default function InvestorRelationsPage() {
  return (
    <ComingSoonPage
      title="Investor Relations"
      description="Informasi bagi investor dan pemangku kepentingan akan dipublikasikan sesuai kebijakan perusahaan."
    />
  )
}
