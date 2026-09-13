import { describe, expect, it } from 'vitest';
import { getPublisherBookAnalytics } from '@/app/publisher/dashboard/queries';

describe('getPublisherBookAnalytics', () => {
  it('is exported and callable (full DB coverage requires D1 integration)', () => {
    expect(typeof getPublisherBookAnalytics).toBe('function');
  });
});