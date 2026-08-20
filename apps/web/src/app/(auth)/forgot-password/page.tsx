import Link from 'next/link'
import { redirect } from 'next/navigation'
import { resetPassword } from '../actions'
import { mapError } from '../errors'
import { auth } from '@/lib/auth'

import { PasswordInput } from '@/components/auth/password-input'
import { SubmitButton } from '@/components/auth/submit-button'

export default async function ForgotPasswordPage(props: { searchParams: Promise<{ error?: string }> }) {
  const session = await auth()
  if (session) {
    redirect('/library')
  }

  const params = await props.searchParams
  const errorMessage = mapError(params.error)

  return (
    <div>
      <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>Setel Ulang Password</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px', lineHeight: '1.6' }}>
        Masukkan email akun BUKOO Anda dan masukkan password baru untuk disetel ulang.
      </p>

      {errorMessage && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', padding: '16px', borderRadius: '12px', marginBottom: '24px', fontSize: '14px' }}>
          {errorMessage}
        </div>
      )}

      <form action={resetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label htmlFor="email" className="auth-label">Email Terdaftar</label>
          <input id="email" name="email" type="email" placeholder="nama@email.com" required className="auth-input" />
        </div>
        
        <div>
          <label htmlFor="password" style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: 'var(--text)', marginBottom: '8px' }}>Password Baru</label>
          <PasswordInput id="password" name="password" required className="auth-input" />
        </div>
        
        <SubmitButton className="price-cta-btn price-cta-filled" style={{ marginTop: '8px', border: 'none', width: '100%' }}>
          Setel Ulang Password
        </SubmitButton>
      </form>

      <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
        Sudah ingat password Anda?{' '}
        <Link href="/login" style={{ color: 'var(--teal)', fontWeight: '600', textDecoration: 'none' }}>
          Kembali ke Masuk
        </Link>
      </div>
    </div>
  )
}
