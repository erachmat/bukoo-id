import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { User, BookOpen } from 'lucide-react'
import { HeaderSearch } from '@/components/layout/header-search'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', background: '#F8FAFC' }}>
      <header style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 50, 
        width: '100%', 
        borderBottom: '1px solid rgba(255,255,255,0.1)', 
        background: '#00181A', 
        color: '#ffffff', 
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' 
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          display: 'flex', 
          height: '64px', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '0 24px' 
        }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <span style={{ 
              fontSize: '24px', 
              fontWeight: '800', 
              letterSpacing: '-0.025em', 
              background: 'linear-gradient(to right, #00C9A7, #60A5FA)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              color: 'transparent'
            }}>
              BUKOO
            </span>
          </Link>
          
          <div style={{ 
            display: 'flex', 
            flex: 1, 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '0 24px',
            maxWidth: '500px'
          }}>
            <HeaderSearch />
          </div>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/library" style={{ textDecoration: 'none' }}>
              <Button variant="ghost" size="sm" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                color: '#D1D5DB', 
                backgroundColor: 'transparent' 
              }}>
                <BookOpen style={{ height: '16px', width: '16px', marginRight: '8px' }} />
                Library
              </Button>
            </Link>
            <Link href="/account" style={{ textDecoration: 'none' }}>
              <Button variant="ghost" size="icon" style={{ 
                borderRadius: '9999px', 
                color: '#D1D5DB', 
                backgroundColor: 'transparent' 
              }}>
                <User style={{ height: '20px', width: '20px' }} />
                <span style={{ display: 'none' }}>Akun Saya</span>
              </Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 bg-[#F8FAFC]">{children}</main>
    </div>
  )
}
