export function canPublish(isPublished: boolean, publicationStatus: string): boolean {
  return !isPublished && publicationStatus === 'UNPUBLISHED';
}

export function canUnpublish(isPublished: boolean): boolean {
  return isPublished;
}

export function canSubmitForReview(publicationStatus: string, archivedAt: string | null): boolean {
  return !archivedAt && ['DRAFT', 'REJECTED'].includes(publicationStatus);
}

export function archivedPublicationStatus(publicationStatus: string): string {
  if (publicationStatus === 'IN_REVIEW') return 'DRAFT';
  if (publicationStatus === 'PUBLISHED') return 'UNPUBLISHED';
  return publicationStatus;
}

export function restoredPublicationState(publicationStatus: string): { isPublished: false; publicationStatus: string } {
  return {
    isPublished: false,
    publicationStatus: archivedPublicationStatus(publicationStatus),
  };
}

export function shouldReReview(previousStatus: string, contentChanged: boolean): boolean {
  return contentChanged && (previousStatus === 'PUBLISHED' || previousStatus === 'UNPUBLISHED');
}
