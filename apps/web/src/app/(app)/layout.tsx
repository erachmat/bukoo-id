import type { CSSProperties } from 'react'
import Link from 'next/link'
import { BookOpen, User } from 'lucide-react'
import { ThemeToggle } from '@/components/theme/theme-toggle'

const navLinkStyles: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  height: 36,
  padding: '0 10px',
  borderRadius: 12,
  fontSize: '0.8rem',
  fontWeight: 600,
  color: '#D1D5DB',
  textDecoration: 'none',
}

const navIconStyles: CSSProperties = {
  ...navLinkStyles,
  width: 36,
  padding: 0,
  justifyContent: 'center',
}

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
      }}
      >
        <div style={{
          width: '100%',
          display: 'flex',
          height: '68px',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 clamp(20px, 4vw, 60px)',
          boxSizing: 'border-box',
        }}
        >
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', flexShrink: 0 }}>
            <span style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(22px, 3vw, 28px)',
              fontWeight: '900',
              letterSpacing: '-1px',
              color: '#C9952A',
            }}
            >
              BUKOO
            </span>
          </Link>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <Link
              href="/library"
              className="app-header-nav-link"
              style={navLinkStyles}
            >
              <BookOpen style={{ height: 16, width: 16, flexShrink: 0 }} aria-hidden />
              Library
            </Link>
            <Link
              href="/account"
              className="app-header-nav-link app-header-nav-icon"
              style={navIconStyles}
              title="Akun Saya"
            >
              <User style={{ height: 20, width: 20 }} aria-hidden />
              <span className="sr-only">Akun Saya</span>
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>
      <main className="flex-1 bg-[#F8FAFC]">{children}</main>
      <style>{`
        .app-header-nav-link:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #f9fafb;
        }
        .app-header-nav-link:focus-visible {
          outline: 2px solid rgba(201, 149, 42, 0.6);
          outline-offset: 2px;
        }
      `}</style>
    </div>
  )
}
