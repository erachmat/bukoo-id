import { getSharedDb } from './annotationDb';

export interface Highlight {
  id: number;
  bookId: string;
  cfiRange: string;
  text: string;
  color: string;
  note?: string;
  createdAt: number;
}

class HighlightService {
  async addHighlight(
    bookId: string, 
    cfiRange: string, 
    text: string, 
    color: string, 
    note?: string
  ): Promise<void> {
    try {
      const db = await getSharedDb();
      await db.runAsync(
        'INSERT INTO highlights (bookId, cfiRange, text, color, note, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
        bookId, cfiRange, text, color, note || null, Date.now()
      );
    } catch (e) {
      console.error('[HighlightService] Error adding highlight', e);
    }
  }

  async removeHighlight(id: number): Promise<void> {
    try {
      const db = await getSharedDb();
      await db.runAsync(
        'DELETE FROM highlights WHERE id = ?',
        id
      );
    } catch (e) {
      console.error('[HighlightService] Error removing highlight', e);
    }
  }

  async getHighlights(bookId: string): Promise<Highlight[]> {
    try {
      const db = await getSharedDb();
      const results = await db.getAllAsync<Highlight>(
        'SELECT * FROM highlights WHERE bookId = ? ORDER BY createdAt DESC',
        [bookId]
      );
      return results;
    } catch (e) {
      console.error('[HighlightService] Error getting highlights', e);
      return [];
    }
  }

  async updateNote(id: number, note: string): Promise<void> {
    try {
      const db = await getSharedDb();
      await db.runAsync(
        'UPDATE highlights SET note = ? WHERE id = ?',
        [note, id]
      );
    } catch (e) {
      console.error('[HighlightService] Error updating note', e);
    }
  }
}

export const highlightService = new HighlightService();
