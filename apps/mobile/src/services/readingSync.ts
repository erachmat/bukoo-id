import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto';
import type { ReadingProgressSyncRequestDto } from '@bukoo/shared-types';
import { useAuthStore } from '../stores/authStore';
import { api } from './api';
import { COVERAGE_MICROSECONDS_PER_WORD, COVERAGE_WORDS_PER_BLOCK, type VisibleWordRange } from './readingCoverage';
import { canMarkProgressSynced, canSendPendingSyncForAccount, createProgressSyncPayload, restorePendingSync } from './readingSyncOutbox';

export interface ReadingProgress {
  userId: string;
  bookId: string;
  contentVersion: string;
  currentPage: number;
  cfiPosition: string;
  progressPercent: number;
  readingTimeSeconds: number;
  lastSyncedAt: string | null;
  isDirty: boolean;
  localRevision: number;
  unsyncedReadingTimeSeconds: number;
}

interface ProgressRow extends Omit<ReadingProgress, 'isDirty'> {
  isDirty: number;
  totalWords: number;
}

interface PendingSync {
  id: number;
  userId: string;
  bookId: string;
  contentVersion: string;
  payload: string;
  createdAt: string;
  retries: number;
  syncBatchId: string | null;
  revision: number;
}

interface ReaderSession {
  userId: string;
  bookId: string;
  contentVersion: string;
  totalWords: number;
  lastTickAt: number | null;
  partialMilliseconds: number;
  generation: number;
}

let _db: SQLite.SQLiteDatabase | null = null;
let _dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;
  if (!_dbPromise) {
    _dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync('bukoo_reading.db');
      await db.execAsync(`
        PRAGMA journal_mode = WAL;

        -- These v2 tables intentionally do not import rows from the old
        -- device-global tables. Rows without an account owner stay quarantined.
        CREATE TABLE IF NOT EXISTS reader_progress_v2 (
          userId TEXT NOT NULL,
          bookId TEXT NOT NULL,
          contentVersion TEXT NOT NULL,
          totalWords INTEGER NOT NULL,
          currentPage INTEGER NOT NULL DEFAULT 0,
          cfiPosition TEXT NOT NULL DEFAULT '',
          progressPercent REAL NOT NULL DEFAULT 0,
          readingTimeSeconds INTEGER NOT NULL DEFAULT 0,
          lastSyncedAt TEXT,
          isDirty INTEGER NOT NULL DEFAULT 0,
          localRevision INTEGER NOT NULL DEFAULT 0,
          unsyncedReadingTimeSeconds INTEGER NOT NULL DEFAULT 0,
          PRIMARY KEY (userId, bookId, contentVersion)
        );

        CREATE TABLE IF NOT EXISTS reader_coverage_v2 (
          userId TEXT NOT NULL,
          bookId TEXT NOT NULL,
          contentVersion TEXT NOT NULL,
          blockIndex INTEGER NOT NULL,
          exposureMicros INTEGER NOT NULL DEFAULT 0,
          queuedExposureMicros INTEGER NOT NULL DEFAULT 0,
          updatedAt TEXT NOT NULL,
          PRIMARY KEY (userId, bookId, contentVersion, blockIndex)
        );

        CREATE TABLE IF NOT EXISTS reader_sync_outbox_v2 (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId TEXT NOT NULL,
          bookId TEXT NOT NULL,
          contentVersion TEXT NOT NULL,
          payload TEXT NOT NULL,
          createdAt TEXT NOT NULL,
          retries INTEGER NOT NULL DEFAULT 0,
          syncBatchId TEXT NOT NULL,
          revision INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS reader_sync_outbox_v2_account_idx
          ON reader_sync_outbox_v2 (userId, createdAt, id);
      `);
      _db = db;
      return db;
    })();
  }
  try {
    return await _dbPromise;
  } catch (error) {
    _dbPromise = null;
    throw error;
  }
}

const SYNC_INTERVAL_MS = 30_000;
export class ReadingSync {
  private session: ReaderSession | null = null;
  private intervalHandle: ReturnType<typeof setInterval> | null = null;
  private syncQueue: Promise<void> = Promise.resolve();
  private generation = 0;

  private enqueueSync(work: () => Promise<void>): Promise<void> {
    const result = this.syncQueue.then(work, work);
    this.syncQueue = result.catch(() => undefined);
    return result;
  }

