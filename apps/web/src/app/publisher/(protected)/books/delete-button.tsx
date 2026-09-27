'use client'

import { useTransition } from 'react'
import { archivePublisherBook } from './actions'

export function DeletePublisherBookButton({ bookId, bookTitle }: { bookId: string; bookTitle: string }) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm(`Arsipkan buku "${bookTitle}"? Buku tidak tampil di toko, tetapi data pembaca dan royalti tetap tersimpan. Buku dapat dipulihkan.`)) return
    startTransition(async () => {
      try {
        await archivePublisherBook(bookId)
      } catch (err: unknown) {
        alert((err as Error).message || 'Gagal mengarsipkan buku.')
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
        color: '#70571c',
        cursor: isPending ? 'wait' : 'pointer',
        padding: '5px 12px',
        borderRadius: 8,
        border: '1px solid #decfa8',
        background: '#fffaf0',
        opacity: isPending ? 0.6 : 1,
        fontFamily: 'inherit',
      }}
    >
      {isPending ? '...' : 'Arsipkan'}
    </button>
  )
}
