import { describe, expect, it } from 'vitest'
import { tierFromSubscription, canReadBook } from './subscription'

describe('tierFromSubscription', () => {
  it('returns FREE for missing or inactive subscriptions', () => {
    expect(tierFromSubscription(null)).toBe('FREE')
    expect(tierFromSubscription(undefined)).toBe('FREE')
    expect(tierFromSubscription({ status: 'CANCELLED', planId: 'plan_plus' })).toBe('FREE')
    expect(tierFromSubscription({ status: 'PAST_DUE', planId: 'plan_plus' })).toBe('FREE')
  })

  it('derives tier from planId for active/trialing subs', () => {
    expect(tierFromSubscription({ status: 'ACTIVE', planId: 'plan_plus' })).toBe('PLUS')
    expect(tierFromSubscription({ status: 'TRIALING', planId: 'plan_premium' })).toBe('PREMIUM')
  })

  it('normalizes FREE plan ids to FREE', () => {
    expect(tierFromSubscription({ status: 'ACTIVE', planId: 'plan_free' })).toBe('FREE')
  })

  it('passes through an already-derived tier as planId', () => {
    expect(tierFromSubscription({ status: 'ACTIVE', planId: 'PELAJAR' })).toBe('PELAJAR')
  })
})

describe('canReadBook', () => {
  it('allows free books for any tier', () => {
    expect(canReadBook(null, 'FREE')).toBe(true)
  })

  it('denies premium books for free users', () => {
    expect(canReadBook(null, 'PREMIUM')).toBe(false)
  })

  it('allows premium books for matching active subscribers', () => {
    expect(canReadBook({ status: 'ACTIVE', planId: 'plan_premium' }, 'PREMIUM')).toBe(true)
  })

  it('denies premium books for expired subscribers of the same plan', () => {
    expect(canReadBook({ status: 'EXPIRED', planId: 'plan_premium' }, 'PREMIUM')).toBe(false)
  })
})
