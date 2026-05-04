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
    <div style={{ maxWidth: '512px', margin: '0 auto', padding: '48px 16px', boxSizing: 'border-box' }}>
      <h1 style={{ fontSize: '30px', fontWeight: '800', letterSpacing: '-0.025em', color: '#00181A', margin: 0 }}>Akun saya</h1>
      <p style={{ marginTop: '8px', fontSize: '14px', color: '#6B7280' }}>
        Kelola profil dan akses pembaca Anda.
      </p>

      <div style={{ marginTop: '40px', borderRadius: '16px', border: '1px solid #E5E7EB', backgroundColor: '#ffffff', padding: '24px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
        {!session?.user ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ color: '#6B7280', margin: 0 }}>Anda belum masuk.</p>
            <Link
              href="/login"
              style={{ display: 'inline-flex', justifyContent: 'center', borderRadius: '9999px', backgroundColor: '#00181A', padding: '10px 24px', fontSize: '14px', fontWeight: '700', color: '#ffffff', textDecoration: 'none', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}
            >
              Masuk
            </Link>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
              Belum punya akun?{' '}
              <Link href="/register" style={{ fontWeight: '600', color: '#00181A', textDecoration: 'underline', textUnderlineOffset: '4px' }}>
                Daftar
              </Link>
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6B7280' }}>Nama</div>
              <div style={{ marginTop: '4px', fontSize: '18px', fontWeight: '600', color: '#111827' }}>{session.user.name ?? '—'}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6B7280' }}>Email</div>
              <div style={{ marginTop: '4px', fontSize: '18px', fontWeight: '600', color: '#111827' }}>{session.user.email ?? '—'}</div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', paddingTop: '8px' }}>
              <AccountSignOut />
              <Link
                href="/library"
                style={{ display: 'inline-flex', alignItems: 'center', borderRadius: '9999px', border: '1px solid #D1D5DB', backgroundColor: '#ffffff', padding: '10px 24px', fontSize: '14px', fontWeight: '700', color: '#111827', textDecoration: 'none' }}
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
