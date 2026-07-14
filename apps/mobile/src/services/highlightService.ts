import * as SQLite from 'expo-sqlite';

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
  private db: SQLite.SQLiteDatabase | null = null;
  private isInitialized = false;

  async init() {
    if (this.isInitialized) return;
    try {
      this.db = await SQLite.openDatabaseAsync('bukoo.db');
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS highlights (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          bookId TEXT NOT NULL,
          cfiRange TEXT NOT NULL,
          text TEXT NOT NULL,
          color TEXT NOT NULL,
          note TEXT,
          createdAt INTEGER NOT NULL
        );
      `);
      this.isInitialized = true;
    } catch (e) {
      console.error('[HighlightService] Failed to initialize db', e);
    }
  }

  async addHighlight(
    bookId: string, 
    cfiRange: string, 
    text: string, 
    color: string, 
    note?: string
  ): Promise<void> {
    await this.init();
    if (!this.db) return;

    try {
      await this.db.runAsync(
        'INSERT INTO highlights (bookId, cfiRange, text, color, note, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
        bookId, cfiRange, text, color, note || null, Date.now()
      );
    } catch (e) {
      console.error('[HighlightService] Error adding highlight', e);
    }
  }

  async removeHighlight(id: number): Promise<void> {
    await this.init();
    if (!this.db) return;

    try {
      await this.db.runAsync(
        'DELETE FROM highlights WHERE id = ?',
        id
      );
    } catch (e) {
      console.error('[HighlightService] Error removing highlight', e);
    }
  }

  async getHighlights(bookId: string): Promise<Highlight[]> {
    await this.init();
    if (!this.db) return [];

    try {
      const results = await this.db.getAllAsync<Highlight>(
        'SELECT * FROM highlights WHERE bookId = ? ORDER BY createdAt DESC',
        [bookId]
      );
      return results;
    } catch (e) {
      console.error('[HighlightService] Error getting highlights', e);
      return [];
    }
  }
}

export const highlightService = new HighlightService();
