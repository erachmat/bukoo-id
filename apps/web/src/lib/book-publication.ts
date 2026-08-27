export function canPublish(isPublished: boolean, publicationStatus: string): boolean {
  return !isPublished && publicationStatus === 'UNPUBLISHED';
}

export function canUnpublish(isPublished: boolean): boolean {
  return isPublished;
}

export function shouldReReview(previousStatus: string, contentChanged: boolean): boolean {
  return contentChanged && (previousStatus === 'PUBLISHED' || previousStatus === 'UNPUBLISHED');
}
