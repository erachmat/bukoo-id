import Link from 'next/link'
import type { CSSProperties } from 'react'
import { signInWithGoogle } from '@/app/(auth)/actions'
import { mapError } from '@/app/(auth)/errors'
import { PasswordInput } from '@/components/auth/password-input'
import { SubmitButton } from '@/components/auth/submit-button'
import { GoogleButton } from '@/components/auth/google-button'

interface RegisterFormProps {
  /** Server action that creates the account ('signUp' or 'signUpPublisher'). */
  action: (formData: FormData) => Promise<void>
  /** Sanitized post-register destination (hidden input; re-sanitized in the action). */
  callbackUrl?: string
  error?: string
  success?: string
  /** Pre-fill the email field after an error (so users don't retype it). */
  email?: string
  /** Where the "Masuk" link points ('/login' or '/publisher/login'). */
  loginHref: string
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
  background: 'rgba(0,201,167,0.1)',
  border: '1px solid rgba(0,201,167,0.3)',
  color: 'var(--teal)',
  padding: '16px',
  borderRadius: '12px',
  marginBottom: '24px',
  fontSize: '14px',
}

export function RegisterForm({
  action,
  callbackUrl = '',
  error,
  success,
  email,
  loginHref,
  variant = 'customer',
}: RegisterFormProps) {
  const errorMessage = mapError(error)
  const successMessage = mapError(success)
  const isPublisher = variant === 'publisher'

  const heading = isPublisher ? 'Daftar Portal Penerbit' : 'Mulai Gratis 7 Hari'
  const subtitle = isPublisher
    ? 'Kelola koleksi buku, pantau royalti, dan jangkau 2.000+ pembaca BUKOO.'
    : 'Buat akun dan nikmati akses ke 2.000+ buku tanpa biaya apapun.'
  const submitLabel = isPublisher ? 'Daftar sebagai Penerbit' : 'Mulai Gratis 7 Hari →'

  return (
    <div>
      <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>{heading}</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px', lineHeight: '1.6' }}>{subtitle}</p>

      {errorMessage && <div style={ERROR_BANNER_STYLE}>{errorMessage}</div>}
      {successMessage && <div style={OK_BANNER_STYLE}>{successMessage}</div>}

      {!isPublisher && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '28px' }}>
          {[
            '✅ 2.000+ judul buku digital',
            '✅ Gratis 7 hari, tanpa kartu kredit',
            '✅ Batal kapan saja',
          ].map((item) => (
            <div key={item} style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', fontWeight: '500' }}>{item}</div>
          ))}
        </div>
      )}

      <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        {isPublisher ? (
          <div className="pub-fg">
            <label htmlFor="name">Nama / Nama Penerbit</label>
            <input id="name" name="name" type="text" placeholder="mis. Penerbit Nusantara" required />
          </div>
        ) : (
          <div>
            <label htmlFor="name" className="auth-label">Nama Lengkap</label>
            <input id="name" name="name" type="text" placeholder="Budi Santoso" required className="auth-input" />
          </div>
        )}

        {isPublisher ? (
          <div className="pub-fg">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" placeholder="nama@penerbit.id" required defaultValue={email ?? ''} />
          </div>
        ) : (
          <div>
            <label htmlFor="email" className="auth-label">Email</label>
            <input id="email" name="email" type="email" placeholder="nama@email.com" required className="auth-input" defaultValue={email ?? ''} />
          </div>
        )}

        <div>
          <label htmlFor="password" className={isPublisher ? undefined : 'auth-label'} style={isPublisher ? { display: 'block', fontSize: '12px', fontWeight: '600', color: 'rgba(240,237,230,0.7)', marginBottom: '6px' } : undefined}>
            Password
          </label>
          <PasswordInput
            id="password"
            name="password"
            minLength={6}
            required
            className={isPublisher ? 'pub-input' : 'auth-input'}
            placeholder="Minimal 6 karakter"
          />
        </div>

        <SubmitButton
          className={isPublisher ? 'form-submit' : 'price-cta-btn price-cta-filled'}
          style={{ marginTop: '8px', border: 'none', width: '100%' }}
        >
          {submitLabel}
        </SubmitButton>
      </form>

      <div style={{ margin: '24px 0', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>Atau</div>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
      </div>

      <form action={signInWithGoogle}>
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <GoogleButton label="Daftar dengan Google" className={isPublisher ? 'pub-btn-social' : 'auth-btn-social'} />
      </form>

      <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '24px', lineHeight: '1.6' }}>
        Dengan mendaftar, Anda menyetujui{' '}
        <Link href="/syarat-ketentuan" style={{ color: 'var(--teal)', textDecoration: 'none' }}>Syarat & Ketentuan</Link>
        {' '}dan{' '}
        <Link href="/privasi" style={{ color: 'var(--teal)', textDecoration: 'none' }}>Kebijakan Privasi</Link>
        {' '}kami.
      </p>

      <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
        Sudah punya akun?{' '}
        <Link href={loginHref} style={{ color: 'var(--teal)', fontWeight: '600', textDecoration: 'none' }}>
          Masuk di sini
        </Link>
      </div>
    </div>
  )
}
