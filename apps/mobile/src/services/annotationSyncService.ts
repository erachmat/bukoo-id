import AsyncStorage from '@react-native-async-storage/async-storage';
import { highlightService, Highlight } from './highlightService';
import { bookmarkService, Bookmark } from './bookmarkService';

interface RemoteHighlight {
  cfiRange: string;
  text: string;
  color: string;
  note?: string;
}

interface RemoteBookmark {
  cfi: string;
  chapterTitle?: string;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://bukoo-api.erachmat-dev.workers.dev/v1';

class AnnotationSyncService {
  private async getAuthToken(): Promise<string | null> {
    return AsyncStorage.getItem('userToken');
  }

  async syncHighlights(bookId: string): Promise<Highlight[]> {
    const localHighlights = await highlightService.getHighlights(bookId);
    const token = await this.getAuthToken();
    if (!token) return localHighlights;

    try {
      const res = await fetch(`${API_BASE_URL}/reading/${bookId}/highlights`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const remote: RemoteHighlight[] = await res.json();
        for (const item of remote) {
          await highlightService.addHighlight(
            bookId,
            item.cfiRange,
            item.text,
            item.color,
            item.note
          );
        }
      }
    } catch (e) {
      console.warn('[AnnotationSyncService] Remote highlight fetch failed, fallback to local', e);
    }

    return highlightService.getHighlights(bookId);
  }

  async pushHighlight(bookId: string, cfiRange: string, text: string, color: string, note?: string): Promise<void> {
    await highlightService.addHighlight(bookId, cfiRange, text, color, note);
    const token = await this.getAuthToken();
    if (!token) return;

    try {
      await fetch(`${API_BASE_URL}/reading/${bookId}/highlights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cfiRange, text, color, note }),
      });
    } catch (e) {
      console.warn('[AnnotationSyncService] Remote highlight push failed:', e);
    }
  }

  async syncBookmarks(bookId: string): Promise<Bookmark[]> {
    const localBookmarks = await bookmarkService.getBookmarks(bookId);
    const token = await this.getAuthToken();
    if (!token) return localBookmarks;

    try {
      const res = await fetch(`${API_BASE_URL}/reading/${bookId}/bookmarks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const remote: RemoteBookmark[] = await res.json();
        for (const item of remote) {
          await bookmarkService.addBookmark(bookId, item.cfi, item.chapterTitle || 'Markah');
        }
      }
    } catch (e) {
      console.warn('[AnnotationSyncService] Remote bookmark fetch failed, fallback to local', e);
    }

    return bookmarkService.getBookmarks(bookId);
  }
}

export const annotationSyncService = new AnnotationSyncService();
