import { describe, expect, it } from 'vitest';
import {
  canMarkProgressSynced,
  canSendPendingSyncForAccount,
  createProgressSyncPayload,
  restorePendingSync,
} from './readingSyncOutbox';

const firstId = '00000000-0000-4000-8000-000000000001';
const secondId = '00000000-0000-4000-8000-000000000002';
const snapshot = {
  contentVersion: 'epubs/book-a.epub',
  revision: 4,
  currentPage: 12,
  cfiPosition: 'epubcfi(/6/12)',
  coverageDeltas: [{ blockIndex: 2, exposureMicros: 210_000 }],
  readingTimeDeltaSeconds: 32,
};

describe('reading progress outbox identity', () => {
  it('freezes a v2 coverage snapshot with its batch ID', () => {
    expect(createProgressSyncPayload(snapshot, firstId)).toEqual({
      syncBatchId: firstId,
      coverageVersion: 2,
      contentVersion: 'epubs/book-a.epub',
      revision: 4,
      currentPage: 12,
      cfiPosition: 'epubcfi(/6/12)',
      coverageDeltas: [{ blockIndex: 2, exposureMicros: 210_000 }],
      reading_time_delta: 32,
    });
  });

  it('reuses the same payload and ID after a lost response', () => {
    const payload = createProgressSyncPayload(snapshot, firstId);
    const retry = restorePendingSync(JSON.stringify(payload), firstId);
    expect(retry.payload).toEqual(payload);
    expect(retry.syncBatchId).toBe(firstId);
    expect(retry.needsPersistence).toBe(false);
  });

  it('gives each later snapshot a fresh ID', () => {
    const first = createProgressSyncPayload(snapshot, firstId);
    const later = createProgressSyncPayload({ ...snapshot, revision: 5, currentPage: 13 }, secondId);
    expect(later.syncBatchId).not.toBe(first.syncBatchId);
    expect(later.currentPage).toBe(13);
  });

  it('keeps position-only legacy outbox data quarantined', () => {
    expect(() => restorePendingSync(JSON.stringify({
      currentPage: 12,
      cfiPosition: 'epubcfi(/6/12)',
      progressPercent: 100,
      reading_time_delta: 32,
    }), null)).toThrow(/quarantined/);
  });

  it('never sends an account A batch while account B is active', () => {
    expect(canSendPendingSyncForAccount('account-a', 'account-a')).toBe(true);
    expect(canSendPendingSyncForAccount('account-b', 'account-a')).toBe(false);
    expect(canSendPendingSyncForAccount(null, 'account-a')).toBe(false);
  });

  it('clears dirty state only after the current revision and every queued batch sync', () => {
    expect(canMarkProgressSynced(4, 4, 0, 0)).toBe(true);
    expect(canMarkProgressSynced(5, 4, 0, 0)).toBe(false);
    expect(canMarkProgressSynced(4, 4, 5, 0)).toBe(false);
    expect(canMarkProgressSynced(4, 4, 0, 1)).toBe(false);
  });
});
