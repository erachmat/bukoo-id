import { describe, expect, it } from 'vitest';
import {
  clearAuthCookieHeaders,
  logoutRedirectUrl,
  LOGOUT_COOKIE_NAMES,
  DEFAULT_LOGOUT_REDIRECT,
} from './logout-cookies';

describe('clearAuthCookieHeaders', () => {
  const headers = clearAuthCookieHeaders();

  it('expires exactly the four NextAuth cookies', () => {
    const names = headers.map((h) => h.split('=')[0]);
    expect(names).toEqual([...LOGOUT_COOKIE_NAMES]);
    expect(names).toContain('__Secure-authjs.session-token');
    expect(names).toContain('__Secure-authjs.csrf-token');
    expect(names).toContain('authjs.session-token');
    expect(names).toContain('authjs.csrf-token');
  });

  it('every header zeroes the cookie with shared attrs', () => {
    for (const h of headers) {
      expect(h).toContain('Max-Age=0');
      expect(h).toContain('Path=/');
      expect(h).toContain('HttpOnly');
      expect(h).toContain('SameSite=Lax');
    }
  });

  it('sets Secure only on __Secure- prefixed variants', () => {
    for (const h of headers) {
      const isSecureVariant = h.startsWith('__Secure-');
      expect(h.includes('Secure')).toBe(isSecureVariant);
    }
  });

  it('cookie value is empty (expiry, not overwrite)', () => {
    for (const h of headers) {
      // First pair is "name=" with nothing between "=" and the first ";".
      const firstPair = h.split(';')[0];
      expect(firstPair).toMatch(/=$/);
    }
  });
});

describe('logoutRedirectUrl', () => {
  const origin = 'https://publisher.bukoo.id';

  it('accepts a safe relative redirectTo', () => {
    expect(logoutRedirectUrl('/library', origin)).toBe(`${origin}/library`);
  });

  it('keeps query strings on a safe redirect', () => {
    expect(logoutRedirectUrl('/publisher/daftar?logout=1', origin)).toBe(
      `${origin}/publisher/daftar?logout=1`,
    );
  });

  it('falls back to the publisher landing default when redirectTo is missing', () => {
    expect(logoutRedirectUrl(null, origin)).toBe(`${origin}${DEFAULT_LOGOUT_REDIRECT}`);
    expect(logoutRedirectUrl('', origin)).toBe(`${origin}${DEFAULT_LOGOUT_REDIRECT}`);
  });

  it('rejects protocol-relative URLs (open-redirect)', () => {
    expect(logoutRedirectUrl('//evil.example', origin)).toBe(
      `${origin}${DEFAULT_LOGOUT_REDIRECT}`,
    );
  });

  it('rejects absolute URLs with a scheme', () => {
    expect(logoutRedirectUrl('https://evil.example', origin)).toBe(
      `${origin}${DEFAULT_LOGOUT_REDIRECT}`,
    );
  });

  it('rejects backslashes and colon tricks', () => {
    expect(logoutRedirectUrl('/\\evil.example', origin)).toBe(
      `${origin}${DEFAULT_LOGOUT_REDIRECT}`,
    );
    expect(logoutRedirectUrl('/redirect:evil', origin)).toBe(
      `${origin}${DEFAULT_LOGOUT_REDIRECT}`,
    );
  });
});
