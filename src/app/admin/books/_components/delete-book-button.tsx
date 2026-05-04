'use client'

import { useTransition } from 'react'
import { deleteBook } from '../actions'

export function DeleteBookButton({ bookId, bookTitle }: { bookId: string; bookTitle: string }) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm(`Hapus buku "${bookTitle}"? Tindakan ini tidak dapat dibatalkan.`)) return
    startTransition(() => deleteBook(bookId))
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
