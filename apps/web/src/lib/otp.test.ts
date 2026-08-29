import { describe, expect, it } from 'vitest'
import { OTP_TTL_MS, generateOtpCode, isOtpExpired, otpExpiryMs } from './otp'

describe('generateOtpCode', () => {
  it('returns a 6-character numeric string', () => {
    const code = generateOtpCode()
    expect(code).toMatch(/^\d{6}$/)
  })

  it('produces zero-padded codes within range', () => {
    for (let i = 0; i < 50; i++) {
      const code = generateOtpCode()
      expect(Number(code)).toBeLessThan(1_000_000)
      expect(code.length).toBe(6)
    }
  })
})

describe('isOtpExpired', () => {
  it('is not expired before the boundary', () => {
    expect(isOtpExpired(2000, 1999)).toBe(false)
  })

  it('is expired strictly after the boundary (implementation: nowMs > expiresAtMs)', () => {
    expect(isOtpExpired(2000, 2001)).toBe(true)
    expect(isOtpExpired(2000, 2500)).toBe(true)
    expect(isOtpExpired(2000, 2000)).toBe(false)
  })
})

describe('otpExpiryMs', () => {
  it('adds the 15-minute TTL', () => {
    expect(otpExpiryMs(1000)).toBe(1000 + OTP_TTL_MS)
    expect(OTP_TTL_MS).toBe(15 * 60_000)
  })
})
