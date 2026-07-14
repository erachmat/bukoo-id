import type { Metadata } from 'next'
import { ComingSoonPage } from '@/components/marketing/ComingSoonPage'

export const metadata: Metadata = {
  title: 'Blog',
}

export default function BlogPage() {
  return <ComingSoonPage title="Blog BUKOO" description="Artikel, rekomendasi bacaan, dan wawancara penulis akan hadir di sini." />
}
