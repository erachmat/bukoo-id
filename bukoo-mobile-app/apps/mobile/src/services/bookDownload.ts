import * as FileSystem from 'expo-file-system/legacy';

class BookDownloadService {
  private readonly DOWNLOAD_DIR = FileSystem.documentDirectory + 'books/';

  async ensureDirectoryExists(): Promise<void> {
    const dirInfo = await FileSystem.getInfoAsync(this.DOWNLOAD_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(this.DOWNLOAD_DIR, { intermediates: true });
    }
  }

  async downloadBook(
    bookId: string, 
    remoteUrl: string, 
    onProgress?: (percent: number) => void
  ): Promise<string> {
    await this.ensureDirectoryExists();
    const localUri = this.DOWNLOAD_DIR + bookId + '.epub';

    const fileInfo = await FileSystem.getInfoAsync(localUri);
    if (fileInfo.exists) {
      if (onProgress) onProgress(100);
      return localUri;
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
      return result.uri;
    } catch (e) {
      // Clean up partial file on failure
      const partialInfo = await FileSystem.getInfoAsync(localUri);
      if (partialInfo.exists) {
         await FileSystem.deleteAsync(localUri, { idempotent: true });
      }
      throw e;
    }
  }

  async getLocalBookPath(bookId: string): Promise<string | null> {
    const localUri = this.DOWNLOAD_DIR + bookId + '.epub';
    const fileInfo = await FileSystem.getInfoAsync(localUri);
    return fileInfo.exists ? localUri : null;
  }

  async deleteBook(bookId: string): Promise<void> {
    const localUri = this.DOWNLOAD_DIR + bookId + '.epub';
    await FileSystem.deleteAsync(localUri, { idempotent: true });
  }

  async getDownloadedBooks(): Promise<string[]> {
    await this.ensureDirectoryExists();
    const files = await FileSystem.readDirectoryAsync(this.DOWNLOAD_DIR);
    return files
      .filter((file) => file.endsWith('.epub'))
      .map((file) => file.replace('.epub', ''));
  }

  async getStorageUsed(): Promise<number> {
    await this.ensureDirectoryExists();
    const files = await FileSystem.readDirectoryAsync(this.DOWNLOAD_DIR);
    let totalSize = 0;
    
    for (const file of files) {
      if (file.endsWith('.epub')) {
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
