'use client'

import { useTransition } from 'react'
import { deletePublisherBook } from './actions'

export function DeletePublisherBookButton({ bookId, bookTitle }: { bookId: string; bookTitle: string }) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm(`Hapus buku "${bookTitle}"? Tindakan ini tidak dapat dibatalkan.`)) return
    startTransition(async () => {
      try {
        await deletePublisherBook(bookId)
      } catch (err: unknown) {
        alert((err as Error).message || 'Gagal menghapus buku.')
      }
    })
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      style={{
        fontSize: 12,
        fontWeight: 600,
        color: '#E05A3A',
        cursor: isPending ? 'wait' : 'pointer',
        padding: '5px 12px',
        borderRadius: 8,
        border: '1px solid rgba(224,90,58,0.3)',
        background: 'rgba(224,90,58,0.06)',
        opacity: isPending ? 0.6 : 1,
        fontFamily: 'inherit',
      }}
    >
      {isPending ? '...' : 'Hapus'}
    </button>
  )
}
