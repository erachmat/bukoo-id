'use client'

import { useTransition } from 'react'
import { deleteUser } from '../actions'

export function DeleteUserButton({ userId, userName }: { userId: string; userName: string }) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm(`Hapus pengguna "${userName}"? Tindakan ini tidak dapat dibatalkan.`)) return
    startTransition(() => deleteUser(userId))
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      style={{
        fontSize: 13, fontWeight: 600, color: '#EF4444', cursor: isPending ? 'wait' : 'pointer',
        padding: '5px 12px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)',
        background: 'rgba(239,68,68,0.06)', opacity: isPending ? 0.6 : 1,
      }}
    >
      {isPending ? '...' : 'Hapus'}
    </button>
  )
}
