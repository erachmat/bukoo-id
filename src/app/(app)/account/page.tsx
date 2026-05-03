import type { Metadata } from 'next'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { AccountSignOut } from './account-sign-out'

export const metadata: Metadata = {
  title: 'Akun',
}

export default async function AccountPage() {
  const session = await auth()

  return (
    <div className="mx-auto max-w-lg px-4 py-12 md:px-8 md:py-16">
      <h1 className="text-3xl font-extrabold tracking-tight text-[#00181A]">Akun saya</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Kelola profil dan akses pembaca Anda.
      </p>

      <div className="mt-10 rounded-2xl border border-border bg-white p-6 shadow-sm">
        {!session?.user ? (
          <div className="space-y-4">
            <p className="text-muted-foreground">Anda belum masuk.</p>
            <Link
              href="/login"
              className="inline-flex rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow hover:opacity-90"
            >
              Masuk
            </Link>
            <p className="text-sm text-muted-foreground">
              Belum punya akun?{' '}
              <Link href="/register" className="font-semibold text-primary underline-offset-4 hover:underline">
                Daftar
              </Link>
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nama</div>
              <div className="mt-1 text-lg font-semibold">{session.user.name ?? '—'}</div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</div>
              <div className="mt-1 text-lg font-semibold">{session.user.email ?? '—'}</div>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <AccountSignOut />
              <Link
                href="/library"
                className="inline-flex items-center rounded-full border border-input bg-background px-6 py-2.5 text-sm font-bold hover:bg-muted"
              >
                Ke Library
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
