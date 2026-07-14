import Link from 'next/link'
import { AdminSidebar } from './_components/admin-sidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFB' }}>
      <AdminSidebar />
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
