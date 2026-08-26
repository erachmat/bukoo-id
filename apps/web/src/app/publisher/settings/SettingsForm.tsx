'use client'

import { useTransition, useState } from 'react'
import { updatePublisherProfile, savePayoutAccount } from './actions'

interface SettingsFormProps {
  initialName: string
  initialEmail: string
  profile: {
    displayName: string
    legalName: string
    contactEmail: string
    contactPhone: string
    website: string
  }
  payout: {
    method: string
    bankCode: string
    accountHolderName: string
    maskedAccount: string
  }
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)',
  fontSize: 14, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', boxSizing: 'border-box',
  fontFamily: 'inherit',
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-mid)',
  textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6, fontFamily: 'inherit',
}

export function SettingsForm({ initialName, initialEmail, profile, payout }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition()
  const [msg, setMsg] = useState<string | null>(null)

  const submitProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMsg(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await updatePublisherProfile(fd)
        setMsg('Profil berhasil disimpan.')
      } catch (err: unknown) {
        setMsg((err as Error).message || 'Gagal menyimpan profil.')
      }
    })
  }

  const submitPayout = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMsg(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await savePayoutAccount(fd)
        setMsg('Rekening pencairan berhasil disimpan.')
      } catch (err: unknown) {
        setMsg((err as Error).message || 'Gagal menyimpan rekening.')
      }
    })
  }

  return (
    <>
      {msg && (
        <div style={{ background: '#E8F8F0', border: '1px solid #27AE60', color: '#1E7A43', padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontSize: 14, fontWeight: 600 }}>
          {msg}
        </div>
      )}

      <div className="pds-page-head">
        <div><div className="pds-page-title">Pengaturan Penerbit</div><div className="pds-page-sub">Profil dan rekening pencairan Anda</div></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'flex-start' }}>
        {/* Profile */}
        <form onSubmit={submitProfile} style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border)', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontFamily: 'var(--pds-serif)', fontSize: 18, color: '#fff' }}>👤 Profil Penerbit</div>
          <div>
            <label style={labelStyle}>Nama Akun</label>
            <input style={inputStyle} defaultValue={initialName} disabled />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input style={inputStyle} defaultValue={initialEmail} disabled />
          </div>
          <div>
            <label style={labelStyle}>Nama Penerbit (tampilan)</label>
            <input style={inputStyle} name="displayName" defaultValue={profile.displayName} placeholder="Nama yang tampil di katalog" />
          </div>
          <div>
            <label style={labelStyle}>Nama Hukum</label>
            <input style={inputStyle} name="legalName" defaultValue={profile.legalName} placeholder="Nama badan usaha / PT" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Kontak Email</label>
              <input style={inputStyle} name="contactEmail" defaultValue={profile.contactEmail} type="email" />
            </div>
            <div>
              <label style={labelStyle}>Kontak Telepon</label>
              <input style={inputStyle} name="contactPhone" defaultValue={profile.contactPhone} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Website</label>
            <input style={inputStyle} name="website" defaultValue={profile.website} type="url" />
          </div>
          <button type="submit" disabled={isPending} style={{ padding: '12px', borderRadius: 10, border: 'none', background: 'var(--amber)', color: 'var(--forest-dd)', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
            {isPending ? 'Menyimpan...' : 'Simpan Profil'}
          </button>
        </form>

        {/* Payout */}
        <form onSubmit={submitPayout} style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border)', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontFamily: 'var(--pds-serif)', fontSize: 18, color: '#fff' }}>💳 Rekening Pencairan</div>
          {payout.maskedAccount && (
            <div style={{ background: 'rgba(0,201,167,0.1)', border: '1px solid rgba(0,201,167,0.3)', color: 'var(--pds-teal)', padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 700 }}>
              Terhubung: {payout.bankCode ? payout.bankCode + ' ' : ''}{payout.maskedAccount}
            </div>
          )}
          <div>
            <label style={labelStyle}>Metode</label>
            <select name="method" style={inputStyle} defaultValue={payout.method}>
              <option value="BANK">Transfer Bank</option>
              <option value="EWALLET">E-Wallet</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Kode Bank</label>
            <input style={inputStyle} name="bankCode" defaultValue={payout.bankCode} placeholder="cth: BCA" />
          </div>
          <div>
            <label style={labelStyle}>Nama Pemilik</label>
            <input style={inputStyle} name="accountHolderName" defaultValue={payout.accountHolderName} />
          </div>
          <div>
            <label style={labelStyle}>Nomor Rekening</label>
            <input style={inputStyle} name="accountNumber" placeholder="2568xxxxxxxx" />
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
              Nomor rekening hanya disimpan sebagai referensi terenkripsi (••••xxxx). Untuk keamanan, masukkan ulang setiap kali menyimpan.
            </div>
          </div>
          <button type="submit" disabled={isPending} style={{ padding: '12px', borderRadius: 10, border: 'none', background: 'var(--amber)', color: 'var(--forest-dd)', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
            {isPending ? 'Menyimpan...' : 'Simpan Rekening'}
          </button>
        </form>
      </div>
    </>
  )
}