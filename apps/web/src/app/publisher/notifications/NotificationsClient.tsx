'use client'

import { useState, useTransition } from 'react'
import { markNotificationRead, markAllNotificationsRead } from './actions'

export interface ClientNotification {
  id: string
  kind: string
  title: string
  body: string | null
  createdAt: string
  read: boolean
}

export function NotificationsClient({ initial }: { initial: ClientNotification[] }) {
  const [items, setItems] = useState(initial)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const markRead = (id: string) => {
    startTransition(async () => {
      try {
        setError(null)
        await markNotificationRead(id)
        setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
      } catch {
        setError('Notifikasi gagal diperbarui. Coba lagi.')
      }
    })
  }

  const markAll = () => {
    startTransition(async () => {
      try {
        setError(null)
        await markAllNotificationsRead()
        setItems((prev) => prev.map((n) => ({ ...n, read: true })))
      } catch {
        setError('Notifikasi gagal diperbarui. Coba lagi.')
      }
    })
  }

  const unread = items.filter((i) => !i.read).length

  return (
    <>
      <div className="pds-page-head">
        <div>
          <div className="pds-page-title">Notifikasi</div>
          <div className="pds-page-sub">{unread} belum dibaca · aktivitas akun penerbit Anda</div>
        </div>
        <div className="pds-head-actions">
          <button className="pds-btn pds-btn-line" onClick={markAll} disabled={isPending}>
            ✓ Tandai semua dibaca
          </button>
        </div>
      </div>
      {error && <div role="alert" className="pds-action-error">{error}</div>}
      <div className="pds-panel">
        {items.length === 0 ? (
          <div style={{ padding: "40px 16px", textAlign: "center", color: "var(--pds-muted)", fontSize: 12 }}>
            Belum ada notifikasi.
          </div>
        ) : (
          items.map((n) => (
            <button
              type="button"
              className={`pds-notif-item${n.read ? '' : ' unread'}`}
              key={n.id}
              onClick={() => !n.read && markRead(n.id)}
              disabled={n.read || isPending}
              style={n.read ? { cursor: 'default', width: '100%', textAlign: 'left' } : { width: '100%', textAlign: 'left' }}
            >
              <div className="pds-notif-ic" style={{ background: 'rgba(0,201,167,0.14)' }}>🔔</div>
              <div className="pds-notif-body">
                <div className="pds-notif-t">{n.title}</div>
                <div className="pds-notif-d">{n.body}</div>
                <div className="pds-notif-time">{new Date(n.createdAt).toLocaleString('id-ID')}</div>
              </div>
              {!n.read && <div className="pds-notif-dot" />}
            </button>
          ))
        )}
      </div>
    </>
  )
}