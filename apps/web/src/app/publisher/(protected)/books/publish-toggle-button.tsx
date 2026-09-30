'use client';

import { useState, useTransition } from 'react';
import { setBookPublication } from './actions';

export function PublishToggleButton({ bookId, bookTitle, isPublished, publicationStatus }: { bookId: string; bookTitle: string; isPublished: boolean; publicationStatus: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const canPublish = !isPublished && publicationStatus === 'UNPUBLISHED';
  const canUnpublish = isPublished;
  if (!canPublish && !canUnpublish) return null;

  const handleClick = () => {
    if (canUnpublish && !window.confirm('Tarik buku ini dari katalog publik?')) return;
    setError(null);
    startTransition(async () => {
      try {
        await setBookPublication(bookId, canUnpublish ? 'unpublish' : 'publish');
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'Gagal mengubah status buku.');
      }
    });
  };

  return <span className="pct-action-control">
    <button type="button" className="pct-action-button pct-publication-button" onClick={handleClick} disabled={pending} aria-label={`${canUnpublish ? 'Tarik dari toko' : 'Terbitkan lagi'}: ${bookTitle}`}>
      {pending ? 'Memproses...' : canUnpublish ? 'Tarik dari toko' : 'Terbitkan lagi'}
    </button>
    {error && <span role="alert" className="pct-action-error">{error}</span>}
  </span>;
}
