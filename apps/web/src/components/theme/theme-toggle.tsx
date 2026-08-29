'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from './theme-provider'

/** Compact light/dark toggle for token-based (shadcn) surfaces. */
export function ThemeToggle() {
  const { theme, toggle } = useTheme()

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'}
      title={theme === 'dark' ? 'Tema terang' : 'Tema gelap'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 36,
        height: 36,
        borderRadius: 9999,
        border: '1px solid var(--border, #E5E7EB)',
        background: 'var(--card, #ffffff)',
        color: 'var(--foreground, #111827)',
        cursor: 'pointer',
      }}
    >
      {theme === 'dark' ? <Sun style={{ width: 16, height: 16 }} /> : <Moon style={{ width: 16, height: 16 }} />}
    </button>
  )
}
