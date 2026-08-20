import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { signUp } from '../actions'
import { safeCallbackUrl } from '@/lib/auth-helpers'
import { RegisterForm } from '@/components/auth/register-form'

export default async function RegisterPage(props: {
  searchParams: Promise<{ error?: string; success?: string; email?: string; callbackUrl?: string }>
}) {
  const params = await props.searchParams

  const session = await auth()
  if (session) {
    redirect(safeCallbackUrl(params.callbackUrl, '/library'))
  }

  return (
    <RegisterForm
      action={signUp}
      callbackUrl={params.callbackUrl}
      error={params.error}
      success={params.success}
      email={params.email}
      loginHref="/login"
      variant="customer"
    />
  )
}
