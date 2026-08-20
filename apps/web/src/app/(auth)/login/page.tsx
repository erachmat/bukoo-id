import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { safeCallbackUrl } from '@/lib/auth-helpers'
import { LoginForm } from '@/components/auth/login-form'

export default async function LoginPage(props: {
  searchParams: Promise<{ error?: string; message?: string; callbackUrl?: string }>
}) {
  const params = await props.searchParams

  const session = await auth()
  if (session) {
    // Already signed in — honor a deep-link callbackUrl, otherwise go home.
    redirect(safeCallbackUrl(params.callbackUrl, '/library'))
  }

  return (
    <LoginForm
      callbackUrl={params.callbackUrl}
      error={params.error}
      message={params.message}
      registerHref="/register"
      variant="customer"
    />
  )
}
