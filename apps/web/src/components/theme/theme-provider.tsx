'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'bukoo-theme'

const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: 'light',
  toggle: () => {},
})

/**
 * Hand-rolled theme provider (no next-themes dependency).
 * Toggles the `.dark` class on <html>; token-based UI (globals.css / shadcn
 * surfaces) responds. Inline-styled pages keep their current look.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')

  // Subscribe to the external system (localStorage / OS preference) once and
  // sync React state from it — the recommended effect pattern.
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')

    const readStored = (): Theme | null => {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY)
        return stored === 'light' || stored === 'dark' ? stored : null
      } catch {
        return null
      }
    }

    const apply = (next: Theme) => {
      document.documentElement.classList.toggle('dark', next === 'dark')
      document.documentElement.style.colorScheme = next
      setTheme(next)
    }

    const onChange = () => {
      const stored = readStored()
      if (!stored) apply(media.matches ? 'dark' : 'light')
    }

    onChange()
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    root.style.colorScheme = theme
  }, [theme])

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      try {
        window.localStorage.setItem(STORAGE_KEY, next)
      } catch {
        // localStorage unavailable (private mode) — theme applies for session only
      }
      return next
    })
  }, [])

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
