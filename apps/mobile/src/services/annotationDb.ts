import * as SQLite from 'expo-sqlite';

/**
 * Shared SQLite connection for annotation data (highlights + bookmarks).
 *
 * Both `HighlightService` and `BookmarkService` used to call
 * `SQLite.openDatabaseAsync('bukoo.db')` independently. On Android this
 * created TWO native handles for the same file, and when expo-sqlite's shared
 * refcount dropped one handle (dev reload / GC), the surviving JS wrapper
 * pointed at a native DB whose C++ `db` handle was null — so every
 * `prepareAsync` failed with `java.lang.NullPointerException`.
 *
 * Fix: open the database ONCE and hand the same `SQLiteDatabase` instance to
 * every service. `useNewConnection: true` additionally guarantees this handle
 * is not deduplicated/refcounted with any other (e.g. the SQLite devtools
 * client's connection), matching the documented workaround for
 * expo/expo#28176.
 */
let _db: SQLite.SQLiteDatabase | null = null;
let _initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getSharedDb(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;
  if (!_initPromise) {
    _initPromise = (async () => {
      const db = await SQLite.openDatabaseAsync('bukoo.db', {
        useNewConnection: true,
      });
      // Prisma-style composite schema, idempotent CREATE IF NOT EXISTS.
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS highlights (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          bookId TEXT NOT NULL,
          cfiRange TEXT NOT NULL,
          text TEXT NOT NULL,
          color TEXT NOT NULL,
          note TEXT,
          createdAt INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS bookmarks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          bookId TEXT NOT NULL,
          cfi TEXT NOT NULL,
          chapterTitle TEXT,
          createdAt INTEGER NOT NULL
        );
      `);
      _db = db;
      return db;
    })().catch((e) => {
      // Allow retrying on next call after a failed init.
      _initPromise = null;
      throw e;
    });
  }
  return _initPromise;
}