  startSession(userId: string, bookId: string, contentVersion: string, totalWords: number): void {
    if (!userId || !contentVersion || !Number.isSafeInteger(totalWords) || totalWords <= 0) return;
    if (this.session?.userId === userId && this.session.bookId === bookId && this.session.contentVersion === contentVersion) return;
    const previous = this.session;
    this.clearInterval();
    this.generation += 1;
    this.session = {
      userId,
      bookId,
      contentVersion,
      totalWords,
      lastTickAt: Date.now(),
      partialMilliseconds: 0,
      generation: this.generation,
    };
    const current = this.session;
    void this.enqueueSync(async () => {
      if (previous) await this.flushElapsed(previous);
      await this.ensureProgressRow(current);
      if (this.session?.generation === this.generation) this.startInterval();
    });
  }

  pauseTimeTracking(): void {
    const session = this.session;
    if (!session || session.lastTickAt === null) return;
    const now = Date.now();
    session.partialMilliseconds += Math.max(0, now - session.lastTickAt);
    session.lastTickAt = null;
    const seconds = Math.floor(session.partialMilliseconds / 1_000);
    session.partialMilliseconds %= 1_000;
    void this.enqueueSync(async () => {
      await this.persistElapsedSeconds(session, seconds);
    });
  }

  resumeTimeTracking(): void {
    if (this.session) this.session.lastTickAt = Date.now();
  }

  async updateLocalProgress(page: number, cfiPosition: string): Promise<void> {
    const session = this.session;
    if (!session || useAuthStore.getState().user?.id !== session.userId) return;
    await this.enqueueSync(async () => {
      await this.ensureProgressRow(session);
      const db = await getDb();
      await db.runAsync(
        `UPDATE reader_progress_v2 SET currentPage = ?, cfiPosition = ?,
           localRevision = localRevision + 1, isDirty = 1
         WHERE userId = ? AND bookId = ? AND contentVersion = ?`,
        [page, cfiPosition, session.userId, session.bookId, session.contentVersion],
      );
    });
  }

  async updateVisibleCoverage(
    visibleRanges: readonly VisibleWordRange[],
    elapsedMilliseconds: number,
    visibleWordCount: number,
  ): Promise<void> {
    const session = this.session;
    if (!session || useAuthStore.getState().user?.id !== session.userId) return;
    if (!Number.isFinite(elapsedMilliseconds) || elapsedMilliseconds <= 0 || visibleWordCount <= 0) return;
    await this.enqueueSync(async () => {
      await this.ensureProgressRow(session);
      const db = await getDb();
      if (!visibleRanges.length) return;
      const start = Math.max(0, Math.floor(Math.min(...visibleRanges.map((range) => range.startBlock))));
      const end = Math.min(Math.ceil(session.totalWords / COVERAGE_WORDS_PER_BLOCK), Math.ceil(Math.max(...visibleRanges.map((range) => range.endBlock))));
      if (end <= start || end - start > 2_000) return;
      const effectiveWords = Math.min(
        visibleWordCount,
        Math.max(0, Math.min(session.totalWords, end * COVERAGE_WORDS_PER_BLOCK) - start * COVERAGE_WORDS_PER_BLOCK),
      );
      if (effectiveWords <= 0) return;
      const exposurePerWord = Math.floor((elapsedMilliseconds * 1_000) / effectiveWords);
      if (exposurePerWord <= 0) return;
      await db.withExclusiveTransactionAsync(async (txn) => {
        const existing = await txn.getAllAsync<{ blockIndex: number; exposureMicros: number }>(
          `SELECT blockIndex, exposureMicros FROM reader_coverage_v2
            WHERE userId = ? AND bookId = ? AND contentVersion = ? AND blockIndex >= ? AND blockIndex < ?`,
          [session.userId, session.bookId, session.contentVersion, start, end],
        );
        const current = new Map(existing.map((item) => [item.blockIndex, item.exposureMicros]));
        const normalized = visibleRanges
          .map((range) => ({
            startBlock: Math.max(start, Math.floor(range.startBlock)),
            endBlock: Math.min(end, Math.floor(range.endBlock)),
          }))
          .filter((range) => range.endBlock > range.startBlock);
        let changed = false;
        const now = new Date().toISOString();
        for (const range of normalized) {
          for (let blockIndex = range.startBlock; blockIndex < range.endBlock; blockIndex += 1) {
            const oldExposure = current.get(blockIndex) ?? 0;
            const exposureMicros = Math.min(COVERAGE_MICROSECONDS_PER_WORD, oldExposure + exposurePerWord);
            if (exposureMicros === oldExposure) continue;
            changed = true;
            current.set(blockIndex, exposureMicros);
            await txn.runAsync(
              `INSERT INTO reader_coverage_v2 (userId, bookId, contentVersion, blockIndex, exposureMicros, queuedExposureMicros, updatedAt)
               VALUES (?, ?, ?, ?, ?, 0, ?)
               ON CONFLICT(userId, bookId, contentVersion, blockIndex) DO UPDATE SET
                 exposureMicros = excluded.exposureMicros, updatedAt = excluded.updatedAt`,
              [session.userId, session.bookId, session.contentVersion, blockIndex, exposureMicros, now],
            );
          }
        }
        if (!changed) return;
        await txn.runAsync(
          `UPDATE reader_progress_v2 SET progressPercent = CASE WHEN COALESCE((
             SELECT SUM(MIN(?, ? - blockIndex * ?)) FROM reader_coverage_v2
              WHERE userId = ? AND bookId = ? AND contentVersion = ? AND exposureMicros >= ?
           ), 0) >= ? THEN 100 ELSE MIN(99, CAST(COALESCE((
             SELECT SUM(MIN(?, ? - blockIndex * ?)) FROM reader_coverage_v2
              WHERE userId = ? AND bookId = ? AND contentVersion = ? AND exposureMicros >= ?
           ), 0) * 100 / ? AS INTEGER)) END,
           localRevision = localRevision + 1, isDirty = 1
            WHERE userId = ? AND bookId = ? AND contentVersion = ?`,
          [
            COVERAGE_WORDS_PER_BLOCK, session.totalWords, COVERAGE_WORDS_PER_BLOCK,
            session.userId, session.bookId, session.contentVersion, COVERAGE_MICROSECONDS_PER_WORD,
            session.totalWords,
            COVERAGE_WORDS_PER_BLOCK, session.totalWords, COVERAGE_WORDS_PER_BLOCK,
            session.userId, session.bookId, session.contentVersion, COVERAGE_MICROSECONDS_PER_WORD,
            session.totalWords, session.userId, session.bookId, session.contentVersion,
          ],
        );
      });
    });
  }

