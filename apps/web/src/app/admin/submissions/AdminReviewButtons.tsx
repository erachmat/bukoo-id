'use client'

import { useTransition } from 'react'
import { adminReviewSubmission } from './actions'

export function AdminReviewActions({ submissionId }: { submissionId: string }) {
  const [isPending, startTransition] = useTransition()

  const review = (decision: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED', note?: string) => {
    if (decision !== 'APPROVED' && !note) {
      const input = window.prompt('Catatan untuk penerbit:')
      if (input === null) return
      note = input
    }
    startTransition(async () => {
      try {
        await adminReviewSubmission(submissionId, decision, note)
        window.location.reload()
      } catch (err: unknown) {
        alert((err as Error).message || 'Gagal memperbarui status.')
      }
    })
  }

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <button
        onClick={() => review('APPROVED')}
        disabled={isPending}
        style={{
          fontSize: 12, fontWeight: 700, padding: '6px 12px', borderRadius: 8, border: 'none',
          background: '#27AE60', color: '#fff', cursor: 'pointer',
        }}
      >
        Setujui
      </button>
      <button
        onClick={() => review('CHANGES_REQUESTED')}
        disabled={isPending}
        style={{
          fontSize: 12, fontWeight: 700, padding: '6px 12px', borderRadius: 8, border: '1px solid #B7791F',
          background: '#FFF7E6', color: '#B7791F', cursor: 'pointer',
        }}
      >
        Minta Revisi
      </button>
      <button
        onClick={() => review('REJECTED')}
        disabled={isPending}
        style={{
          fontSize: 12, fontWeight: 700, padding: '6px 12px', borderRadius: 8, border: '1px solid #E05A3A',
          background: '#FEF2F2', color: '#E05A3A', cursor: 'pointer',
        }}
      >
        Tolak
      </button>
    </div>
  )
}