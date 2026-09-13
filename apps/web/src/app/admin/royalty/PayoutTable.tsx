'use client';

import { useActionState, useState } from 'react';
import { updatePayoutStatus, type PayoutActionState, type AdminPayoutRow } from './payout-actions';

const initialState: PayoutActionState = { ok: false, message: '' };

interface PayoutTableProps {
  payouts: AdminPayoutRow[];
}

export function PayoutTable({ payouts }: PayoutTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [state, action, pending] = useActionState(updatePayoutStatus, initialState);

  const validNext = (current: string): string[] => {
    switch (current) {
      case 'SCHEDULED':
        return ['PROCESSING', 'CANCELED'];
      case 'PROCESSING':
        return ['PAID', 'FAILED', 'CANCELED'];
      case 'FAILED':
        return ['PROCESSING', 'CANCELED'];
      case 'CANCELED':
        return ['SCHEDULED'];
      default:
        return [];
    }
  };

  const fmtIdr = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;
  const fmtDate = (iso: string | null) => iso?.slice(0, 16).replace('T', ' ') ?? '—';

  if (payouts.length === 0) {
    return <p style={{ color: 'var(--ad-dim)', fontSize: 14, marginTop: 16 }}>Belum ada payout.</p>;
  }

  return (
    <div style={{ overflowX: 'auto', marginTop: 16 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, background: 'var(--ad-panel)', borderRadius: 8 }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #E5E9EE' }}>
            <th style={{ padding: '10px 12px' }}>Penerbit</th>
            <th style={{ padding: '10px 12px' }}>Periode</th>
            <th style={{ padding: '10px 12px', textAlign: 'right' }}>Jumlah</th>
            <th style={{ padding: '10px 12px' }}>Status</th>
            <th style={{ padding: '10px 12px' }}>Ref eksternal</th>
            <th style={{ padding: '10px 12px' }}>Dibuat</th>
            <th style={{ padding: '10px 12px' }}>Diperbarui</th>
            <th style={{ padding: '10px 12px' }}></th>
          </tr>
        </thead>
        <tbody>
          {payouts.map((p) => (
            <tr key={p.id} style={{ borderBottom: '1px solid #F0F2F5' }}>
              <td style={{ padding: '10px 12px', color: 'var(--ad-text)' }}>{p.publisherName}</td>
              <td style={{ padding: '10px 12px', color: 'var(--ad-text)' }}>{p.periodStart.slice(0, 7)}</td>
              <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: 'var(--ad-text)' }}>{fmtIdr(p.amount)}</td>
              <td style={{ padding: '10px 12px' }}>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                  background: p.status === 'PAID' ? '#DFF5EC' : p.status === 'PROCESSING' ? '#FFF3E0' : p.status === 'FAILED' ? '#FDEDEC' : p.status === 'CANCELED' ? '#F4F5F7' : '#E8F0FE',
                  color: p.status === 'PAID' ? '#16835F' : p.status === 'PROCESSING' ? '#B57700' : p.status === 'FAILED' ? '#C0392B' : p.status === 'CANCELED' ? '#555' : '#2C5FB8',
                }}>
                  {p.status}
                </span>
              </td>
              <td style={{ padding: '10px 12px', color: 'var(--ad-dim)', fontSize: 12, fontFamily: 'monospace' }}>{p.externalRef || '—'}</td>
              <td style={{ padding: '10px 12px', color: 'var(--ad-dim)' }}>{fmtDate(p.createdAt)}</td>
              <td style={{ padding: '10px 12px', color: 'var(--ad-dim)' }}>{fmtDate(p.updatedAt)}</td>
              <td style={{ padding: '10px 12px' }}>
                {p.status === 'PAID' ? (
                  <span style={{ color: 'var(--ad-dim)', fontSize: 12 }}>Selesai</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                    style={{
                      padding: '4px 10px',
                      border: '1px solid #DDE3E9',
                      borderRadius: 6,
                      background: '#fff',
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    {expandedId === p.id ? 'Tutup' : 'Ubah status'}
                  </button>
                )}
              </td>
            </tr>
          ))}
          {expandedId && (
            <tr style={{ background: '#F9FAFC' }}>
              <td colSpan={8} style={{ padding: '16px 12px' }}>
                {payouts.map((p) => {
                  if (p.id !== expandedId) return null;
                  const nextStatuses = validNext(p.status);
                  if (nextStatuses.length === 0) return null;

                  return (
                    <form
                      key={p.id}
                      action={action}
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 8,
                        alignItems: 'center',
                        background: 'var(--ad-panel)',
                        padding: '12px',
                        borderRadius: 8,
                        border: '1px solid #E5E9EE',
                      }}
                    >
                      <input type="hidden" name="payoutId" value={p.id} />
                      <label style={{ fontSize: 12, color: 'var(--ad-text)', fontWeight: 600 }}>
                        Status baru:
                        <select
                          name="status"
                          required
                          style={{
                            marginLeft: 8,
                            padding: '6px 10px',
                            border: '1px solid #DDE3E9',
                            borderRadius: 6,
                            fontSize: 12,
                            background: '#fff',
                          }}
                        >
                          <option value="" disabled>Pilih…</option>
                          {nextStatuses.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </label>
                      <label style={{ fontSize: 12, color: 'var(--ad-text)' }}>
                        Ref eksternal:
                        <input
                          name="externalRef"
                          type="text"
                          placeholder="ID transaksi bank/gateway"
                          style={{
                            marginLeft: 8,
                            padding: '6px 10px',
                            border: '1px solid #DDE3E9',
                            borderRadius: 6,
                            fontSize: 12,
                            background: '#fff',
                            width: 220,
                          }}
                        />
                      </label>
                      {nextStatuses.includes('FAILED') && (
                        <label style={{ fontSize: 12, color: 'var(--ad-text)' }}>
                          Alasan gagal (wajib untuk FAILED):
                          <input
                            name="failureReason"
                            type="text"
                            placeholder="Mis. dana tidak cukup, rekening salah"
                            style={{
                              marginLeft: 8,
                              padding: '6px 10px',
                              border: '1px solid #DDE3E9',
                              borderRadius: 6,
                              fontSize: 12,
                              background: '#fff',
                              width: 260,
                            }}
                          />
                        </label>
                      )}
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
                        {pending ? 'Memproses…' : 'Simpan'}
                      </button>
                      {state.message && (
                        <span style={{ fontSize: 11, color: state.ok ? '#16835F' : '#C0392B' }}>
                          {state.message}
                        </span>
                      )}
                    </form>
                  );
                })}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}