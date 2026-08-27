'use client'

import { useTransition } from 'react'
import { setBookFeatured } from '../actions'

export function FeaturedToggleButton({ bookId, featured, disabled }: { bookId: string; featured: boolean; disabled: boolean }) {
  const [pending, startTransition] = useTransition()
  const handleClick = () => {
    startTransition(async () => {
      try {
        await setBookFeatured(bookId, !featured)
      } catch (error) {
        window.alert(error instanceof Error ? error.message : 'Gagal mengubah status unggulan.')
      }
    })
  }

  return <button type="button" onClick={handleClick} disabled={disabled || pending} aria-label={featured ? 'Hapus dari unggulan' : 'Jadikan unggulan'} style={{ border: '1px solid #E8ECF0', borderRadius: 7, background: featured ? '#FFF7E6' : '#fff', color: featured ? '#B7791F' : '#6B7A8D', padding: '5px 8px', cursor: disabled || pending ? 'default' : 'pointer', opacity: pending ? 0.6 : 1 }}>{pending ? '...' : featured ? '★ Unggulan' : '☆ Unggulkan'}</button>
}