import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { safeCallbackUrl, defaultRedirectForRole } from '@/lib/auth-helpers'
import { PublisherRegisterForm } from '@/components/publisher/publisher-register'

export const metadata = {
  title: 'BUKOO Publisher — Buat Akun Portal Penerbit',
  description: 'Buat akun portal penerbit BUKOO untuk mengajukan judul. Kerja sama dan publikasi buku tetap melalui proses peninjauan tim BUKOO.',
}

export default async function PublisherRegisterPage(props: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const params = await props.searchParams
  const session = await auth()
  if (session) {
    const role = (session.user as { role?: string } | undefined)?.role;
    redirect(safeCallbackUrl(params.callbackUrl, defaultRedirectForRole(role)));
  }

  const callbackUrl = safeCallbackUrl(params.callbackUrl, '/publisher/dashboard')

  return (
    <main className="publisher-register-standalone">
      <PublisherRegisterForm callbackUrl={callbackUrl} />
    </main>
  )
}
