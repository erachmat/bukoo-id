import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { User, BookOpen } from 'lucide-react'

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
        borderBottom: '1px solid rgba(201, 149, 42, 0.08)', 
        background: 'rgba(0, 24, 26, 0.98)', 
        color: '#ffffff', 
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ 
          width: '100%',
          maxWidth: 'min(1200px, 100%)',
          margin: '0 auto', 
          display: 'flex', 
          height: '68px', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '0 clamp(20px, 4vw, 60px)',
          boxSizing: 'border-box',
        }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', flexShrink: 0 }}>
            <span style={{ 
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(22px, 3vw, 28px)', 
              fontWeight: '900', 
              letterSpacing: '-1px', 
              color: '#C9952A',
            }}>
              BUKOO
            </span>
          </Link>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: 'auto', flexShrink: 0 }}>
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
