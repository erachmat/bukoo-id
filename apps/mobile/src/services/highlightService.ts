import { getSharedDb } from './annotationDb';

export interface Highlight {
  id: number;
  userId: string;
  bookId: string;
  cfiRange: string;
  text: string;
  color: string;
  note?: string;
  createdAt: number;
}

class HighlightService {
  async addHighlight(userId: string, bookId: string, cfiRange: string, text: string, color: string, note?: string): Promise<void> {
    if (!userId) return;
    try {
      const db = await getSharedDb();
      await db.runAsync(
        'DELETE FROM deleted_annotations WHERE userId = ? AND bookId = ? AND type = ? AND targetCfi = ?',
        [userId, bookId, 'highlight', cfiRange],
      );
      await db.runAsync(
        'INSERT INTO highlights (userId, bookId, cfiRange, text, color, note, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, bookId, cfiRange, text, color, note || null, Date.now()],
      );
    } catch (error) {
      console.error('[HighlightService] Error adding highlight', error);
    }
  }

  async removeHighlight(userId: string, id: number): Promise<void> {
    if (!userId) return;
    try {
      const db = await getSharedDb();
      const item = await db.getFirstAsync<Highlight>('SELECT * FROM highlights WHERE userId = ? AND id = ?', [userId, id]);
      if (item) {
        await db.runAsync(
          'INSERT INTO deleted_annotations (userId, bookId, type, targetCfi, createdAt) VALUES (?, ?, ?, ?, ?)',
          [userId, item.bookId, 'highlight', item.cfiRange, Date.now()],
        );
      }
      await db.runAsync('DELETE FROM highlights WHERE userId = ? AND id = ?', [userId, id]);
    } catch (error) {
      console.error('[HighlightService] Error removing highlight', error);
    }
  }

  async getHighlights(userId: string, bookId: string): Promise<Highlight[]> {
    if (!userId) return [];
    try {
      const db = await getSharedDb();
      return await db.getAllAsync<Highlight>(
        'SELECT * FROM highlights WHERE userId = ? AND bookId = ? ORDER BY createdAt DESC',
        [userId, bookId],
      );
    } catch (error) {
      console.error('[HighlightService] Error getting highlights', error);
      return [];
    }
  }

  async updateNote(userId: string, id: number, note: string): Promise<void> {
    if (!userId) return;
    try {
      const db = await getSharedDb();
      await db.runAsync('UPDATE highlights SET note = ? WHERE userId = ? AND id = ?', [note, userId, id]);
    } catch (error) {
      console.error('[HighlightService] Error updating note', error);
    }
  }
}

export const highlightService = new HighlightService();
