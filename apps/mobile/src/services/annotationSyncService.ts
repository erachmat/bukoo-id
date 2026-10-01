import * as SecureStore from 'expo-secure-store';
import { api, ACCESS_TOKEN_KEY } from './api';
import { useAuthStore } from '../stores/authStore';
import { highlightService, type Highlight } from './highlightService';
import { bookmarkService, type Bookmark } from './bookmarkService';
import { getSharedDb } from './annotationDb';

interface RemoteHighlight {
  id?: string;
  cfiRange: string;
  text: string;
  color: string;
  note?: string;
}

interface RemoteBookmark {
  id?: string;
  cfi: string;
  chapterTitle?: string;
}

class AnnotationSyncService {
  private async isCurrentAccount(userId: string): Promise<boolean> {
    return useAuthStore.getState().user?.id === userId && !!(await SecureStore.getItemAsync(ACCESS_TOKEN_KEY));
  }

  private async getTombstones(userId: string, bookId: string, type: 'highlight' | 'bookmark'): Promise<Set<string>> {
    try {
      const db = await getSharedDb();
      const rows = await db.getAllAsync<{ targetCfi: string }>(
        'SELECT targetCfi FROM deleted_annotations WHERE userId = ? AND bookId = ? AND type = ?',
        [userId, bookId, type],
      );
      return new Set(rows.map((row) => row.targetCfi));
    } catch {
      return new Set();
    }
  }

  private async clearTombstone(userId: string, bookId: string, type: 'highlight' | 'bookmark', targetCfi: string): Promise<void> {
    const db = await getSharedDb();
    await db.runAsync(
      'DELETE FROM deleted_annotations WHERE userId = ? AND bookId = ? AND type = ? AND targetCfi = ?',
      [userId, bookId, type, targetCfi],
    ).catch((error) => console.warn('[AnnotationSyncService] clearTombstone failed:', error));
  }

  async syncHighlights(bookId: string, userId: string): Promise<Highlight[]> {
    const local = await highlightService.getHighlights(userId, bookId);
    if (!(await this.isCurrentAccount(userId))) return local;
    try {
      const response = await api.get<RemoteHighlight[]>(`/reading/highlights/${bookId}`, { expectedUserId: userId });
      const remote = response.data || [];
      const tombstones = await this.getTombstones(userId, bookId, 'highlight');
      for (const cfi of tombstones) {
        if (!(await this.isCurrentAccount(userId))) return local;
        const match = remote.find((item) => item.cfiRange === cfi);
        if (match?.id) await api.delete(`/reading/highlights/${match.id}`, { expectedUserId: userId }).catch(() => {});
        await this.clearTombstone(userId, bookId, 'highlight', cfi);
      }
      const localCfis = new Set(local.map((item) => item.cfiRange));
      for (const item of remote) {
        if (!(await this.isCurrentAccount(userId))) return local;
        if (!tombstones.has(item.cfiRange) && !localCfis.has(item.cfiRange)) {
          await highlightService.addHighlight(userId, bookId, item.cfiRange, item.text, item.color || '#FACC15', item.note);
          localCfis.add(item.cfiRange);
        }
      }
      return highlightService.getHighlights(userId, bookId);
    } catch (error) {
      console.warn('[AnnotationSyncService] Remote highlight sync failed:', error);
      return local;
    }
  }

  async pushHighlight(bookId: string, userId: string, cfiRange: string, text: string, color: string, note?: string): Promise<void> {
    const existing = await highlightService.getHighlights(userId, bookId);
    if (!existing.some((item) => item.cfiRange === cfiRange)) {
      await highlightService.addHighlight(userId, bookId, cfiRange, text, color, note);
    }
    if (!(await this.isCurrentAccount(userId))) return;
    await api.post(`/reading/highlights/${bookId}`, { cfiRange, text, color, note }, { expectedUserId: userId })
      .catch((error) => console.warn('[AnnotationSyncService] Remote highlight push failed:', error));
  }