  async stopSession(userId?: string): Promise<void> {
    const session = this.session;
    if (!session || (userId && session.userId !== userId)) return;
    this.clearInterval();
    this.session = null;
    await this.enqueueSync(async () => {
      await this.flushElapsed(session);
      await this.syncBook(session, true);
    });
  }

  async syncToServer(): Promise<void> {
    const session = this.session;
    if (!session) return;
    await this.enqueueSync(() => this.syncBook(session, true));
  }

  async retryPendingSyncs(userId: string | null): Promise<void> {
    if (!userId || useAuthStore.getState().user?.id !== userId) return;
    await this.enqueueSync(async () => {
      const session = this.session;
      if (session?.userId === userId) await this.flushElapsed(session);
      const db = await getDb();
      const dirtyRows = await db.getAllAsync<{ bookId: string; contentVersion: string; totalWords: number }>(
        'SELECT bookId, contentVersion, totalWords FROM reader_progress_v2 WHERE userId = ? AND isDirty = 1 ORDER BY bookId ASC',
        [userId],
      );
      for (const row of dirtyRows) {
        const dirtySession: ReaderSession = {
          userId,
          bookId: row.bookId,
          contentVersion: row.contentVersion,
          totalWords: row.totalWords,
          lastTickAt: null,
          partialMilliseconds: 0,
          generation: this.generation,
        };
        await this.persistOutboxSnapshot(dirtySession);
      }
      await this.sendPendingSyncs(userId, false);
    });
  }

  async getLocalProgress(bookId: string, userId: string | null, contentVersion?: string | null): Promise<ReadingProgress | null> {
    if (!userId || !contentVersion) return null;
    try {
      const db = await getDb();
      const row = await db.getFirstAsync<ProgressRow>(
        `SELECT * FROM reader_progress_v2 WHERE userId = ? AND bookId = ? AND contentVersion = ?`,
        [userId, bookId, contentVersion],
      );
      if (!row) return null;
      return { ...row, isDirty: row.isDirty === 1 };
    } catch {
      return null;
    }
  }

  async getUnsyncedCount(userId: string | null): Promise<number> {
    if (!userId) return 0;
    try {
      const db = await getDb();
      const result = await db.getFirstAsync<{ count: number }>(
        `SELECT (SELECT COUNT(*) FROM reader_sync_outbox_v2 WHERE userId = ?) +
                (SELECT COUNT(*) FROM reader_progress_v2 WHERE userId = ? AND isDirty = 1) AS count`,
        [userId, userId],
      );
      return result?.count ?? 0;
    } catch {
      return 0;
    }
  }

