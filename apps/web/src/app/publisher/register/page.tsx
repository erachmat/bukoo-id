import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { signUpPublisher } from '@/app/(auth)/actions'
import { safeCallbackUrl, defaultRedirectForRole } from '@/lib/auth-helpers'
import { RegisterForm } from '@/components/auth/register-form'

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
    <div className="pub-auth-wrap">
      <div className="pub-auth-card">
        <div className="pub-auth-brand">
          <div className="logo-bukoo" style={{ fontSize: '32px' }}>BUKOO</div>
          <div className="logo-sub" style={{ fontSize: '12px' }}>Publisher Portal</div>
        </div>
        <div className="form-card">
          <RegisterForm
            action={signUpPublisher}
            callbackUrl={callbackUrl}
            error={params.error}
            success={params.success}
            email={params.email}
            loginHref="/publisher/login"
            variant="publisher"
          />
        </div>
      </div>
    </div>
  )
}
