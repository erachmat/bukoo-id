import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { signUpPublisher } from '@/app/(auth)/actions'
import { safeCallbackUrl, defaultRedirectForRole } from '@/lib/auth-helpers'
import { RegisterForm } from '@/components/auth/register-form'

export const metadata = {
  title: 'BUKOO Publisher — Daftar Akun Penerbit',
  description: 'Buat akun penerbit BUKOO dan mulai distribusikan karya Anda ke jutaan pembaca Indonesia.',
}

export default async function PublisherRegisterPage(props: {
  searchParams: Promise<{ error?: string; success?: string; email?: string; callbackUrl?: string }>
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
          <div className="pub-auth-dark-logo">BUKOO</div>
          <div className="pub-auth-dark-sub">Publisher Portal</div>
        </div>
        <RegisterForm
          action={signUpPublisher}
          callbackUrl={callbackUrl}
          error={params.error}
          success={params.success}
          email={params.email}
          loginHref="/publisher/login"
          variant="publisher"
        />
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 10.5, color: 'rgba(255,255,255,0.3)' }}>
          Sudah punya akun?{' '}
          <a href="/publisher/login" style={{ color: '#00C9A7', textDecoration: 'none', fontWeight: 700 }}>
            Masuk di sini &rarr;
          </a>
        </p>
      </div>
    </div>
  )
}
