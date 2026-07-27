import * as FileSystem from 'expo-file-system/legacy';

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

  async downloadBook(
    bookId: string, 
    remoteUrl: string, 
    onProgress?: (percent: number) => void
  ): Promise<string> {
    await this.ensureDirectoryExists();
    const ext = this.getExtension(remoteUrl);
    const localUri = this.DOWNLOAD_DIR + bookId + ext;

    const fileInfo = await FileSystem.getInfoAsync(localUri);
    if (fileInfo.exists) {
      if (fileInfo.size && fileInfo.size < 1000) {
        await FileSystem.deleteAsync(localUri, { idempotent: true });
      } else {
        if (onProgress) onProgress(100);
        return localUri;
      }
    }

    const downloadResumable = FileSystem.createDownloadResumable(
      remoteUrl,
      localUri,
      {},
      (downloadProgress) => {
        if (downloadProgress.totalBytesExpectedToWrite > 0) {
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
      return result.uri;
    } catch (e) {
      const partialInfo = await FileSystem.getInfoAsync(localUri);
      if (partialInfo.exists) {
         await FileSystem.deleteAsync(localUri, { idempotent: true });
      }
      throw e;
    }
  }

  async getLocalBookPath(bookId: string): Promise<string | null> {
    const epubUri = this.DOWNLOAD_DIR + bookId + '.epub';
    const pdfUri = this.DOWNLOAD_DIR + bookId + '.pdf';
    
    const epubInfo = await FileSystem.getInfoAsync(epubUri);
    if (epubInfo.exists) {
      if (epubInfo.size && epubInfo.size < 1000) {
        await FileSystem.deleteAsync(epubUri, { idempotent: true });
      } else {
        return epubUri;
      }
    }

    const pdfInfo = await FileSystem.getInfoAsync(pdfUri);
    if (pdfInfo.exists) {
      if (pdfInfo.size && pdfInfo.size < 1000) {
        await FileSystem.deleteAsync(pdfUri, { idempotent: true });
      } else {
        return pdfUri;
      }
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
