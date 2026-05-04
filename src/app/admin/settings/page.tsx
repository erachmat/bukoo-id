import { Construction } from 'lucide-react'

export default function AdminSettingsPage() {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', height: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div style={{ width: 80, height: 80, background: '#F0F2F5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
        <Construction className="w-10 h-10 text-muted-foreground" />
      </div>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1A2332', marginBottom: 12 }}>Pengaturan</h1>
      <p style={{ color: '#6B7A8D', maxWidth: 400, lineHeight: 1.6 }}>
        Halaman pengaturan platform sedang dalam tahap pengembangan. Fitur ini akan tersedia pada pembaruan mendatang.
      </p>
    </div>
  )
}