  async getPendingSyncCount(userId: string | null): Promise<number> {
    if (!userId) return 0;
    try {
      const db = await getDb();
      const result = await db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) AS count FROM reader_sync_outbox_v2 WHERE userId = ?', [userId],
      );
      return result?.count ?? 0;
    } catch {
      return 0;
    }
  }

  async getFinishedBooksCount(userId: string | null): Promise<number> {
    if (!userId) return 0;
    try {
      const db = await getDb();
      const row = await db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(DISTINCT bookId) AS count FROM reader_progress_v2 WHERE userId = ? AND progressPercent >= 100', [userId],
      );
      return row?.count ?? 0;
    } catch {
      return 0;
    }
  }

  async getTotalReadingMinutes(userId: string | null): Promise<number> {
    if (!userId) return 0;
    try {
      const db = await getDb();
      const row = await db.getFirstAsync<{ totalSeconds: number }>(
        'SELECT COALESCE(SUM(readingTimeSeconds), 0) AS totalSeconds FROM reader_progress_v2 WHERE userId = ?', [userId],
      );
      return Math.round((row?.totalSeconds ?? 0) / 60);
    } catch {
      return 0;
    }
  }

  private async ensureProgressRow(session: ReaderSession): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      `INSERT OR IGNORE INTO reader_progress_v2 (userId, bookId, contentVersion, totalWords)
       VALUES (?, ?, ?, ?)`,
      [session.userId, session.bookId, session.contentVersion, session.totalWords],
    );
  }

  private startInterval(): void {
    this.clearInterval();
    this.intervalHandle = setInterval(() => {
      const session = this.session;
      if (!session || useAuthStore.getState().user?.id !== session.userId) return;
      void this.enqueueSync(() => this.flushElapsed(session));
      void this.syncToServer().catch((error) => console.warn('[ReadingSync] Periodic sync failed:', error));
    }, SYNC_INTERVAL_MS);
  }

  private clearInterval(): void {
    if (this.intervalHandle) clearInterval(this.intervalHandle);
    this.intervalHandle = null;
  }

  private async flushElapsed(session: ReaderSession): Promise<void> {
    if (session.lastTickAt === null) return;
    const now = Date.now();
    session.partialMilliseconds += Math.max(0, now - session.lastTickAt);
    session.lastTickAt = now;
    const seconds = Math.floor(session.partialMilliseconds / 1_000);
    session.partialMilliseconds %= 1_000;
    await this.persistElapsedSeconds(session, seconds);
  }

  private async persistElapsedSeconds(session: ReaderSession, seconds: number): Promise<void> {
    if (seconds <= 0) return;
    await this.ensureProgressRow(session);
    const db = await getDb();
    await db.runAsync(
      `UPDATE reader_progress_v2 SET readingTimeSeconds = readingTimeSeconds + ?,
         unsyncedReadingTimeSeconds = unsyncedReadingTimeSeconds + ?,
         localRevision = localRevision + 1, isDirty = 1
       WHERE userId = ? AND bookId = ? AND contentVersion = ?`,
      [seconds, seconds, session.userId, session.bookId, session.contentVersion],
    );
  }

  private async syncBook(session: ReaderSession, throwOnServerError: boolean): Promise<void> {
    if (useAuthStore.getState().user?.id !== session.userId) return;
    await this.persistOutboxSnapshot(session);
    await this.sendPendingSyncs(session.userId, throwOnServerError);
  }

  private async persistOutboxSnapshot(session: ReaderSession): Promise<void> {
    if (useAuthStore.getState().user?.id !== session.userId) return;
    const db = await getDb();
    await db.withExclusiveTransactionAsync(async (txn) => {
      const progress = await txn.getFirstAsync<ProgressRow>(
        `SELECT * FROM reader_progress_v2 WHERE userId = ? AND bookId = ? AND contentVersion = ?`,
        [session.userId, session.bookId, session.contentVersion],
      );
      if (!progress || !progress.isDirty) return;
      const existing = await txn.getFirstAsync<{ id: number }>(
        'SELECT id FROM reader_sync_outbox_v2 WHERE userId = ? AND bookId = ? AND contentVersion = ? AND revision = ?',
        [session.userId, session.bookId, session.contentVersion, progress.localRevision],
      );
      if (existing) return;
      const rows = await txn.getAllAsync<{ blockIndex: number; exposureMicros: number }>(
        `SELECT blockIndex, exposureMicros - queuedExposureMicros AS exposureMicros
           FROM reader_coverage_v2 WHERE userId = ? AND bookId = ? AND contentVersion = ?
             AND exposureMicros > queuedExposureMicros ORDER BY blockIndex ASC`,
        [session.userId, session.bookId, session.contentVersion],
      );
      const payload = createProgressSyncPayload({
        contentVersion: session.contentVersion,
        revision: progress.localRevision,
        currentPage: progress.currentPage,
        cfiPosition: progress.cfiPosition,
        coverageDeltas: rows,
        readingTimeDeltaSeconds: progress.unsyncedReadingTimeSeconds,
      }, Crypto.randomUUID());
      const now = new Date().toISOString();
      await txn.runAsync(
        `INSERT INTO reader_sync_outbox_v2 (userId, bookId, contentVersion, payload, createdAt, syncBatchId, revision)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [session.userId, session.bookId, session.contentVersion, JSON.stringify(payload), now, payload.syncBatchId, progress.localRevision],
      );
      await txn.runAsync(
        `UPDATE reader_coverage_v2 SET queuedExposureMicros = exposureMicros
          WHERE userId = ? AND bookId = ? AND contentVersion = ?`,
        [session.userId, session.bookId, session.contentVersion],
      );
      await txn.runAsync(
        `UPDATE reader_progress_v2 SET unsyncedReadingTimeSeconds = 0
          WHERE userId = ? AND bookId = ? AND contentVersion = ? AND localRevision = ?`,
        [session.userId, session.bookId, session.contentVersion, progress.localRevision],
      );
    });
  }

  private async sendPendingSyncs(userId: string, throwOnServerError: boolean): Promise<void> {
    if (useAuthStore.getState().user?.id !== userId) return;
    const db = await getDb();
    const pending = await db.getAllAsync<PendingSync>(
      'SELECT * FROM reader_sync_outbox_v2 WHERE userId = ? ORDER BY createdAt ASC, id ASC', [userId],
    );
    for (const item of pending) {
      if (!canSendPendingSyncForAccount(useAuthStore.getState().user?.id ?? null, item.userId)) return;
      let payload: ReadingProgressSyncRequestDto;
      try {
        const restored = restorePendingSync(item.payload, item.syncBatchId);
        payload = restored.payload;
      } catch (error) {
        console.error(`[ReadingSync] Quarantined invalid v2 batch id=${item.id}`, error);
        await db.runAsync('DELETE FROM reader_sync_outbox_v2 WHERE id = ? AND userId = ?', [item.id, userId]);
        continue;
      }
      try {
        await api.put(`/reading/${item.bookId}/progress`, payload, { expectedUserId: userId });
        await this.acknowledgePendingSync(db, item);
      } catch (error) {
        const err = error as { response?: { status?: number; data?: { error?: string } }; code?: string; message?: string };
        if (!err.response || err.code === 'ECONNABORTED' || err.message === 'Network Error') return;
        if (err.response.status === 404 || (err.response.status === 409 && err.response.data?.error?.includes('content changed'))) {
          await db.runAsync('DELETE FROM reader_sync_outbox_v2 WHERE id = ? AND userId = ?', [item.id, userId]);
          continue;
        }
        await db.runAsync('UPDATE reader_sync_outbox_v2 SET retries = retries + 1 WHERE id = ? AND userId = ?', [item.id, userId]);
        if (throwOnServerError) throw error;
        return;
      }
    }
  }

  private async acknowledgePendingSync(db: SQLite.SQLiteDatabase, item: PendingSync): Promise<void> {
    await db.withExclusiveTransactionAsync(async (txn) => {
      await txn.runAsync('DELETE FROM reader_sync_outbox_v2 WHERE id = ? AND userId = ?', [item.id, item.userId]);
      const progress = await txn.getFirstAsync<ProgressRow>(
        'SELECT * FROM reader_progress_v2 WHERE userId = ? AND bookId = ? AND contentVersion = ?',
        [item.userId, item.bookId, item.contentVersion],
      );
      const pendingCount = await txn.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) AS count FROM reader_sync_outbox_v2 WHERE userId = ? AND bookId = ? AND contentVersion = ?',
        [item.userId, item.bookId, item.contentVersion],
      );
      if (!progress || !canMarkProgressSynced(progress.localRevision, item.revision, progress.unsyncedReadingTimeSeconds, pendingCount?.count ?? 0)) return;
      await txn.runAsync(
        `UPDATE reader_progress_v2 SET isDirty = 0, lastSyncedAt = ?
          WHERE userId = ? AND bookId = ? AND contentVersion = ? AND localRevision = ? AND unsyncedReadingTimeSeconds = 0
            AND NOT EXISTS (SELECT 1 FROM reader_sync_outbox_v2 WHERE userId = ? AND bookId = ? AND contentVersion = ?)`,
        [new Date().toISOString(), item.userId, item.bookId, item.contentVersion, item.revision, item.userId, item.bookId, item.contentVersion],
      );
    });
  }
}

export const readingSync = new ReadingSync();
