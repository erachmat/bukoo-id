import * as SecureStore from 'expo-secure-store';
import { api, ACCESS_TOKEN_KEY } from './api';
import { highlightService, Highlight } from './highlightService';
import { bookmarkService, Bookmark } from './bookmarkService';
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
  /**
   * Whether the user has a stored access token. Used to skip network calls
   * entirely when signed out (offline / demo books) so the 401→refresh flow
   * is not triggered for every annotation action.
   */
  private async isAuthenticated(): Promise<boolean> {
    return !!(await SecureStore.getItemAsync(ACCESS_TOKEN_KEY));
  }

  private async getTombstones(bookId: string, type: 'highlight' | 'bookmark'): Promise<Set<string>> {
    try {
      const db = await getSharedDb();
      const rows = await db.getAllAsync<{ targetCfi: string }>(
        'SELECT targetCfi FROM deleted_annotations WHERE bookId = ? AND type = ?',
        [bookId, type]
      );
      return new Set(rows.map((r) => r.targetCfi));
    } catch {
      return new Set();
    }
  }

  private async clearTombstone(bookId: string, type: 'highlight' | 'bookmark', targetCfi: string): Promise<void> {
    try {
      const db = await getSharedDb();
      await db.runAsync(
        'DELETE FROM deleted_annotations WHERE bookId = ? AND type = ? AND targetCfi = ?',
        [bookId, type, targetCfi]
      );
    } catch (e) {
      console.warn('[AnnotationSyncService] clearTombstone failed:', e);
    }
  }

  /**
   * Pulls remote highlights and merges them into local storage idempotently
   * (dedupe by cfiRange). Local-only highlights (pending offline pushes) are
   * kept. Returns the merged local list.
   */
  async syncHighlights(bookId: string): Promise<Highlight[]> {
    const localHighlights = await highlightService.getHighlights(bookId);
    if (!(await this.isAuthenticated())) return localHighlights;

    try {
      const res = await api.get<RemoteHighlight[]>(`/reading/highlights/${bookId}`);
      const remote = res.data || [];
      const tombstones = await this.getTombstones(bookId, 'highlight');

      // Sync local deletions to remote
      for (const tombstoneCfi of tombstones) {
        const match = remote.find((r) => r.cfiRange === tombstoneCfi);
        if (match && match.id) {
          try {
            await api.delete(`/reading/highlights/${match.id}`);
          } catch (e) {
            console.warn('[AnnotationSyncService] Failed to sync deleted highlight:', e);
          }
        }
        await this.clearTombstone(bookId, 'highlight', tombstoneCfi);
      }

      const localByCfi = new Set(localHighlights.map((h) => h.cfiRange));
      let changed = false;
      for (const item of remote) {
        if (!tombstones.has(item.cfiRange) && !localByCfi.has(item.cfiRange)) {
          await highlightService.addHighlight(
            bookId,
            item.cfiRange,
            item.text,
            item.color || '#FACC15',
            item.note
          );
          localByCfi.add(item.cfiRange);
          changed = true;
        }
      }
      if (changed) {
        return highlightService.getHighlights(bookId);
      }
    } catch (e) {
      console.warn('[AnnotationSyncService] Remote highlight fetch failed, fallback to local', e);
    }

    return localHighlights;
  }

  /**
   * Adds a highlight locally (deduped) and pushes it to the server if signed in.
   */
  async pushHighlight(bookId: string, cfiRange: string, text: string, color: string, note?: string): Promise<void> {
    const existing = await highlightService.getHighlights(bookId);
    if (!existing.some((h) => h.cfiRange === cfiRange)) {
      await highlightService.addHighlight(bookId, cfiRange, text, color, note);
    }
    if (!(await this.isAuthenticated())) return;

    try {
      await api.post(`/reading/highlights/${bookId}`, { cfiRange, text, color, note });
    } catch (e) {
      console.warn('[AnnotationSyncService] Remote highlight push failed:', e);
    }
  }

  /**
   * Deletes a highlight locally (all rows matching the range) and removes it
   * from the server by resolving the remote id from the cfiRange.
   */
  async deleteHighlight(bookId: string, cfiRange: string): Promise<void> {
    const local = await highlightService.getHighlights(bookId);
    for (const h of local) {
      if (h.cfiRange === cfiRange) {
        await highlightService.removeHighlight(h.id);
      }
    }
    if (!(await this.isAuthenticated())) return;

    try {
      const res = await api.get<RemoteHighlight[]>(`/reading/highlights/${bookId}`);
      const match = (res.data || []).find((r) => r.cfiRange === cfiRange);
      if (match && match.id) {
        await api.delete(`/reading/highlights/${match.id}`);
      }
    } catch (e) {
      console.warn('[AnnotationSyncService] Remote highlight delete failed:', e);
    }
  }

  /**
   * Updates the note on all local highlights matching the range and mirrors it
   * to the server (PATCH by resolved remote id).
   */
  async updateHighlightNote(bookId: string, cfiRange: string, note: string): Promise<void> {
    const local = await highlightService.getHighlights(bookId);
    for (const h of local) {
      if (h.cfiRange === cfiRange) {
        await highlightService.updateNote(h.id, note);
      }
    }
    if (!(await this.isAuthenticated())) return;

    try {
      const res = await api.get<RemoteHighlight[]>(`/reading/highlights/${bookId}`);
      const match = (res.data || []).find((r) => r.cfiRange === cfiRange);
      if (match && match.id) {
        await api.patch(`/reading/highlights/${match.id}`, { note });
      }
    } catch (e) {
      console.warn('[AnnotationSyncService] Remote highlight note update failed:', e);
    }
  }

  /**
   * Pulls remote bookmarks and merges them into local storage idempotently
   * (dedupe by cfi). Returns the merged local list.
   */
  async syncBookmarks(bookId: string): Promise<Bookmark[]> {
    const localBookmarks = await bookmarkService.getBookmarks(bookId);
    if (!(await this.isAuthenticated())) return localBookmarks;

    try {
      const res = await api.get<RemoteBookmark[]>(`/reading/bookmarks/${bookId}`);
      const remote = res.data || [];
      const tombstones = await this.getTombstones(bookId, 'bookmark');

      // Sync local deletions to remote
      for (const tombstoneCfi of tombstones) {
        const match = remote.find((r) => r.cfi === tombstoneCfi);
        if (match && match.id) {
          try {
            await api.delete(`/reading/bookmarks/${match.id}`);
          } catch (e) {
            console.warn('[AnnotationSyncService] Failed to sync deleted bookmark:', e);
          }
        }
        await this.clearTombstone(bookId, 'bookmark', tombstoneCfi);
      }

      const localByCfi = new Set(localBookmarks.map((b) => b.cfi));
      let changed = false;
      for (const item of remote) {
        if (!tombstones.has(item.cfi) && !localByCfi.has(item.cfi)) {
          await bookmarkService.addBookmark(bookId, item.cfi, item.chapterTitle || 'Markah');
          localByCfi.add(item.cfi);
          changed = true;
        }
      }
      if (changed) {
        return bookmarkService.getBookmarks(bookId);
      }
    } catch (e) {
      console.warn('[AnnotationSyncService] Remote bookmark fetch failed, fallback to local', e);
    }

    return localBookmarks;
  }

  /**
   * Adds a bookmark locally (deduped) and pushes it to the server if signed in.
   */
  async pushBookmark(bookId: string, cfi: string, chapterTitle?: string): Promise<void> {
    const existing = await bookmarkService.getBookmarks(bookId);
    if (!existing.some((b) => b.cfi === cfi)) {
      await bookmarkService.addBookmark(bookId, cfi, chapterTitle || 'Markah');
    }
    if (!(await this.isAuthenticated())) return;

    try {
      await api.post(`/reading/bookmarks/${bookId}`, { cfi, chapterTitle });
    } catch (e) {
      console.warn('[AnnotationSyncService] Remote bookmark push failed:', e);
    }
  }

  /**
   * Removes a bookmark locally and deletes it from the server by resolved id.
   */
  async deleteBookmark(bookId: string, cfi: string): Promise<void> {
    const local = await bookmarkService.getBookmarks(bookId);
    for (const b of local) {
      if (b.cfi === cfi) {
        await bookmarkService.removeBookmark(bookId, b.cfi);
      }
    }
    if (!(await this.isAuthenticated())) return;

    try {
      const res = await api.get<RemoteBookmark[]>(`/reading/bookmarks/${bookId}`);
      const match = (res.data || []).find((r) => r.cfi === cfi);
      if (match && match.id) {
        await api.delete(`/reading/bookmarks/${match.id}`);
      }
    } catch (e) {
      console.warn('[AnnotationSyncService] Remote bookmark delete failed:', e);
    }
  }
}

export const annotationSyncService = new AnnotationSyncService();
