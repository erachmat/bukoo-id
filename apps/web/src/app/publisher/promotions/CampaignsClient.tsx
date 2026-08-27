'use client'

import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createCampaignRequest } from './actions'

export interface EligibleBook {
  id: string
  title: string
  author: string
  coverKey: string | null
}

export interface ClientCampaign {
  id: string
  campaignName: string
  bookId: string
  bookTitle: string
  startDate: string
  endDate: string
  goal: string | null
  notes: string | null
  budget: number | null
  status: string
  submittedAt: string
}

const STATUS_LABEL: Record<string, { label: string; tone: string }> = {
  SUBMITTED: { label: 'Diajukan', tone: 'pds-chip-review' },
  IN_REVIEW: { label: 'Dalam Review', tone: 'pds-chip-review' },
  APPROVED: { label: 'Disetujui', tone: 'pds-chip-live' },
  REJECTED: { label: 'Ditolak', tone: 'pds-chip-off' },
  COMPLETED: { label: 'Selesai', tone: 'pds-chip-live' },
  CANCELED: { label: 'Dibatalkan', tone: 'pds-chip-draft' },
}

const fmtDate = (d: string) =>
  new Date(d + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

const fmtRp = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

export function CampaignsClient({ books, campaigns }: { books: EligibleBook[]; campaigns: ClientCampaign[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    setError(null)
    setSuccess(null)
    const fd = new FormData(form)
    startTransition(async () => {
      try {
        await createCampaignRequest(fd)
        form.reset()
        setSuccess('Pengajuan kampanye berhasil dikirim ke tim BUKOO.')
        router.refresh()
      } catch (err) {
        const e2 = err as { message?: string }
        if (e2.message === 'NEXT_REDIRECT') throw err
        setError(e2.message || 'Gagal mengirim pengajuan.')
      }
    })
  }

  return (
    <>
      <div className="pds-page-head">
        <div>
          <div className="pds-page-title">Promosi & Kampanye</div>
          <div className="pds-page-sub">Ajukan kampanye promosi untuk judul yang sudah terbit · {campaigns.length} pengajuan</div>
        </div>
      </div>

      {success && (
        <div className="pds-alert" style={{ background: 'rgba(52,211,153,0.10)', border: '1px solid rgba(52,211,153,0.28)' }}>
          <span className="ic">✓</span>
          <span className="txt" style={{ color: 'var(--pds-pos)', fontWeight: 700 }}>{success}</span>
        </div>
      )}
      {error && (
        <div className="pds-alert" style={{ background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.24)' }}>
          <span className="ic">⚠</span>
          <span className="txt" style={{ color: 'var(--pds-coral)', fontWeight: 700 }}>{error}</span>
        </div>
      )}

      <div className="pds-campaign-layout">
        {/* Request form */}
        <div className="pds-panel">
          {books.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📣</div>
              <div style={{ fontFamily: 'var(--pds-serif)', fontSize: 18, color: '#fff', marginBottom: 8 }}>
                Belum ada buku yang bisa dipromosikan
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--pds-dim)', lineHeight: 1.6, maxWidth: 380, margin: '0 auto' }}>
                Untuk mengajukan kampanye, publikasikan buku terlebih dahulu dari halaman{' '}
                <a href="/publisher/books" style={{ color: 'var(--pds-teal)', fontWeight: 600, textDecoration: 'none' }}>
                  Katalog
                </a>.
              </div>
            </div>
          ) : (
            <form onSubmit={submit}>
              <div className="pds-panel-title">
                📣 Ajukan Kampanye
                <span className="tag">data disampaikan ke tim kurasi BUKOO</span>
              </div>
              <div className="pds-field">
                <label>Nama Kampanye <span className="req">*</span></label>
                <input className="pds-inp" name="campaignName" placeholder="cth: Peluncuran Musim Baru" required />
              </div>
              <div className="pds-field">
                <label>Pilih Buku <span className="req">*</span></label>
                <select className="pds-sel" name="bookId" required>
                  <option value="">— Pilih judul yang sudah terbit —</option>
                  {books.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title}
                      {b.author ? ` — ${b.author}` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="pds-two-col">
                <div className="pds-field">
                  <label>Tanggal Mulai <span className="req">*</span></label>
                  <input className="pds-inp" type="date" name="startDate" required />
                </div>
                <div className="pds-field">
                  <label>Tanggal Selesai <span className="req">*</span></label>
                  <input className="pds-inp" type="date" name="endDate" required />
                </div>
              </div>
              <div className="pds-field">
                <label>Tujuan Kampanye</label>
                <textarea className="pds-ta" name="goal" placeholder="Apa tujuan kampanye ini? (mis. meningkatkan pembacaan, jangkauan pembaca baru)" />
              </div>
              <div className="pds-field">
                <label>Catatan</label>
                <textarea className="pds-ta" name="notes" placeholder="Informasi tambahan untuk tim kurasi" />
              </div>
              <div className="pds-field">
                <label>Anggaran (opsional)</label>
                <input className="pds-inp" name="budget" inputMode="numeric" placeholder="cth: 500000" />
                <div className="hint">Estimasi anggaran dalam Rupiah (angka).</div>
              </div>
              <button type="submit" disabled={isPending} className="pds-btn pds-btn-primary" style={{ justifyContent: 'center', padding: '12px', fontSize: 12, width: '100%' }}>
                {isPending ? 'Mengirim...' : 'Kirim Pengajuan'}
              </button>
            </form>
          )}
        </div>

        {/* Campaign list */}
        <div>
          <div className="pds-panel-title" style={{ marginBottom: 10 }}>
            Riwayat Pengajuan
            <span className="tag">{campaigns.length} total</span>
          </div>
          {campaigns.length === 0 ? (
            <div className="pds-panel">
              <div className="pds-campaign-empty">Belum ada pengajuan promosi.</div>
            </div>
          ) : (
            campaigns.map((c) => {
              const st = STATUS_LABEL[c.status] ?? STATUS_LABEL.SUBMITTED
              return (
                <div className="pds-campaign-card" key={c.id}>
                  <div className="pds-campaign-head">
                    <div className="pds-campaign-name">{c.campaignName}</div>
                    <span className={`pds-chip ${st.tone}`}>{st.label}</span>
                  </div>
                  <div className="pds-campaign-meta">
                    <span>📖 <b>{c.bookTitle}</b></span>
                    <span>🗓 <b>{fmtDate(c.startDate)} – {fmtDate(c.endDate)}</b></span>
                    {c.budget != null && <span>💰 <b>{fmtRp(c.budget)}</b></span>}
                  </div>
                  {c.goal && <div className="pds-campaign-body">{c.goal}</div>}
                </div>
              )
            })
          )}
        </div>
      </div>
    </>
  )
}