  async deleteHighlight(bookId: string, userId: string, cfiRange: string): Promise<void> {
    const local = await highlightService.getHighlights(userId, bookId);
    for (const item of local) {
      if (item.cfiRange === cfiRange) await highlightService.removeHighlight(userId, item.id);
    }
    if (!(await this.isCurrentAccount(userId))) return;
    try {
      const response = await api.get<RemoteHighlight[]>(`/reading/highlights/${bookId}`, { expectedUserId: userId });
      const match = (response.data || []).find((item) => item.cfiRange === cfiRange);
      if (match?.id) await api.delete(`/reading/highlights/${match.id}`, { expectedUserId: userId });
    } catch (error) {
      console.warn('[AnnotationSyncService] Remote highlight delete failed:', error);
    }
  }

  async updateHighlightNote(bookId: string, userId: string, cfiRange: string, note: string): Promise<void> {
    const local = await highlightService.getHighlights(userId, bookId);
    for (const item of local) {
      if (item.cfiRange === cfiRange) await highlightService.updateNote(userId, item.id, note);
    }
    if (!(await this.isCurrentAccount(userId))) return;
    try {
      const response = await api.get<RemoteHighlight[]>(`/reading/highlights/${bookId}`, { expectedUserId: userId });
      const match = (response.data || []).find((item) => item.cfiRange === cfiRange);
      if (match?.id) await api.patch(`/reading/highlights/${match.id}`, { note }, { expectedUserId: userId });
    } catch (error) {
      console.warn('[AnnotationSyncService] Remote highlight note update failed:', error);
    }
  }

  async syncBookmarks(bookId: string, userId: string): Promise<Bookmark[]> {
    const local = await bookmarkService.getBookmarks(userId, bookId);
    if (!(await this.isCurrentAccount(userId))) return local;
    try {
      const response = await api.get<RemoteBookmark[]>(`/reading/bookmarks/${bookId}`, { expectedUserId: userId });
      const remote = response.data || [];
      const tombstones = await this.getTombstones(userId, bookId, 'bookmark');
      for (const cfi of tombstones) {
        if (!(await this.isCurrentAccount(userId))) return local;
        const match = remote.find((item) => item.cfi === cfi);
        if (match?.id) await api.delete(`/reading/bookmarks/${match.id}`, { expectedUserId: userId }).catch(() => {});
        await this.clearTombstone(userId, bookId, 'bookmark', cfi);
      }
      const localCfis = new Set(local.map((item) => item.cfi));
      for (const item of remote) {
        if (!(await this.isCurrentAccount(userId))) return local;
        if (!tombstones.has(item.cfi) && !localCfis.has(item.cfi)) {
          await bookmarkService.addBookmark(userId, bookId, item.cfi, item.chapterTitle || 'Markah');
          localCfis.add(item.cfi);
        }
      }
      return bookmarkService.getBookmarks(userId, bookId);
    } catch (error) {
      console.warn('[AnnotationSyncService] Remote bookmark sync failed:', error);
      return local;
    }
  }

  async pushBookmark(bookId: string, userId: string, cfi: string, chapterTitle?: string): Promise<void> {
    const existing = await bookmarkService.getBookmarks(userId, bookId);
    if (!existing.some((item) => item.cfi === cfi)) await bookmarkService.addBookmark(userId, bookId, cfi, chapterTitle || 'Markah');
    if (!(await this.isCurrentAccount(userId))) return;
    await api.post(`/reading/bookmarks/${bookId}`, { cfi, chapterTitle }, { expectedUserId: userId })
      .catch((error) => console.warn('[AnnotationSyncService] Remote bookmark push failed:', error));
  }

  async deleteBookmark(bookId: string, userId: string, cfi: string): Promise<void> {
    const local = await bookmarkService.getBookmarks(userId, bookId);
    for (const item of local) {
      if (item.cfi === cfi) await bookmarkService.removeBookmark(userId, bookId, item.cfi);
    }
    if (!(await this.isCurrentAccount(userId))) return;
    try {
      const response = await api.get<RemoteBookmark[]>(`/reading/bookmarks/${bookId}`, { expectedUserId: userId });
      const match = (response.data || []).find((item) => item.cfi === cfi);
      if (match?.id) await api.delete(`/reading/bookmarks/${match.id}`, { expectedUserId: userId });
    } catch (error) {
      console.warn('[AnnotationSyncService] Remote bookmark delete failed:', error);
    }
  }
}

export const annotationSyncService = new AnnotationSyncService();
