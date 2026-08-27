'use client';

import { useState, useTransition } from 'react';
import { setBookPublication } from './actions';

export function PublishToggleButton({ bookId, isPublished, publicationStatus }: { bookId: string; isPublished: boolean; publicationStatus: string }) {
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

  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
    <button type="button" onClick={handleClick} disabled={pending} style={{ fontSize: 12, fontWeight: 600, color: 'var(--pds-teal)', background: 'none', border: 0, cursor: pending ? 'wait' : 'pointer', padding: 0 }}>
      {pending ? 'Memproses...' : canUnpublish ? 'Tarik dari toko' : 'Terbitkan lagi'}
    </button>
    {error && <span role="alert" title={error} style={{ color: 'var(--pds-coral)', fontSize: 11 }}>Gagal</span>}
  </span>;
}
