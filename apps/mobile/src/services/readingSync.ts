import * as SQLite from 'expo-sqlite';
import { api } from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReadingProgress {
  bookId: string;
  currentPage: number;
  cfiPosition: string;
  progressPercent: number;
  readingTimeSeconds: number;
  lastSyncedAt: string | null;
  isDirty: boolean;
}

export interface PendingSync {
  id: number;
  bookId: string;
  payload: string; // JSON string
  createdAt: string;
  retries: number;
}

interface SyncPayload {
  currentPage: number;
  cfiPosition: string;
  progressPercent: number;
  reading_time_delta: number; // seconds accumulated since last server sync
}

// ─── Database ─────────────────────────────────────────────────────────────────

let _db: SQLite.SQLiteDatabase | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;
  _db = await SQLite.openDatabaseAsync('bukoo_reading.db');
  await initSchema(_db);
  return _db;
}

async function initSchema(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS reading_progress (
      bookId            TEXT PRIMARY KEY NOT NULL,
      currentPage       INTEGER NOT NULL DEFAULT 0,
      cfiPosition       TEXT NOT NULL DEFAULT '',
      progressPercent   REAL NOT NULL DEFAULT 0,
      readingTimeSeconds INTEGER NOT NULL DEFAULT 0,
      lastSyncedAt      TEXT,
      isDirty           INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS pending_syncs (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      bookId      TEXT NOT NULL,
      payload     TEXT NOT NULL,
      createdAt   TEXT NOT NULL,
      retries     INTEGER NOT NULL DEFAULT 0
    );
  `);
}

// ─── ReadingSync Class ────────────────────────────────────────────────────────

const SYNC_INTERVAL_MS = 30_000; // 30 seconds
const MAX_RETRIES = 5;

export class ReadingSync {
  private bookId: string | null = null;
  private intervalHandle: ReturnType<typeof setInterval> | null = null;

  // In-memory reading time accumulator (reset after each server sync)
  private readingTimeDeltaSeconds: number = 0;
  private pageStartTime: number | null = null;
  private isBackgrounded: boolean = false;

  // ── Session lifecycle ───────────────────────────────────────────────────────

  /**
   * Starts a new reading session for the given book.
   * Kicks off the 30-second periodic sync interval.
   */
  startSession(bookId: string): void {
    // Clean up any previous session first
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
    }

    this.bookId = bookId;
    this.readingTimeDeltaSeconds = 0;
    this.pageStartTime = Date.now();
    this.isBackgrounded = false;

    this.intervalHandle = setInterval(() => {
      this.syncToServer().catch((err) =>
        console.warn('[ReadingSync] Periodic sync failed:', err)
      );
    }, SYNC_INTERVAL_MS);
  }

  /**
   * Pauses time tracking when the app is backgrounded.
   * Call this from AppState change listener.
   */
  pauseTimeTracking(): void {
    if (!this.isBackgrounded && this.pageStartTime !== null) {
      this.readingTimeDeltaSeconds += Math.floor(
        (Date.now() - this.pageStartTime) / 1000
      );
    }
    this.isBackgrounded = true;
    this.pageStartTime = null;
  }

  /**
   * Resumes time tracking when the app comes back to foreground.
   */
  resumeTimeTracking(): void {
    this.isBackgrounded = false;
    this.pageStartTime = Date.now();
  }

  // ── Progress ────────────────────────────────────────────────────────────────

  /**
   * Saves progress to SQLite immediately and marks the record as dirty
   * (pending server sync). Also accumulates reading time for the current page.
   */
  async updateLocalProgress(page: number, cfiPosition: string): Promise<void> {
    if (!this.bookId) {
      console.warn('[ReadingSync] updateLocalProgress called without an active session');
      return;
    }

    // Accumulate time spent on previous page position before updating
    if (!this.isBackgrounded && this.pageStartTime !== null) {
      this.readingTimeDeltaSeconds += Math.floor(
        (Date.now() - this.pageStartTime) / 1000
      );
    }
    // Reset the per-page timer
    this.pageStartTime = this.isBackgrounded ? null : Date.now();

    const db = await getDb();
    const existing = await db.getFirstAsync<ReadingProgress>(
      'SELECT * FROM reading_progress WHERE bookId = ?',
      [this.bookId]
    );

    const totalReadingTime = (existing?.readingTimeSeconds ?? 0) + this.readingTimeDeltaSeconds;

    if (existing) {
      await db.runAsync(
        `UPDATE reading_progress
           SET currentPage        = ?,
               cfiPosition        = ?,
               readingTimeSeconds = ?,
               isDirty            = 1
         WHERE bookId = ?`,
        [page, cfiPosition, totalReadingTime, this.bookId]
      );
    } else {
      await db.runAsync(
        `INSERT INTO reading_progress
           (bookId, currentPage, cfiPosition, progressPercent, readingTimeSeconds, isDirty)
         VALUES (?, ?, ?, 0, ?, 1)`,
        [this.bookId, page, cfiPosition, totalReadingTime]
      );
    }
  }

  /**
   * Updates the progressPercent field in SQLite (calculated from total pages).
   */
  async updateProgressPercent(percent: number): Promise<void> {
    if (!this.bookId) return;
    const db = await getDb();
    await db.runAsync(
      'UPDATE reading_progress SET progressPercent = ? WHERE bookId = ?',
      [percent, this.bookId]
    );
  }

  // ── Session stop ────────────────────────────────────────────────────────────

  /**
   * Stops the session: clears the interval, flushes time, then forces an
   * immediate sync to the server (or queues it if offline).
   */
  async stopSession(): Promise<void> {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }

    // Flush remaining time
    if (!this.isBackgrounded && this.pageStartTime !== null) {
      this.readingTimeDeltaSeconds += Math.floor(
        (Date.now() - this.pageStartTime) / 1000
      );
      this.pageStartTime = null;
    }

    // Persist the final time delta before syncing
    if (this.bookId) {
      const db = await getDb();
      const existing = await db.getFirstAsync<ReadingProgress>(
        'SELECT readingTimeSeconds FROM reading_progress WHERE bookId = ?',
        [this.bookId]
      );
      if (existing !== null) {
        const total = (existing.readingTimeSeconds ?? 0) + this.readingTimeDeltaSeconds;
        await db.runAsync(
          'UPDATE reading_progress SET readingTimeSeconds = ?, isDirty = 1 WHERE bookId = ?',
          [total, this.bookId]
        );
      }
    }

    await this.syncToServer();

    this.bookId = null;
    this.readingTimeDeltaSeconds = 0;
  }

  // ── Server sync ─────────────────────────────────────────────────────────────

  /**
   * Attempts to push the current progress delta to the server.
   * - If offline: saves the payload to pending_syncs and marks isDirty.
   * - If successful: clears isDirty and resets the in-memory delta.
   */
  async syncToServer(): Promise<void> {
    if (!this.bookId) return;

    const db = await getDb();
    const progress = await db.getFirstAsync<ReadingProgress>(
      'SELECT * FROM reading_progress WHERE bookId = ?',
      [this.bookId]
    );

    if (!progress || !progress.isDirty) return;

    const payload: SyncPayload = {
      currentPage: progress.currentPage,
      cfiPosition: progress.cfiPosition,
      progressPercent: progress.progressPercent,
      reading_time_delta: this.readingTimeDeltaSeconds,
    };

    try {
      await api.put(`/reading/${this.bookId}/progress`, payload);

      // Success — mark clean, reset delta, update lastSyncedAt
      this.readingTimeDeltaSeconds = 0;
      const now = new Date().toISOString();
      await db.runAsync(
        'UPDATE reading_progress SET isDirty = 0, lastSyncedAt = ? WHERE bookId = ?',
        [now, this.bookId]
      );
    } catch (error: unknown) {
      const errResponse = (error as { response?: { status?: number; data?: unknown }; code?: string; message?: string });
      const isNetworkError =
        !errResponse.response ||
        errResponse.code === 'ECONNABORTED' ||
        errResponse.message === 'Network Error';

      if (isNetworkError) {
        // Queue for later retry
        await this._queuePendingSync(db, this.bookId, payload);
      } else if (errResponse.response?.status === 404) {
        // Book does not exist on server (e.g., local sample/demo book).
        // Clear delta and mark clean so we don't spam 404 errors every 30s.
        this.readingTimeDeltaSeconds = 0;
        await db.runAsync(
          'UPDATE reading_progress SET isDirty = 0 WHERE bookId = ?',
          [this.bookId]
        );
      } else {
        // Non-network error (e.g. 4xx/5xx): log and propagate
        console.error(
          '[ReadingSync] Server sync error:',
          errResponse.response?.data ?? (error as Error).message
        );
        throw error;
      }
    }
  }

  /**
   * Retries all pending syncs from the pending_syncs table.
   * Call this when the network comes back online.
   */
  async retryPendingSyncs(): Promise<void> {
    const db = await getDb();
    const pending = await db.getAllAsync<PendingSync>(
      'SELECT * FROM pending_syncs ORDER BY createdAt ASC'
    );

    for (const item of pending) {
      try {
        const payload: SyncPayload = JSON.parse(item.payload);
        await api.put(`/reading/${item.bookId}/progress`, payload);

        // Succeeded — remove from queue
        await db.runAsync('DELETE FROM pending_syncs WHERE id = ?', [item.id]);

        // Also clear dirty flag on the progress row if it matches current book
        await db.runAsync(
          `UPDATE reading_progress
             SET isDirty = 0, lastSyncedAt = ?
           WHERE bookId = ? AND isDirty = 1`,
          [new Date().toISOString(), item.bookId]
        );
      } catch (error: unknown) {
        const errResponse = (error as { response?: { status?: number; data?: unknown }; code?: string; message?: string });
        const isNetworkError =
          !errResponse.response ||
          errResponse.code === 'ECONNABORTED' ||
          errResponse.message === 'Network Error';

        if (isNetworkError) {
          // Still offline — stop retrying for now
          break;
        }

        if (errResponse.response?.status === 404) {
          // Book does not exist on server — remove item from queue
          await db.runAsync('DELETE FROM pending_syncs WHERE id = ?', [item.id]);
          continue;
        }

        // Non-network error — increment retry counter or drop if too many
        const newRetries = item.retries + 1;
        if (newRetries >= MAX_RETRIES) {
          console.warn(
            `[ReadingSync] Dropping pending sync id=${item.id} after ${MAX_RETRIES} retries`
          );
          await db.runAsync('DELETE FROM pending_syncs WHERE id = ?', [item.id]);
        } else {
          await db.runAsync(
            'UPDATE pending_syncs SET retries = ? WHERE id = ?',
            [newRetries, item.id]
          );
        }
      }
    }
  }

  // ── Local reads ─────────────────────────────────────────────────────────────

  /**
   * Reads the current locally-stored progress for a book.
   */
  async getLocalProgress(bookId: string): Promise<ReadingProgress | null> {
    const db = await getDb();
    return db.getFirstAsync<ReadingProgress>(
      'SELECT * FROM reading_progress WHERE bookId = ?',
      [bookId]
    );
  }

  async getUnsyncedCount(): Promise<number> {
    try {
      const db = await getDb();
      const result = await db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM pending_syncs'
      );
      const dirtyResult = await db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM reading_progress WHERE isDirty = 1'
      );
      return (result?.count ?? 0) + (dirtyResult?.count ?? 0);
    } catch (e) {
      console.error('[ReadingSync] Failed to get unsynced count', e);
      return 0;
    }
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  private async _queuePendingSync(
    db: SQLite.SQLiteDatabase,
    bookId: string,
    payload: SyncPayload
  ): Promise<void> {
    await db.runAsync(
      `INSERT INTO pending_syncs (bookId, payload, createdAt, retries)
       VALUES (?, ?, ?, 0)`,
      [bookId, JSON.stringify(payload), new Date().toISOString()]
    );
  }
}

// Singleton export for convenience
export const readingSync = new ReadingSync();
