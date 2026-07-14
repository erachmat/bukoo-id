import * as SQLite from 'expo-sqlite';

export interface Bookmark {
  id: number;
  bookId: string;
  cfi: string;
  chapterTitle: string;
  createdAt: number;
}

class BookmarkService {
  private db: SQLite.SQLiteDatabase | null = null;
  private isInitialized = false;

  async init() {
    if (this.isInitialized) return;
    try {
      this.db = await SQLite.openDatabaseAsync('bukoo.db');
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS bookmarks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          bookId TEXT NOT NULL,
          cfi TEXT NOT NULL,
          chapterTitle TEXT,
          createdAt INTEGER NOT NULL
        );
      `);
      this.isInitialized = true;
    } catch (e) {
      console.error('[BookmarkService] Failed to initialize db', e);
    }
  }

  async addBookmark(bookId: string, cfi: string, chapterTitle: string = 'Unknown'): Promise<void> {
    await this.init();
    if (!this.db) return;

    try {
      await this.db.runAsync(
        'INSERT INTO bookmarks (bookId, cfi, chapterTitle, createdAt) VALUES (?, ?, ?, ?)',
        bookId, cfi, chapterTitle, Date.now()
      );
    } catch (e) {
      console.error('[BookmarkService] Error adding bookmark', e);
    }
  }

  async removeBookmark(bookId: string, cfi: string): Promise<void> {
    await this.init();
    if (!this.db) return;

    try {
      await this.db.runAsync(
        'DELETE FROM bookmarks WHERE bookId = ? AND cfi = ?',
        bookId, cfi
      );
    } catch (e) {
      console.error('[BookmarkService] Error removing bookmark', e);
    }
  }

  async getBookmarks(bookId: string): Promise<Bookmark[]> {
    await this.init();
    if (!this.db) return [];

    try {
      const results = await this.db.getAllAsync<Bookmark>(
        'SELECT * FROM bookmarks WHERE bookId = ? ORDER BY createdAt DESC',
        [bookId]
      );
      return results;
    } catch (e) {
      console.error('[BookmarkService] Error getting bookmarks', e);
      return [];
    }
  }

  async isBookmarked(bookId: string, cfi: string): Promise<boolean> {
    await this.init();
    if (!this.db) return false;

    try {
      const result = await this.db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM bookmarks WHERE bookId = ? AND cfi = ?',
        bookId, cfi
      );
      return result ? result.count > 0 : false;
    } catch (e) {
      console.error('[BookmarkService] Error checking bookmark', e);
      return false;
    }
  }
}

export const bookmarkService = new BookmarkService();
