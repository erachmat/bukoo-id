'use client';

import { useState, useTransition } from 'react';
import { reviewCampaign } from './actions';

export function ReviewCampaignButtons({ campaignId }: { campaignId: string }) {
  const [note, setNote] = useState('');
  const [pending, startTransition] = useTransition();
  const review = (decision: 'APPROVED' | 'REJECTED') => startTransition(async () => {
    try { await reviewCampaign(campaignId, decision, note); } catch (error) { alert(error instanceof Error ? error.message : 'Gagal menyimpan tinjauan.'); }
  });
  return <div style={{ display: 'grid', gap: 6 }}><input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Catatan (opsional)" style={{ padding: 6, border: '1px solid #ddd', borderRadius: 6 }} /><div><button disabled={pending} onClick={() => review('APPROVED')}>Setujui</button>{' '}<button disabled={pending} onClick={() => review('REJECTED')}>Tolak</button></div></div>;
}