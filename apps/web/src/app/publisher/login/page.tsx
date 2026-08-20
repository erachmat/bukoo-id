import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { safeCallbackUrl, defaultRedirectForRole } from '@/lib/auth-helpers'
import { LoginForm } from '@/components/auth/login-form'

export default async function PublisherLoginPage(props: {
  searchParams: Promise<{ error?: string; message?: string; callbackUrl?: string }>
}) {
  const params = await props.searchParams

  const session = await auth()
  if (session) {
    // Middleware already routes PUBLISHER here → dashboard. For any other role
    // (e.g. a customer on the publisher domain), go to their role home to
    // avoid bouncing off the PUBLISHER-gated dashboard.
    const role = (session.user as { role?: string } | undefined)?.role;
    redirect(safeCallbackUrl(params.callbackUrl, defaultRedirectForRole(role)));
  }

  const callbackUrl = safeCallbackUrl(params.callbackUrl, '/publisher/dashboard')

  return (
    <div className="pub-auth-wrap">
      <div className="pub-auth-card">
        <div className="pub-auth-brand">
          <div className="logo-bukoo" style={{ fontSize: '32px' }}>BUKOO</div>
          <div className="logo-sub" style={{ fontSize: '12px' }}>Publisher Portal</div>
        </div>
        <div className="form-card">
          <LoginForm
            callbackUrl={callbackUrl}
            error={params.error}
            message={params.message}
            registerHref="/publisher/register"
            variant="publisher"
          />
        </div>
      </div>
    </div>
  )
}
