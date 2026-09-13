'use client';

import { useActionState } from 'react';
import { closeRoyaltyPeriod, type ClosePeriodState } from './actions';

const initialState: ClosePeriodState = { ok: false, message: '' };

export interface PublisherOption {
  id: string;
  label: string;
  bookCount: number;
}

export function ClosePeriodForm({ publishers }: { publishers: PublisherOption[] }) {
  const [state, action, pending] = useActionState(closeRoyaltyPeriod, initialState);

  // Default: previous calendar month (the usual close target).
  const now = new Date();
  const prev = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const defaultMonth = `${prev.getUTCFullYear()}-${String(prev.getUTCMonth() + 1).padStart(2, '0')}`;

  return (
    <form
      action={action}
      style={{
        maxWidth: 560,
        background: 'var(--ad-panel)',
        padding: 24,
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
    >
      <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--ad-text)', marginTop: 0 }}>
        Tutup periode royalti
      </h2>
      <p style={{ color: 'var(--ad-dim)', fontSize: 13, lineHeight: 1.6 }}>
        Snapshot dihitung dari detik baca bulan tersebut dan tidak dapat dihitung ulang kecuali
        snapshot dihapus. Pajak PPh 23 (23%) dipotong per baris buku.
      </p>

      <label style={{ display: 'block', color: 'var(--ad-text)', fontSize: 13, fontWeight: 600, marginTop: 20 }}>
        Penerbit
        <select
          name="publisherUserId"
          required
          defaultValue=""
          style={{ display: 'block', width: '100%', marginTop: 8, padding: '10px 12px', border: '1px solid #DDE3E9', borderRadius: 8, background: '#fff' }}
        >
          <option value="" disabled>
            {publishers.length === 0 ? 'Tidak ada penerbit dengan buku' : 'Pilih penerbit…'}
          </option>
          {publishers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label} ({p.bookCount} buku)
            </option>
          ))}
        </select>
      </label>

      <label style={{ display: 'block', color: 'var(--ad-text)', fontSize: 13, fontWeight: 600, marginTop: 16 }}>
        Periode (bulan)
        <input
          name="periodMonth"
          type="month"
          defaultValue={defaultMonth}
          required
          style={{ display: 'block', width: '100%', marginTop: 8, padding: '10px 12px', border: '1px solid #DDE3E9', borderRadius: 8 }}
        />
      </label>

      <button
        type="submit"
        disabled={pending || publishers.length === 0}
        style={{
          marginTop: 20,
          padding: '10px 16px',
          border: 0,
          borderRadius: 8,
          background: '#00C9A7',
          color: '#fff',
          fontWeight: 700,
          cursor: pending ? 'wait' : 'pointer',
        }}
      >
        {pending ? 'Memproses…' : 'Tutup periode'}
      </button>

      {state.message && (
        <p role="status" style={{ color: state.ok ? '#16835F' : '#C0392B', fontSize: 13, marginBottom: 0, marginTop: 12 }}>
          {state.message}
        </p>
      )}
    </form>
  );
}
