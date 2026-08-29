import Link from 'next/link'
import { Smartphone } from 'lucide-react'
import { APP_STORE_URL, PLAY_STORE_URL } from '@/lib/app-links'

function PlayStoreBadge() {
  return (
    <svg width="152" height="44" viewBox="0 0 152 44" role="img" aria-label="Dapatkan di Google Play">
      <rect x="0.5" y="0.5" width="151" height="43" rx="8" fill="#000" stroke="#A6A6A6" />
      <path d="M15 11.5v21c0 .5.55.8 1 .55l11.5-10.5L16 10.95c-.45-.25-1 .05-1 .55z" fill="#00D7FE" />
      <path d="M31.5 18.9l-4-3.65L17.7 24.9l4 3.6c.65.6 1.6.6 2.25 0l7.55-6.85c.75-.7.75-2.05 0-2.75z" fill="#FFCE00" />
      <path d="M17.7 19.1l9.8 8.65 4-3.65c.75-.7.75-2.05 0-2.75L23.95 14.5l-6.25 4.6z" fill="#FF3A44" opacity=".9" />
      <path d="M15 11.5v21c0 .5.55.8 1 .55l1.7-1.55-1.2-19.55-1.5-.55c0-.05 0 .05 0 .1z" fill="#00F076" opacity=".85" />
      <text x="46" y="18" fill="#FFF" fontSize="9" fontFamily="sans-serif">DAPATKAN DI</text>
      <text x="46" y="33" fill="#FFF" fontSize="15" fontWeight="700" fontFamily="sans-serif">Google Play</text>
    </svg>
  )
}

function AppStoreBadge() {
  return (
    <svg width="136" height="44" viewBox="0 0 136 44" role="img" aria-label="Unduh di App Store">
      <rect x="0.5" y="0.5" width="135" height="43" rx="8" fill="#000" stroke="#A6A6A6" />
      <path d="M23.8 22.4c0-2.5 2-3.7 2.1-3.75-1.15-1.7-2.95-1.9-3.55-1.95-1.5-.15-2.95.9-3.7.9-.8 0-2-.9-3.3-.85-1.7 0-3.25 1-4.1 2.5-1.75 3-.45 7.5 1.25 9.95.85 1.2 1.85 2.55 3.15 2.5 1.25-.05 1.75-.8 3.25-.8s1.95.8 3.3.8c1.35-.05 2.2-1.25 3.05-2.45.95-1.4 1.35-2.75 1.35-2.8-.05-.05-2.75-1.05-2.8-4.05zM21.35 15.1c.7-.85 1.15-2 1.05-3.2-1 .05-2.25.65-2.95 1.5-.65.75-1.2 1.95-1.05 3.1 1.1.1 2.25-.55 2.95-1.4z" fill="#FFF" />
      <text x="34" y="18" fill="#FFF" fontSize="9" fontFamily="sans-serif">UNDUH DI</text>
      <text x="34" y="33" fill="#FFF" fontSize="15" fontWeight="700" fontFamily="sans-serif">App Store</text>
    </svg>
  )
}

interface AppDownloadCtaProps {
  /** `inline` = book-detail CTA block; `strip` = full-width banner (library/account). */
  variant?: 'inline' | 'strip'
  /** Optional headline override (strip variant). */
  title?: string
  /** Optional subline override (strip variant). */
  subtitle?: string
}

/**
 * "Baca di Aplikasi" — reading is mobile-app-only (Netflix model).
 * Web shows the catalog; the CTA funnels users to the mobile app.
 */
export function AppDownloadCta({
  variant = 'inline',
  title = 'Baca di Aplikasi BUKOO',
  subtitle = 'Pembacaan buku tersedia di aplikasi BUKOO untuk iOS & Android. Progres, bookmark, dan sorotan Anda tersinkron otomatis.',
}: AppDownloadCtaProps) {
  if (variant === 'strip') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          flexWrap: 'wrap',
          padding: '24px 28px',
          borderRadius: 16,
          background: 'linear-gradient(135deg, #00181A 0%, #003A3E 100%)',
          color: '#fff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, minWidth: 240 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: 'rgba(0,201,167,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Smartphone style={{ width: 24, height: 24, color: '#00C9A7' }} />
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 800, fontSize: 18, letterSpacing: '-0.01em' }}>{title}</p>
            <p style={{ margin: '4px 0 0', fontSize: 14, color: 'rgba(255,255,255,0.65)', maxWidth: 480 }}>{subtitle}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" aria-label="Dapatkan di Google Play">
            <PlayStoreBadge />
          </Link>
          <Link href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" aria-label="Unduh di App Store">
            <AppStoreBadge />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 420 }}>
      <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>{title}</p>
      <p style={{ margin: 0, fontSize: 13, color: '#6B7280', lineHeight: 1.5 }}>{subtitle}</p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" aria-label="Dapatkan di Google Play">
          <PlayStoreBadge />
        </Link>
        <Link href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" aria-label="Unduh di App Store">
          <AppStoreBadge />
        </Link>
      </div>
    </div>
  )
}

export default AppDownloadCta
