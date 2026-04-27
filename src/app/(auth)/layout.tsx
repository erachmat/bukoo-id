import '../(marketing)/redesign.css'
import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--forest-dd)' }}>
      {/* Left Form Side */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
          <Link href="/" style={{ display: 'inline-block', marginBottom: '32px', fontSize: '24px', fontWeight: '800', letterSpacing: '1px', color: '#fff', textDecoration: 'none' }}>
            BUKOO
          </Link>
          {children}
        </div>
      </div>
      
      {/* Right Image/Gradient Side */}
      <div style={{ flex: 1, display: 'none', position: 'relative', overflow: 'hidden', background: '#0a0a0a', borderLeft: '1px solid var(--border)' }} className="lg-flex">
        {/* Glows */}
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(0,201,167,0.15) 0%, transparent 70%)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)', borderRadius: '50%' }}></div>
        
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '24px' }}>✨</div>
          <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#fff', marginBottom: '16px', lineHeight: '1.2' }}>
            Gerbang Menuju<br />Ribuan Dunia Baru
          </h2>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.7)', maxWidth: '450px', lineHeight: '1.6' }}>
            Temukan buku-buku terbaik dari penulis lokal maupun internasional. Baca di mana saja, kapan saja dengan BUKOO.
          </p>
        </div>
      </div>
      
      <style>{`
        @media (min-width: 1024px) {
          .lg-flex {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  )
}
