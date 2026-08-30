'use client'

import { useTransition } from 'react'
import { updateUserRole } from '../actions'

const ROLES = ['USER', 'PUBLISHER', 'CONTENT_MANAGER', 'ADMIN']

export function UserRoleSelect({ userId, currentRole }: { userId: string; currentRole: string }) {
  const [isPending, startTransition] = useTransition()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newRole = e.target.value
    startTransition(() => updateUserRole(userId, newRole))
  }

  return (
    <select
      defaultValue={currentRole}
      onChange={handleChange}
      disabled={isPending}
      style={{
        padding: '5px 10px', borderRadius: 8, border: '1px solid var(--ad-border)',
        fontSize: 12, fontWeight: 700, color: 'var(--ad-dim)', background: 'var(--ad-bg)',
        cursor: isPending ? 'wait' : 'pointer', opacity: isPending ? 0.6 : 1,
      }}
    >
      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
    </select>
  )
}
