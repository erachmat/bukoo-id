import type { ReadingProgressSyncRequestDto } from '@bukoo/shared-types';

export interface ProgressSnapshot {
  contentVersion: string;
  revision: number;
  currentPage: number;
  cfiPosition: string;
  coverageDeltas: ReadingProgressSyncRequestDto['coverageDeltas'];
  readingTimeDeltaSeconds: number;
}

export function isSyncBatchId(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function canSendPendingSyncForAccount(activeUserId: string | null, pendingUserId: string): boolean {
  return !!activeUserId && activeUserId === pendingUserId;
}

export function createProgressSyncPayload(
  snapshot: ProgressSnapshot,
  syncBatchId: string,
): ReadingProgressSyncRequestDto {
  return {
    syncBatchId,
    coverageVersion: 2,
    contentVersion: snapshot.contentVersion,
    revision: snapshot.revision,
    currentPage: snapshot.currentPage,
    cfiPosition: snapshot.cfiPosition,
    coverageDeltas: snapshot.coverageDeltas.map((delta) => ({ ...delta })),
    reading_time_delta: snapshot.readingTimeDeltaSeconds,
  };
}

export interface RestoredPendingSync {
  payload: ReadingProgressSyncRequestDto;
  syncBatchId: string;
  needsPersistence: boolean;
}

/** Validate a frozen v2 payload. Legacy position-only data stays quarantined. */
export function restorePendingSync(
  serializedPayload: string,
  storedBatchId: string | null,
): RestoredPendingSync {
  const parsed = JSON.parse(serializedPayload) as Partial<ReadingProgressSyncRequestDto>;
  if (
    parsed.coverageVersion !== 2 ||
    typeof parsed.contentVersion !== 'string' ||
    !Number.isSafeInteger(parsed.revision) ||
    !Array.isArray(parsed.coverageDeltas) ||
    !isSyncBatchId(parsed.syncBatchId)
  ) {
    throw new Error('Legacy or malformed progress payload is quarantined');
  }
  const payload = parsed as ReadingProgressSyncRequestDto;
  return {
    payload,
    syncBatchId: payload.syncBatchId,
    needsPersistence: !isSyncBatchId(storedBatchId) || storedBatchId !== payload.syncBatchId,
  };
}

export function canMarkProgressSynced(
  currentRevision: number,
  deliveredRevision: number,
  unsyncedSeconds: number,
  pendingCount: number,
): boolean {
  return currentRevision === deliveredRevision && unsyncedSeconds === 0 && pendingCount === 0;
}
