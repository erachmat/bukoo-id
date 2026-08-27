'use client';

import { useActionState } from 'react';
import { saveRoyaltySettings, type RoyaltySettingsState } from './actions';

const initialState: RoyaltySettingsState = { ok: false, message: '' };

export function RoyaltySettingsForm({ monthlyPool, rateBps }: { monthlyPool: string; rateBps: string }) {
  const [state, action, pending] = useActionState(saveRoyaltySettings, initialState);

  return (
    <form action={action} style={{ maxWidth: 560, background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1A2332', marginTop: 0 }}>Konfigurasi estimasi royalti</h2>
      <p style={{ color: '#6B7A8D', fontSize: 13, lineHeight: 1.6 }}>
        Nilai ini diatur admin dan digunakan sebagai estimasi, bukan janji pembayaran atau transfer otomatis.
      </p>
      <label style={{ display: 'block', color: '#1A2332', fontSize: 13, fontWeight: 600, marginTop: 20 }}>
        Pool pendapatan bulanan (IDR)
        <input name="monthlyPool" type="number" min="0" step="1" defaultValue={monthlyPool} required style={{ display: 'block', width: '100%', marginTop: 8, padding: '10px 12px', border: '1px solid #DDE3E9', borderRadius: 8 }} />
      </label>
      <label style={{ display: 'block', color: '#1A2332', fontSize: 13, fontWeight: 600, marginTop: 16 }}>
        Bagian penerbit (basis poin, 6500 = 65%)
        <input name="rateBps" type="number" min="0" max="10000" step="1" defaultValue={rateBps} required style={{ display: 'block', width: '100%', marginTop: 8, padding: '10px 12px', border: '1px solid #DDE3E9', borderRadius: 8 }} />
      </label>
      <button type="submit" disabled={pending} style={{ marginTop: 20, padding: '10px 16px', border: 0, borderRadius: 8, background: '#00C9A7', color: '#fff', fontWeight: 700, cursor: pending ? 'wait' : 'pointer' }}>
        {pending ? 'Menyimpan...' : 'Simpan pengaturan'}
      </button>
      {state.message && <p role="status" style={{ color: state.ok ? '#16835F' : '#C0392B', fontSize: 13, marginBottom: 0 }}>{state.message}</p>}
    </form>
  );
}
