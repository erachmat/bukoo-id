import { describe, expect, it } from 'vitest'
import { APP_STORE_URL, PLAY_STORE_URL, bookDeepLink } from './app-links'

describe('app-links', () => {
  it('exposes absolute store URLs', () => {
    expect(APP_STORE_URL).toMatch(/^https:\/\//)
    expect(PLAY_STORE_URL).toMatch(/^https:\/\//)
  })

  it('builds a bukoo:// deep link for a book', () => {
    expect(bookDeepLink('abc123')).toBe('bukoo://book/abc123')
  })

  it('handles ids containing slashes safely', () => {
    expect(bookDeepLink('a/b')).toBe('bukoo://book/a/b')
  })
})
