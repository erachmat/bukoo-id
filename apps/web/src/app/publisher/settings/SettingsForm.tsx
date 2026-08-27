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

const cardStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
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
        <div className="pds-alert" style={{ background: 'rgba(52,211,153,0.10)', border: '1px solid rgba(52,211,153,0.28)' }}>
          <span className="ic">✓</span>
          <span className="txt" style={{ color: 'var(--pds-pos)', fontWeight: 700 }}>{msg}</span>
        </div>
      )}

      <div className="pds-page-head">
        <div>
          <div className="pds-page-title">Pengaturan Penerbit</div>
          <div className="pds-page-sub">Profil dan rekening pencairan Anda</div>
        </div>
      </div>

      <div className="pds-settings-grid">
        {/* Profile */}
        <form onSubmit={submitProfile} className="pds-panel" style={cardStyle}>
          <div style={{ fontFamily: 'var(--pds-serif)', fontSize: 18, color: '#fff' }}>👤 Profil Penerbit</div>
          <div className="pds-field">
            <label>Nama Akun</label>
            <input className="pds-inp" defaultValue={initialName} disabled />
          </div>
          <div className="pds-field">
            <label>Email</label>
            <input className="pds-inp" defaultValue={initialEmail} disabled />
          </div>
          <div className="pds-field">
            <label>Nama Penerbit (tampilan)</label>
            <input className="pds-inp" name="displayName" defaultValue={profile.displayName} placeholder="Nama yang tampil di katalog" />
          </div>
          <div className="pds-field">
            <label>Nama Hukum</label>
            <input className="pds-inp" name="legalName" defaultValue={profile.legalName} placeholder="Nama badan usaha / PT" />
          </div>
          <div className="pds-two-col">
            <div className="pds-field">
              <label>Kontak Email</label>
              <input className="pds-inp" name="contactEmail" defaultValue={profile.contactEmail} type="email" />
            </div>
            <div className="pds-field">
              <label>Kontak Telepon</label>
              <input className="pds-inp" name="contactPhone" defaultValue={profile.contactPhone} />
            </div>
          </div>
          <div className="pds-field">
            <label>Website</label>
            <input className="pds-inp" name="website" defaultValue={profile.website} type="url" />
          </div>
          <button type="submit" disabled={isPending} className="pds-btn pds-btn-primary" style={{ justifyContent: 'center', padding: '12px', fontSize: 12 }}>
            {isPending ? 'Menyimpan...' : 'Simpan Profil'}
          </button>
        </form>

        {/* Payout */}
        <form onSubmit={submitPayout} className="pds-panel" style={cardStyle}>
          <div style={{ fontFamily: 'var(--pds-serif)', fontSize: 18, color: '#fff' }}>💳 Rekening Pencairan</div>
          {payout.maskedAccount && (
            <div style={{ background: 'rgba(0,201,167,0.08)', border: '1px solid rgba(0,201,167,0.2)', color: 'var(--pds-teal)', padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 700 }}>
              Terhubung: {payout.bankCode ? payout.bankCode + ' ' : ''}{payout.maskedAccount}
            </div>
          )}
          <div className="pds-field">
            <label>Metode</label>
            <select name="method" className="pds-sel" defaultValue={payout.method}>
              <option value="BANK">Transfer Bank</option>
              <option value="EWALLET">E-Wallet</option>
            </select>
          </div>
          <div className="pds-field">
            <label>Kode Bank</label>
            <input className="pds-inp" name="bankCode" defaultValue={payout.bankCode} placeholder="cth: BCA" />
          </div>
          <div className="pds-field">
            <label>Nama Pemilik</label>
            <input className="pds-inp" name="accountHolderName" defaultValue={payout.accountHolderName} />
          </div>
          <div className="pds-field">
            <label>Nomor Rekening</label>
            <input className="pds-inp" name="accountNumber" placeholder="2568xxxxxxxx" />
            <div className="hint">
              Nomor rekening hanya disimpan sebagai referensi terenkripsi (••••xxxx). Untuk keamanan, masukkan ulang setiap kali menyimpan.
            </div>
          </div>
          <button type="submit" disabled={isPending} className="pds-btn pds-btn-primary" style={{ justifyContent: 'center', padding: '12px', fontSize: 12 }}>
            {isPending ? 'Menyimpan...' : 'Simpan Rekening'}
          </button>
        </form>
      </div>
    </>
  )
}