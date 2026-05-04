import type { Metadata } from 'next'
import { ComingSoonPage } from '@/components/marketing/ComingSoonPage'

export const metadata: Metadata = {
  title: 'Karir',
}

export default function KarirPage() {
  return <ComingSoonPage title="Karir di BUKOO" description="Lowongan dan cerita tim akan kami publikasikan di halaman ini." />
}
