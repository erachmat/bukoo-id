import Link from 'next/link'
import { signIn } from '../actions'

import { PasswordInput } from '@/components/auth/password-input'
import { SubmitButton } from '@/components/auth/submit-button'

export default async function LoginPage(props: { searchParams: Promise<{ error?: string }> }) {
  const params = await props.searchParams
  
  return (
    <div>
      <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>Masuk ke BUKOO</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px', lineHeight: '1.6' }}>
        Masukkan email dan password untuk melanjutkan membaca
      </p>

      {params.error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', padding: '16px', borderRadius: '12px', marginBottom: '24px', fontSize: '14px' }}>
          {params.error}
        </div>
      )}

      <form action={signIn} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label htmlFor="email" className="auth-label">Email</label>
          <input id="email" name="email" type="email" placeholder="nama@email.com" required className="auth-input" />
        </div>
        
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label htmlFor="password" style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>Password</label>
            <Link href="/forgot-password" style={{ fontSize: '13px', color: 'var(--teal)', textDecoration: 'none', fontWeight: '600' }}>
              Lupa password?
            </Link>
          </div>
          <PasswordInput id="password" name="password" required className="auth-input" />
        </div>
        
        <SubmitButton className="price-cta-btn price-cta-filled" style={{ marginTop: '8px', border: 'none', width: '100%' }}>
          Masuk
        </SubmitButton>
      </form>

      <div style={{ margin: '32px 0', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>Atau</div>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
      </div>

      <button className="auth-btn-social" disabled style={{ opacity: 0.6, cursor: 'not-allowed' }}>
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Google (Segera Hadir)
      </button>

      <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
        Belum punya akun?{' '}
        <Link href="/register" style={{ color: 'var(--teal)', fontWeight: '600', textDecoration: 'none' }}>
          Daftar sekarang
        </Link>
      </div>
    </div>
  )
}
