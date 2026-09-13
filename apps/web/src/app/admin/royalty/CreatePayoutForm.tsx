'use client';

import { useActionState, useState, useEffect } from 'react';
import { createPayout, type PayoutActionState } from './payout-actions';
import type { AdminPayoutAccount } from './payout-actions';

const initialState: PayoutActionState = { ok: false, message: '' };

export function CreatePayoutForm({ periodId }: { periodId: string; amount?: number }) {
  const [accounts, setAccounts] = useState<AdminPayoutAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [state, action, pending] = useActionState(createPayout, initialState);

  // Fetch active accounts on mount
  useEffect(() => {
    fetch('/api/admin/payout-accounts')
      .then((r) => r.json())
      .then((data) => {
        setAccounts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <span style={{ color: 'var(--ad-dim)', fontSize: 12 }}>Memuat…</span>;
  }

  return (
    <form action={action} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <input type="hidden" name="periodId" value={periodId} />
      <select
        name="payoutAccountId"
        style={{
          padding: '6px 10px',
          border: '1px solid #DDE3E9',
          borderRadius: 6,
          fontSize: 12,
          background: '#fff',
          minWidth: 180,
        }}
      >
        <option value="">Gunakan rekening aktif default</option>
        {accounts.map((acc) => (
          <option key={acc.id} value={acc.id}>
            {acc.method} ••••{acc.maskedAccount?.slice(-4) || '—'}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={pending}
        style={{
          padding: '6px 12px',
          border: 0,
          borderRadius: 6,
          background: '#00C9A7',
          color: '#fff',
          fontWeight: 600,
          fontSize: 12,
          cursor: pending ? 'wait' : 'pointer',
        }}
      >
        {pending ? 'Memproses…' : 'Buat payout'}
      </button>
      {state.message && (
        <span style={{ fontSize: 11, color: state.ok ? '#16835F' : '#C0392B', whiteSpace: 'nowrap' }}>
          {state.message}
        </span>
      )}
    </form>
  );
}