import * as FileSystem from 'expo-file-system/legacy';
import { API_URL, ensureFreshAccessToken } from './api';

class BookDownloadService {
  private readonly DOWNLOAD_DIR = FileSystem.documentDirectory + 'books/';

  async ensureDirectoryExists(): Promise<void> {
    const dirInfo = await FileSystem.getInfoAsync(this.DOWNLOAD_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(this.DOWNLOAD_DIR, { intermediates: true });
    }
  }

  private getExtension(remoteUrl: string): string {
    return remoteUrl.toLowerCase().endsWith('.pdf') ? '.pdf' : '.epub';
  }

  /**
   * Validates that the file exists, is non-empty (> 1000 bytes), and starts
   * with the expected magic header for PDF (%PDF-) or EPUB (PK\x03\x04).
   */
  async validateBookFile(localUri: string): Promise<boolean> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(localUri);
      if (!fileInfo.exists || fileInfo.isDirectory || !fileInfo.size || fileInfo.size < 1000) {
        return false;
      }

      // Read first 16 bytes as Base64 to check magic header bytes without full file read
      const b64Head = await FileSystem.readAsStringAsync(localUri, {
        encoding: FileSystem.EncodingType.Base64,
        length: 16,
      }).catch(() => '');

      if (!b64Head || b64Head.length < 4) return false;

