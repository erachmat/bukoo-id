import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requestPasswordReset, verifyPasswordReset } from '../actions'
import { mapError } from '../errors'
import { auth } from '@/lib/auth'

import { PasswordInput } from '@/components/auth/password-input'
import { SubmitButton } from '@/components/auth/submit-button'

const ERROR_BANNER_STYLE: React.CSSProperties = {
  background: 'rgba(239,68,68,0.1)',
  border: '1px solid rgba(239,68,68,0.3)',
  color: '#EF4444',
  padding: '16px',
  borderRadius: '12px',
  marginBottom: '24px',
  fontSize: '14px',
}

const OK_BANNER_STYLE: React.CSSProperties = {
  background: 'rgba(16,185,129,0.1)',
  border: '1px solid rgba(16,185,129,0.3)',
  color: '#34D399',
  padding: '16px',
  borderRadius: '12px',
  marginBottom: '24px',
  fontSize: '14px',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: '10px',
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(255,255,255,0.06)',
  color: 'var(--text)',
  fontSize: '15px',
  outline: 'none',
}

export default async function ForgotPasswordPage(props: {
  searchParams: Promise<{ error?: string; message?: string; step?: string; email?: string }>
}) {
  const session = await auth()
  if (session) {
    redirect('/library')
  }

  const params = await props.searchParams
  const isStepCode = params.step === 'code'
  const email = params.email ?? ''
  const errorMessage = mapError(params.error)
  const infoMessage = mapError(params.message)

  return (
    <div>
      <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>Setel Ulang Password</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px', lineHeight: '1.6' }}>
        {isStepCode
          ? 'Masukkan kode verifikasi dari email Anda beserta password baru.'
          : 'Masukkan email akun BUKOO Anda — kami akan mengirimkan kode verifikasi untuk menyetel ulang password.'}
      </p>

      {errorMessage && (
        <div style={ERROR_BANNER_STYLE}>
          {errorMessage}
        </div>
      )}
      {infoMessage && (
        <div style={OK_BANNER_STYLE}>
          {infoMessage}
        </div>
      )}

      {isStepCode ? (
        <form action={verifyPasswordReset} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <input type="hidden" name="email" value={email} />

          <div>
            <label htmlFor="code" className="auth-label">Kode Verifikasi</label>
            <input id="code" name="code" type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} placeholder="123456" required className="auth-input" style={inputStyle} />
          </div>

          <div>
            <label htmlFor="password" style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: 'var(--text)', marginBottom: '8px' }}>Password Baru</label>
            <PasswordInput id="password" name="password" required className="auth-input" />
          </div>

          <SubmitButton className="price-cta-btn price-cta-filled" style={{ marginTop: '8px', border: 'none', width: '100%' }}>
            Verifikasi & Setel Password
          </SubmitButton>
        </form>
      ) : (
        <form action={requestPasswordReset} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label htmlFor="email" className="auth-label">Email Terdaftar</label>
            <input id="email" name="email" type="email" placeholder="nama@email.com" required className="auth-input" style={inputStyle} />
          </div>

          <SubmitButton className="price-cta-btn price-cta-filled" style={{ marginTop: '8px', border: 'none', width: '100%' }}>
            Kirim Kode Verifikasi
          </SubmitButton>
        </form>
      )}

      <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
        {isStepCode ? (
          <>
            Belum menerima kode?{' '}
            <Link href="/forgot-password" style={{ color: 'var(--teal)', fontWeight: '600', textDecoration: 'none' }}>
              Kirim ulang
            </Link>
          </>
        ) : (
          <>
            Sudah ingat password Anda?{' '}
            <Link href="/login" style={{ color: 'var(--teal)', fontWeight: '600', textDecoration: 'none' }}>
              Kembali ke Masuk
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
