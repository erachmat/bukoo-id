import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Search, User, BookOpen } from 'lucide-react'

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
            <div style={{ position: 'relative', width: '100%' }}>
              <Search style={{ 
                position: 'absolute', 
                left: '14px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                height: '16px', 
                width: '16px', 
                color: '#9CA3AF',
                zIndex: 10
              }} />
              <input
                type="search"
                placeholder="Cari judul, penulis, atau penerbit..."
                style={{ 
                  height: '40px', 
                  width: '100%', 
                  borderRadius: '9999px', 
                  border: 'none', 
                  background: 'rgba(255, 255, 255, 0.1)', 
                  padding: '0 16px 0 42px', 
                  fontSize: '14px', 
                  color: '#ffffff', 
                  outline: 'none',
                  transition: 'background 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
                onBlur={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
              />
            </div>
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
