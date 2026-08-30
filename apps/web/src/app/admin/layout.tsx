import Link from 'next/link'
import { AdminSidebar } from './_components/admin-sidebar'
import './admin.css'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className="admin-shell"
      style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--ad-bg)', color: 'var(--ad-text)' }}
    >
      <AdminSidebar />
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
