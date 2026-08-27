import { describe, expect, it } from 'vitest';
import { shouldBouncePublisherFromLanding } from './publisher-landing-guard';

describe('shouldBouncePublisherFromLanding', () => {
  const opts = (overrides: Partial<Parameters<typeof shouldBouncePublisherFromLanding>[0]> = {}) => ({
    isPublisherHost: true,
    userRole: undefined,
    pathname: '/publisher/daftar',
    isLogoutLanding: false,
    ...overrides,
  });

  it('bounces an authenticated PUBLISHER from the landing page', () => {
    expect(shouldBouncePublisherFromLanding(opts({ userRole: 'PUBLISHER' }))).toBe(true);
  });

  it('bounces an authenticated PUBLISHER from / and /daftar too', () => {
    expect(shouldBouncePublisherFromLanding(opts({ userRole: 'PUBLISHER', pathname: '/' }))).toBe(true);
    expect(shouldBouncePublisherFromLanding(opts({ userRole: 'PUBLISHER', pathname: '/daftar' }))).toBe(true);
  });

  it('does NOT bounce when the sign-out marker is present (landing page wins)', () => {
    expect(
      shouldBouncePublisherFromLanding(opts({ userRole: 'PUBLISHER', isLogoutLanding: true })),
    ).toBe(false);
  });

  it('does NOT bounce non-publisher roles', () => {
    expect(shouldBouncePublisherFromLanding(opts({ userRole: 'USER' }))).toBe(false);
    expect(shouldBouncePublisherFromLanding(opts({ userRole: 'ADMIN' }))).toBe(false);
  });

  it('does NOT bounce unauthenticated visitors', () => {
    expect(shouldBouncePublisherFromLanding(opts({}))).toBe(false);
  });

  it('never bounces on non-publisher hosts', () => {
    expect(
      shouldBouncePublisherFromLanding(opts({ isPublisherHost: false, userRole: 'PUBLISHER' })),
    ).toBe(false);
    expect(
      shouldBouncePublisherFromLanding(
        opts({ isPublisherHost: false, userRole: 'PUBLISHER', pathname: '/' }),
      ),
    ).toBe(false);
  });

  it('does NOT bounce other publisher pages (e.g. login)', () => {
    expect(
      shouldBouncePublisherFromLanding(opts({ userRole: 'PUBLISHER', pathname: '/publisher/login' })),
    ).toBe(false);
  });
});