      const isPdf = localUri.toLowerCase().endsWith('.pdf');
      if (isPdf) {
        // "%PDF-" in Base64 starts with "JVBER" (or decoded starts with "%PDF-")
        if (b64Head.startsWith('JVBER')) return true;

        const rawHead = await FileSystem.readAsStringAsync(localUri, {
          encoding: FileSystem.EncodingType.UTF8,
          length: 8,
        }).catch(() => '');
        return rawHead.startsWith('%PDF-');
      } else {
        // "PK\x03\x04" (ZIP / EPUB) in Base64 starts with "UEsDB"
        if (b64Head.startsWith('UEsDB')) return true;

        const rawHead = await FileSystem.readAsStringAsync(localUri, {
          encoding: FileSystem.EncodingType.UTF8,
          length: 8,
        }).catch(() => '');
        return rawHead.startsWith('PK\x03\x04');
      }
    } catch (e) {
      console.warn(`[BookDownloadService] Failed magic byte validation for ${localUri}:`, e);
      return false;
    }
  }

  /**
   * Auth-protected download URL for a real book. The API streams the EPUB
   * from R2 at GET /v1/books/:id/download (Bearer token required).
   */
  getDownloadUrl(bookId: string): string {
    return `${API_URL}/books/${bookId}/download`;
  }

  /**
   * Ensures the book file exists locally via an authenticated download from
   * the API, returning the local path for the reader (or null on failure).
   * Reuses the cache — the file is downloaded only once per book.
   */
  async downloadBookForReading(bookId: string, onProgress?: (percent: number) => void): Promise<string | null> {
    const remoteUrl = this.getDownloadUrl(bookId);
    const cached = await this.getLocalBookPath(bookId, remoteUrl);
    if (cached) return cached;
    // NOTE: let failures propagate to the reader so it can surface the REAL
    // reason (e.g. an expired session) instead of a generic "failed to load".
    return this.downloadBook(bookId, remoteUrl, onProgress);
  }

  async downloadBook(
    bookId: string, 
    remoteUrl: string, 
    onProgress?: (percent: number) => void
  ): Promise<string> {
    await this.ensureDirectoryExists();

    // The API download endpoint requires a Bearer token. Fetch a fresh token
    // outside the axios interceptors (FileSystem can't use them).
    const token = await ensureFreshAccessToken();
    if (!token) {
      throw new Error('Sesi berakhir, silakan masuk kembali.');
    }

    const ext = this.getExtension(remoteUrl);
    const localUri = this.DOWNLOAD_DIR + bookId + ext;

    const fileInfo = await FileSystem.getInfoAsync(localUri);
    if (fileInfo.exists) {
      const isValid = await this.validateBookFile(localUri);
      if (isValid) {
        if (onProgress) onProgress(100);
        return localUri;
      }
      console.warn(`[BookDownloadService] Pre-download check: deleting invalid file at ${localUri}`);
      await FileSystem.deleteAsync(localUri, { idempotent: true });
    }

    let totalExpectedBytes = 0;

    const downloadResumable = FileSystem.createDownloadResumable(
      remoteUrl,
      localUri,
      { headers: { Authorization: `Bearer ${token}` } },
      (downloadProgress) => {
        if (downloadProgress.totalBytesExpectedToWrite > 0) {
          totalExpectedBytes = downloadProgress.totalBytesExpectedToWrite;
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          if (onProgress) {
            onProgress(progress * 100);
          }
        }
      }
    );

    try {
      const result = await downloadResumable.downloadAsync();
      if (!result) throw new Error('Download failed: No result returned');
      if (result.status && result.status !== 200) {
        await FileSystem.deleteAsync(localUri, { idempotent: true });
        throw new Error(`Download failed with status ${result.status}`);
      }

      // Check downloaded file size against totalBytesExpectedToWrite if progress callback reported expected size
      const downloadedInfo = await FileSystem.getInfoAsync(localUri);
      if (totalExpectedBytes > 0 && downloadedInfo.exists && 'size' in downloadedInfo && downloadedInfo.size) {
        if (downloadedInfo.size < totalExpectedBytes * 0.95) {
          await FileSystem.deleteAsync(localUri, { idempotent: true });
          throw new Error(`Download incomplete (${downloadedInfo.size} of ${totalExpectedBytes} bytes written)`);
        }
      }

      // Validate magic byte header
      const isValid = await this.validateBookFile(localUri);
      if (!isValid) {
        await FileSystem.deleteAsync(localUri, { idempotent: true });
        throw new Error('Downloaded file failed magic byte validation (%PDF- or PK\\x03\\x04 missing)');
      }

      return result.uri;
    } catch (e) {
      const partialInfo = await FileSystem.getInfoAsync(localUri);
      if (partialInfo.exists) {
        await FileSystem.deleteAsync(localUri, { idempotent: true });
      }
      throw e;
    }
  }

  async getLocalBookPath(bookId: string, remoteUrl?: string): Promise<string | null> {
    await this.ensureDirectoryExists();
    const expectedExt = remoteUrl ? this.getExtension(remoteUrl) : null;
    const epubUri = this.DOWNLOAD_DIR + bookId + '.epub';
    const pdfUri = this.DOWNLOAD_DIR + bookId + '.pdf';
    
    if (expectedExt === '.epub') {
      // Purge stale PDF cache if book format switched to EPUB
      const pdfInfo = await FileSystem.getInfoAsync(pdfUri);
      if (pdfInfo.exists) {
        console.warn(`[BookDownloadService] Purging stale PDF cache for ${bookId} because expected format is EPUB`);
        await FileSystem.deleteAsync(pdfUri, { idempotent: true });
      }

      const epubInfo = await FileSystem.getInfoAsync(epubUri);
      if (epubInfo.exists) {
        const isValid = await this.validateBookFile(epubUri);
        if (isValid) {
          return epubUri;
        }
        console.warn(`[BookDownloadService] Corrupted/invalid EPUB detected for ${bookId}, deleting cache...`);
        await FileSystem.deleteAsync(epubUri, { idempotent: true });
      }
      return null;
    }

    if (expectedExt === '.pdf') {
      // Purge stale EPUB cache if book format switched to PDF
      const epubInfo = await FileSystem.getInfoAsync(epubUri);
      if (epubInfo.exists) {
        console.warn(`[BookDownloadService] Purging stale EPUB cache for ${bookId} because expected format is PDF`);
        await FileSystem.deleteAsync(epubUri, { idempotent: true });
      }

      const pdfInfo = await FileSystem.getInfoAsync(pdfUri);
      if (pdfInfo.exists) {
        const isValid = await this.validateBookFile(pdfUri);
        if (isValid) {
          return pdfUri;
        }
        console.warn(`[BookDownloadService] Corrupted/invalid PDF detected for ${bookId}, deleting cache...`);
        await FileSystem.deleteAsync(pdfUri, { idempotent: true });
      }
      return null;
    }

    // Fallback if no remoteUrl extension provided
    const epubInfo = await FileSystem.getInfoAsync(epubUri);
    if (epubInfo.exists) {
      const isValid = await this.validateBookFile(epubUri);
      if (isValid) {
        return epubUri;
      }
      console.warn(`[BookDownloadService] Corrupted/invalid EPUB detected for ${bookId}, deleting cache...`);
      await FileSystem.deleteAsync(epubUri, { idempotent: true });
    }

    const pdfInfo = await FileSystem.getInfoAsync(pdfUri);
    if (pdfInfo.exists) {
      const isValid = await this.validateBookFile(pdfUri);
      if (isValid) {
        return pdfUri;
      }
      console.warn(`[BookDownloadService] Corrupted/invalid PDF detected for ${bookId}, deleting cache...`);
      await FileSystem.deleteAsync(pdfUri, { idempotent: true });
    }

    return null;
  }

  async deleteBook(bookId: string): Promise<void> {
    await FileSystem.deleteAsync(this.DOWNLOAD_DIR + bookId + '.epub', { idempotent: true });
    await FileSystem.deleteAsync(this.DOWNLOAD_DIR + bookId + '.pdf', { idempotent: true });
  }

  async getDownloadedBooks(): Promise<string[]> {
    await this.ensureDirectoryExists();
    const files = await FileSystem.readDirectoryAsync(this.DOWNLOAD_DIR);
    return files
      .filter((file) => file.endsWith('.epub') || file.endsWith('.pdf'))
      .map((file) => file.replace(/\.(epub|pdf)$/, ''));
  }

  async getStorageUsed(): Promise<number> {
    await this.ensureDirectoryExists();
    const files = await FileSystem.readDirectoryAsync(this.DOWNLOAD_DIR);
    let totalSize = 0;
    
    for (const file of files) {
      if (file.endsWith('.epub') || file.endsWith('.pdf')) {
        const fileInfo = await FileSystem.getInfoAsync(this.DOWNLOAD_DIR + file);
        if (fileInfo.exists && !fileInfo.isDirectory && fileInfo.size) {
          totalSize += fileInfo.size;
        }
      }
    }
    return totalSize;
  }
}

export const bookDownloadService = new BookDownloadService();
