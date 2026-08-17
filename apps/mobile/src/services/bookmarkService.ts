import { getSharedDb } from './annotationDb';

export interface Bookmark {
  id: number;
  bookId: string;
  cfi: string;
  chapterTitle: string;
  createdAt: number;
}

class BookmarkService {
  async addBookmark(bookId: string, cfi: string, chapterTitle: string = 'Unknown'): Promise<void> {
    try {
      const db = await getSharedDb();
      await db.runAsync(
        'INSERT INTO bookmarks (bookId, cfi, chapterTitle, createdAt) VALUES (?, ?, ?, ?)',
        bookId, cfi, chapterTitle, Date.now()
      );
    } catch (e) {
      console.error('[BookmarkService] Error adding bookmark', e);
    }
  }

  async removeBookmark(bookId: string, cfi: string): Promise<void> {
    try {
      const db = await getSharedDb();
      await db.runAsync(
        'DELETE FROM bookmarks WHERE bookId = ? AND cfi = ?',
        bookId, cfi
      );
    } catch (e) {
      console.error('[BookmarkService] Error removing bookmark', e);
    }
  }

  async getBookmarks(bookId: string): Promise<Bookmark[]> {
    try {
      const db = await getSharedDb();
      const results = await db.getAllAsync<Bookmark>(
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
    try {
      const db = await getSharedDb();
      const result = await db.getFirstAsync<{ count: number }>(
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
