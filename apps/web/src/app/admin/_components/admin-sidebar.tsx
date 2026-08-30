'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BookText, Users, Settings, LogOut, Megaphone, Inbox } from 'lucide-react'
import { signOut } from '@/app/(auth)/actions'

export function AdminSidebar() {
  const pathname = usePathname()

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Kelola Buku', href: '/admin/books', icon: BookText },
    { name: 'Pengguna', href: '/admin/users', icon: Users },
    { name: 'Kampanye', href: '/admin/campaigns', icon: Megaphone },
    { name: 'Pengajuan Buku', href: '/admin/submissions', icon: Inbox },
    { name: 'Pengaturan', href: '/admin/settings', icon: Settings },
  ]

  return (
    <aside style={{
      width: '260px',
      backgroundColor: 'var(--ad-panel)',
      borderRight: '1px solid var(--ad-border-soft)',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      flexShrink: 0
    }}>
      <div style={{
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        borderBottom: '1px solid var(--ad-border-soft)'
      }}>
        <Link href="/admin" style={{ textDecoration: 'none' }}>
          <span style={{
            fontSize: '20px',
            fontWeight: '800',
            letterSpacing: '-0.5px',
            color: 'var(--ad-amber)',
            fontFamily: 'var(--ad-serif)'
          }}>
            BUKOO <span style={{ color: 'var(--ad-muted)', fontSize: '13px', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '1px', marginLeft: '4px' }}>Admin</span>
          </span>
        </Link>
      </div>
      
      <nav style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map((item) => {
          const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
          const Icon = item.icon
          
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '8px',
                textDecoration: 'none',
                transition: 'all 0.2s',
                backgroundColor: isActive ? 'var(--ad-teal-dim)' : 'transparent',
                color: isActive ? 'var(--ad-teal)' : 'var(--ad-dim)',
              }}
            >
              <Icon size={20} />
              <span style={{ fontWeight: isActive ? '700' : '500', fontSize: '14px' }}>{item.name}</span>
            </Link>
          )
        })}
      </nav>
      
      <div style={{ padding: '16px', borderTop: '1px solid var(--ad-border-soft)' }}>
        <button 
          onClick={() => signOut()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            width: '100%',
            padding: '10px 12px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: 'transparent',
            color: '#EF4444',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.05)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <LogOut size={20} />
          <span style={{ fontWeight: '600', fontSize: '14px' }}>Keluar</span>
        </button>
      </div>
    </aside>
  )
}
