'use client'

import { signOut } from 'next-auth/react'

export function AccountSignOut() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: '/' })}
      className="rounded-full bg-[#C9952A] px-6 py-2.5 text-sm font-bold text-[#00181A] shadow transition hover:brightness-105"
    >
      Keluar
    </button>
  )
}
