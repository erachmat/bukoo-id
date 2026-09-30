import { describe, expect, it } from 'vitest';
import { archivedPublicationStatus, canPublish, canSubmitForReview, canUnpublish, restoredPublicationState, shouldReReview } from './book-publication';

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

  it('allows review submission only for active drafts and rejected titles', () => {
    expect(canSubmitForReview('DRAFT', null)).toBe(true);
    expect(canSubmitForReview('REJECTED', null)).toBe(true);
    expect(canSubmitForReview('IN_REVIEW', null)).toBe(false);
    expect(canSubmitForReview('PUBLISHED', null)).toBe(false);
    expect(canSubmitForReview('DRAFT', '2026-09-29T00:00:00.000Z')).toBe(false);
  });

  it('withdraws active review and publication when archiving', () => {
    expect(archivedPublicationStatus('IN_REVIEW')).toBe('DRAFT');
    expect(archivedPublicationStatus('PUBLISHED')).toBe('UNPUBLISHED');
    expect(archivedPublicationStatus('DRAFT')).toBe('DRAFT');
    expect(archivedPublicationStatus('REJECTED')).toBe('REJECTED');
    expect(archivedPublicationStatus('UNPUBLISHED')).toBe('UNPUBLISHED');
  });

  it('restores archived titles as inactive and ready for the next valid step', () => {
    expect(restoredPublicationState('PUBLISHED')).toEqual({ isPublished: false, publicationStatus: 'UNPUBLISHED' });
    expect(restoredPublicationState('IN_REVIEW')).toEqual({ isPublished: false, publicationStatus: 'DRAFT' });
    expect(restoredPublicationState('DRAFT')).toEqual({ isPublished: false, publicationStatus: 'DRAFT' });
  });

  it('requires review only when approved content changes', () => {
    expect(shouldReReview('PUBLISHED', true)).toBe(true);
    expect(shouldReReview('UNPUBLISHED', true)).toBe(true);
    expect(shouldReReview('PUBLISHED', false)).toBe(false);
    expect(shouldReReview('IN_REVIEW', true)).toBe(false);
  });
});
