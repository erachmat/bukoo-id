import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { safeCallbackUrl, defaultRedirectForRole } from '@/lib/auth-helpers'
import { PublisherLoginForm } from '@/components/publisher/publisher-login'

export const metadata = {
  title: 'BUKOO Publisher — Masuk',
  description: 'Masuk ke portal penerbit BUKOO untuk mengelola katalog, royalti, dan insight pembaca.',
}

export default async function PublisherLoginPage(props: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const params = await props.searchParams

  const session = await auth()
  if (session) {
    const role = (session.user as { role?: string } | undefined)?.role;
    redirect(safeCallbackUrl(params.callbackUrl, defaultRedirectForRole(role)));
  }

  return (
    <main className="publisher-login-standalone">
      <PublisherLoginForm
        callbackUrl={safeCallbackUrl(params.callbackUrl, '/publisher/dashboard')}
        standalone
      />
    </main>
  )
}
