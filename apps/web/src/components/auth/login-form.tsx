import Link from 'next/link'
import type { CSSProperties } from 'react'
import { signIn, signInWithGoogle } from '@/app/(auth)/actions'
import { mapError } from '@/app/(auth)/errors'
import { PasswordInput } from '@/components/auth/password-input'
import { SubmitButton } from '@/components/auth/submit-button'
import { GoogleButton } from '@/components/auth/google-button'

interface LoginFormProps {
  /** Sanitized post-login destination (hidden input; re-sanitized in the action). */
  callbackUrl?: string
  error?: string
  message?: string
  /** Where the "Daftar sekarang" link points ('/register' or '/publisher/register'). */
  registerHref: string
  variant?: 'customer' | 'publisher'
}

const ERROR_BANNER_STYLE: CSSProperties = {
  background: 'rgba(239,68,68,0.1)',
  border: '1px solid rgba(239,68,68,0.3)',
  color: '#EF4444',
  padding: '16px',
  borderRadius: '12px',
  marginBottom: '24px',
  fontSize: '14px',
}

const OK_BANNER_STYLE: CSSProperties = {
  background: 'rgba(16,185,129,0.1)',
  border: '1px solid rgba(16,185,129,0.3)',
  color: '#10B981',
  padding: '16px',
  borderRadius: '12px',
  marginBottom: '24px',
  fontSize: '14px',
}

export function LoginForm({
  callbackUrl = '',
  error,
  message,
  registerHref,
  variant = 'customer',
}: LoginFormProps) {
  const errorMessage = mapError(error)
  const successMessage = mapError(message)
  const isPublisher = variant === 'publisher'

  const heading = isPublisher ? 'Masuk ke Portal Penerbit' : 'Masuk ke BUKOO'
  const subtitle = isPublisher
    ? 'Kelola koleksi buku dan pantau royalti Anda.'
    : 'Masukkan email dan password untuk mengelola akun BUKOO kamu'

  return (
    <div>
      <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>{heading}</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px', lineHeight: '1.6' }}>{subtitle}</p>

      {errorMessage && <div style={ERROR_BANNER_STYLE}>{errorMessage}</div>}
      {successMessage && <div style={OK_BANNER_STYLE}>{successMessage}</div>}

      <form action={signIn} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        {isPublisher ? (
          <div className="pub-fg">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" placeholder="nama@penerbit.id" required />
          </div>
        ) : (
          <div>
            <label htmlFor="email" className="auth-label">Email</label>
            <input id="email" name="email" type="email" placeholder="nama@email.com" required className="auth-input" />
          </div>
        )}

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label htmlFor="password" style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>
              Password
            </label>
            <Link
              href="/forgot-password"
              style={{ fontSize: '13px', color: 'var(--teal)', textDecoration: 'none', fontWeight: '600' }}
            >
              Lupa password?
            </Link>
          </div>
          <PasswordInput id="password" name="password" required className={isPublisher ? 'pub-input' : 'auth-input'} />
        </div>

        <SubmitButton
          className={isPublisher ? 'form-submit' : 'price-cta-btn price-cta-filled'}
          style={{ marginTop: '8px', border: 'none', width: '100%' }}
        >
          Masuk
        </SubmitButton>
      </form>

      <div style={{ margin: '32px 0', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>Atau</div>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
      </div>

      <form action={signInWithGoogle}>
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <GoogleButton label="Masuk dengan Google" className={isPublisher ? 'pub-btn-social' : 'auth-btn-social'} />
      </form>

      <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
        Belum punya akun?{' '}
        <Link href={registerHref} style={{ color: 'var(--teal)', fontWeight: '600', textDecoration: 'none' }}>
          {isPublisher ? 'Daftar sebagai penerbit' : 'Daftar sekarang'}
        </Link>
      </div>
    </div>
  )
}
