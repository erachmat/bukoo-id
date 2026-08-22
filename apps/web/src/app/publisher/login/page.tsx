import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { safeCallbackUrl, defaultRedirectForRole } from '@/lib/auth-helpers'
import { LoginForm } from '@/components/auth/login-form'

export const metadata = {
  title: 'BUKOO Publisher — Masuk',
  description: 'Masuk ke portal penerbit BUKOO untuk mengelola katalog, royalti, dan insight pembaca.',
}

export default async function PublisherLoginPage(props: {
  searchParams: Promise<{ error?: string; message?: string; callbackUrl?: string }>
}) {
  const params = await props.searchParams

  const session = await auth()
  if (session) {
    const role = (session.user as { role?: string } | undefined)?.role;
    redirect(safeCallbackUrl(params.callbackUrl, defaultRedirectForRole(role)));
  }

  const callbackUrl = safeCallbackUrl(params.callbackUrl, '/publisher/dashboard')

  return (
    <div className="pub-auth-dark">
      <div className="pub-auth-dark-card">
        <div className="pub-auth-dark-brand">
          <div className="pub-auth-dark-logo">
            <img src="/bukoo-logo.svg" alt="BUKOO" className="pub-auth-dark-logo-img" />
            <span>BUKOO</span>
          </div>
          <div className="pub-auth-dark-sub">Publisher Portal</div>
        </div>
        <LoginForm
          callbackUrl={callbackUrl}
          error={params.error}
          message={params.message}
          registerHref="/publisher/register"
          variant="publisher"
        />
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 10.5, color: 'rgba(255,255,255,0.3)' }}>
          Belum punya akun penerbit?{' '}
          <a href="/publisher/register" style={{ color: '#00C9A7', textDecoration: 'none', fontWeight: 700 }}>
            Daftar di sini &rarr;
          </a>
        </p>
      </div>
    </div>
  )
}
