import type { Metadata } from 'next'
import { ComingSoonPage } from '@/components/marketing/ComingSoonPage'

export const metadata: Metadata = {
  title: 'Newsroom',
}

export default function NewsroomPage() {
  return <ComingSoonPage title="Newsroom" description="Siaran pers, perkembangan produk, dan kemitraan akan tersedia di sini." />
}
