import { describe, expect, it } from 'vitest'
import {
  RATE_LIMIT_POLICIES,
  checkRateLimit,
  isBlocked,
  rateLimitKey,
  recordFailure,
  type LimiterStorage,
} from './rate-limit'

function memoryStorage(): LimiterStorage & { map: Map<string, { attempts: number; windowStart: number; lockedUntil: number | null }> } {
  const map = new Map<string, { attempts: number; windowStart: number; lockedUntil: number | null }>()
  return {
    map,
    async get(key) {
      return map.get(key)
    },
    async write(key, row) {
      map.set(key, row)
    },
  }
}

const loginEmail = RATE_LIMIT_POLICIES.loginEmail

describe('rateLimitKey', () => {
  it('lowercases identifiers and formats policy:scope:id', () => {
    expect(rateLimitKey('loginEmail', 'email', 'User@Example.COM')).toBe(
      'loginEmail:email:user@example.com',
    )
  })
})

describe('checkRateLimit / isBlocked', () => {
  it('allows when no attempts recorded', async () => {
    const storage = memoryStorage()
    const key = rateLimitKey('loginEmail', 'email', 'a@b.c')
    expect(await checkRateLimit(storage, 1000, key)).toEqual({ allowed: true, retryAfterMs: 0 })
    expect(await isBlocked(storage, 1000, key)).toBe(false)
  })

  it('blocks while lockedUntil is in the future and reports retryAfterMs', async () => {
    const storage = memoryStorage()
    const key = rateLimitKey('loginEmail', 'email', 'a@b.c')
    await storage.write(key, { attempts: 5, windowStart: 0, lockedUntil: 5000 })
    const result = await checkRateLimit(storage, 2000, key)
    expect(result.allowed).toBe(false)
    expect(result.retryAfterMs).toBe(3000)
  })

  it('allows again after the lock expires (read-only — does not mutate)', async () => {
    const storage = memoryStorage()
    const key = rateLimitKey('loginEmail', 'email', 'a@b.c')
    await storage.write(key, { attempts: 5, windowStart: 0, lockedUntil: 5000 })
    expect(await checkRateLimit(storage, 6000, key)).toEqual({ allowed: true, retryAfterMs: 0 })
    expect((await storage.get(key))?.lockedUntil).toBe(5000)
  })
})

describe('recordFailure', () => {
  it('locks exactly when maxAttempts is reached', async () => {
    const storage = memoryStorage()
    const key = rateLimitKey('loginEmail', 'email', 'a@b.c')
    for (let i = 0; i < loginEmail.maxAttempts - 1; i++) {
      await recordFailure(storage, 1000, loginEmail, key)
    }
    expect((await storage.get(key))?.lockedUntil).toBeNull()
    await recordFailure(storage, 2000, loginEmail, key)
    expect((await storage.get(key))?.lockedUntil).toBe(2000 + loginEmail.lockMs)
  })

  it('does not extend an existing lock', async () => {
    const storage = memoryStorage()
    const key = rateLimitKey('loginEmail', 'email', 'a@b.c')
    await storage.write(key, { attempts: 5, windowStart: 0, lockedUntil: 5000 })
    await recordFailure(storage, 4000, loginEmail, key)
    expect((await storage.get(key))?.lockedUntil).toBe(5000)
  })

  it('resets the window after it expires', async () => {
    const storage = memoryStorage()
    const key = rateLimitKey('loginEmail', 'email', 'a@b.c')
    await storage.write(key, { attempts: 4, windowStart: 0, lockedUntil: null })
    // Window is 15 min; record well past it.
    await recordFailure(storage, loginEmail.windowMs + 1000, loginEmail, key)
    const row = await storage.get(key)
    expect(row?.attempts).toBe(1)
    expect(row?.windowStart).toBe(loginEmail.windowMs + 1000)
    expect(row?.lockedUntil).toBeNull()
  })
})
