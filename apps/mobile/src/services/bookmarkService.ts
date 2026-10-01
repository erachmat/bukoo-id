import { getSharedDb } from './annotationDb';

export interface Bookmark {
  id: number;
  userId: string;
  bookId: string;
  cfi: string;
  chapterTitle: string;
  createdAt: number;
}

class BookmarkService {
  async addBookmark(userId: string, bookId: string, cfi: string, chapterTitle = 'Unknown'): Promise<void> {
    if (!userId) return;
    try {
      const db = await getSharedDb();
      await db.runAsync(
        'DELETE FROM deleted_annotations WHERE userId = ? AND bookId = ? AND type = ? AND targetCfi = ?',
        [userId, bookId, 'bookmark', cfi],
      );
      await db.runAsync(
        'INSERT INTO bookmarks (userId, bookId, cfi, chapterTitle, createdAt) VALUES (?, ?, ?, ?, ?)',
        [userId, bookId, cfi, chapterTitle, Date.now()],
      );
    } catch (error) {
      console.error('[BookmarkService] Error adding bookmark', error);
    }
  }

  async removeBookmark(userId: string, bookId: string, cfi: string): Promise<void> {
    if (!userId) return;
    try {
      const db = await getSharedDb();
      await db.runAsync(
        'INSERT INTO deleted_annotations (userId, bookId, type, targetCfi, createdAt) VALUES (?, ?, ?, ?, ?)',
        [userId, bookId, 'bookmark', cfi, Date.now()],
      );
      await db.runAsync('DELETE FROM bookmarks WHERE userId = ? AND bookId = ? AND cfi = ?', [userId, bookId, cfi]);
    } catch (error) {
      console.error('[BookmarkService] Error removing bookmark', error);
    }
  }

  async getBookmarks(userId: string, bookId: string): Promise<Bookmark[]> {
    if (!userId) return [];
    try {
      const db = await getSharedDb();
      return await db.getAllAsync<Bookmark>(
        'SELECT * FROM bookmarks WHERE userId = ? AND bookId = ? ORDER BY createdAt DESC',
        [userId, bookId],
      );
    } catch (error) {
      console.error('[BookmarkService] Error getting bookmarks', error);
      return [];
    }
  }

  async isBookmarked(userId: string, bookId: string, cfi: string): Promise<boolean> {
    if (!userId) return false;
    try {
      const db = await getSharedDb();
      const result = await db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) AS count FROM bookmarks WHERE userId = ? AND bookId = ? AND cfi = ?',
        [userId, bookId, cfi],
      );
      return (result?.count ?? 0) > 0;
    } catch (error) {
      console.error('[BookmarkService] Error checking bookmark', error);
      return false;
    }
  }
}

export const bookmarkService = new BookmarkService();
