'use client'

import { useState, useTransition } from 'react'
import { archivePublisherBook } from './actions'

export function DeletePublisherBookButton({ bookId, bookTitle }: { bookId: string; bookTitle: string }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleDelete() {
    if (!confirm(`Arsipkan buku "${bookTitle}"? Buku tidak tampil di toko, tetapi data pembaca dan royalti tetap tersimpan. Buku dapat dipulihkan.`)) return
    setError(null)
    startTransition(async () => {
      try {
        await archivePublisherBook(bookId)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Gagal mengarsipkan buku.')
      }
    })
  }

  return (
    <span className="pct-action-control">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="pct-action-button pct-archive-button"
        aria-label={`Arsipkan buku ${bookTitle}`}
      >
        {isPending ? 'Mengarsipkan…' : 'Arsipkan'}
      </button>
      {error && <span role="alert" className="pct-action-error">{error}</span>}
    </span>
  )
}
