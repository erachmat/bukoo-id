'use client'

import { signOut } from 'next-auth/react'

export function AccountSignOut() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: '/' })}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '9999px',
        backgroundColor: '#C9952A',
        padding: '10px 24px',
        fontSize: '14px',
        fontWeight: '700',
        color: '#00181A',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        transition: 'filter 0.2s',
      }}
      onMouseOver={(e) => (e.currentTarget.style.filter = 'brightness(1.05)')}
      onMouseOut={(e) => (e.currentTarget.style.filter = 'brightness(1)')}
    >
      Keluar
    </button>
  )
}
