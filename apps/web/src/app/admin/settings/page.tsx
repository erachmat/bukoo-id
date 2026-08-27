import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getPlatformSetting } from '@/lib/platform-settings'
import { RoyaltySettingsForm } from './RoyaltySettingsForm'

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
    redirect('/admin')
  }

  const [monthlyPool, rateBps] = await Promise.all([
    getPlatformSetting('royalty_monthly_pool'),
    getPlatformSetting('royalty_rate_bps'),
  ])

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1A2332', marginBottom: 6 }}>Pengaturan platform</h1>
      <p style={{ color: '#6B7A8D', marginBottom: 24 }}>Kelola parameter yang digunakan untuk perhitungan estimasi publisher.</p>
      <RoyaltySettingsForm monthlyPool={monthlyPool ?? '0'} rateBps={rateBps ?? '6500'} />
    </div>
  )
}
