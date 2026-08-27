import { describe, expect, it } from 'vitest';
import { canPublish, canUnpublish, shouldReReview } from './book-publication';

describe('publisher book publication policy', () => {
  it('allows republishing only previously unpublished approved books', () => {
    expect(canPublish(false, 'UNPUBLISHED')).toBe(true);
    expect(canPublish(false, 'IN_REVIEW')).toBe(false);
    expect(canPublish(false, 'REJECTED')).toBe(false);
    expect(canPublish(true, 'PUBLISHED')).toBe(false);
  });

  it('allows taking down only live books', () => {
    expect(canUnpublish(true)).toBe(true);
    expect(canUnpublish(false)).toBe(false);
  });

  it('requires review only when approved content changes', () => {
    expect(shouldReReview('PUBLISHED', true)).toBe(true);
    expect(shouldReReview('UNPUBLISHED', true)).toBe(true);
    expect(shouldReReview('PUBLISHED', false)).toBe(false);
    expect(shouldReReview('IN_REVIEW', true)).toBe(false);
  });
});
