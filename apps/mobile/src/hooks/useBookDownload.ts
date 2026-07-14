import { useState, useEffect, useCallback } from 'react';
import { bookDownloadService } from '../services/bookDownload';

export function useBookDownload(bookId: string) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [localUri, setLocalUri] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const checkLocalFile = async () => {
      const path = await bookDownloadService.getLocalBookPath(bookId);
      if (isMounted) {
        setLocalUri(path);
      }
    };
    
    checkLocalFile();
    return () => {
      isMounted = false;
    };
  }, [bookId]);

  const download = useCallback(async (remoteUrl: string) => {
    setIsDownloading(true);
    setDownloadProgress(0);
    
    try {
      const path = await bookDownloadService.downloadBook(bookId, remoteUrl, (percent) => {
        setDownloadProgress(percent);
      });
      setLocalUri(path);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  }, [bookId]);

  const remove = useCallback(async () => {
    try {
      await bookDownloadService.deleteBook(bookId);
      setLocalUri(null);
    } catch (error) {
      console.error('Delete failed:', error);
    }
  }, [bookId]);

  return {
    download,
    remove,
    isDownloading,
    downloadProgress,
    localUri,
    isDownloaded: !!localUri,
  };
}
