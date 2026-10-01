import { useEffect, useRef, useState, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { readingSync } from '../services/readingSync';
import { readingGoalService } from '../services/readingGoalService';
import { notificationService } from '../services/notificationService';
import type { VisibleWordRange } from '../services/readingCoverage';

export interface ReadingManifest {
  contentVersion: string;
  totalWords: number;
  wordsPerBlock: number;
}

export interface UseReadingSessionReturn {
  currentPage: number;
  progressPercent: number;
  readingTimeSeconds: number;
  isGoalAchieved: boolean;
  dismissGoalBanner: () => void;
  initialCfi: string;
  updateProgress: (page: number, cfi: string) => void;
  updateVisibleCoverage: (ranges: readonly VisibleWordRange[], elapsedMilliseconds: number, visibleWordCount: number) => void;
}

export function useReadingSession(
  bookId: string,
  isReady = true,
  userId: string | null,
  manifest: ReadingManifest | null,
): UseReadingSessionReturn {
  const [currentPage, setCurrentPage] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [readingTimeSeconds, setReadingTimeSeconds] = useState(0);
  const [initialCfi, setInitialCfi] = useState('');
  const [isGoalAchieved, setIsGoalAchieved] = useState(false);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const refreshLocalProgress = useCallback(async () => {
    if (!userId || !manifest) return;
    const saved = await readingSync.getLocalProgress(bookId, userId, manifest.contentVersion);
    if (saved) {
      setCurrentPage(saved.currentPage);
      setProgressPercent(saved.progressPercent);
      setReadingTimeSeconds(saved.readingTimeSeconds);
      setInitialCfi(saved.cfiPosition || '');
    }
  }, [bookId, userId, manifest]);

  useEffect(() => {
    setCurrentPage(0);
    setProgressPercent(0);
    setReadingTimeSeconds(0);
    setInitialCfi('');
    if (!bookId || !userId || !manifest || !isReady) return;
    let cancelled = false;
    readingSync.startSession(userId, bookId, manifest.contentVersion, manifest.totalWords);
    readingSync.getLocalProgress(bookId, userId, manifest.contentVersion).then((saved) => {
      if (cancelled || !saved) return;
      setCurrentPage(saved.currentPage);
      setProgressPercent(saved.progressPercent);
      setReadingTimeSeconds(saved.readingTimeSeconds);
      setInitialCfi(saved.cfiPosition || '');
    });
    return () => {
      cancelled = true;
      readingSync.stopSession(userId).catch((error) => {
        if ((error as { response?: { status?: number } })?.response?.status !== 404) {
          console.warn('[useReadingSession] stopSession on teardown failed:', error);
        }
      });
    };
  }, [bookId, userId, manifest, isReady]);

  useEffect(() => {
    if (!bookId || !userId || !manifest || !isReady) return;
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      const previous = appStateRef.current;
      appStateRef.current = nextState;
      if (previous === 'active' && (nextState === 'background' || nextState === 'inactive')) {
        readingSync.pauseTimeTracking();
        readingSync.syncToServer().catch(() => {});
      } else if ((previous === 'background' || previous === 'inactive') && nextState === 'active') {
        readingSync.resumeTimeTracking();
      }
    });
    return () => subscription.remove();
  }, [bookId, userId, manifest, isReady]);

  useEffect(() => {
    if (!isReady || appStateRef.current !== 'active') return;
    const interval = setInterval(() => {
      setReadingTimeSeconds((previous) => previous + 1);
      if (!userId) return;
      readingGoalService.recordReadingTime(userId, 1).then(({ isGoalAchievedNow }) => {
        if (!isGoalAchievedNow) return;
        setIsGoalAchieved(true);
        notificationService.addNotification({
          title: '🎯 Target Membaca Tercapai!',
          body: 'Kamu mencapai target membaca harian hari ini. Pertahankan streak-mu!',
          type: 'streak',
        }).catch(() => {});
      });
    }, 1_000);
    const subscription = AppState.addEventListener('change', (nextState) => {
      appStateRef.current = nextState;
    });
    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [isReady, userId]);

  const updateProgress = useCallback((page: number, cfi: string) => {
    setCurrentPage(page);
    void readingSync.updateLocalProgress(page, cfi).then(refreshLocalProgress).catch((error) => {
      console.warn('[useReadingSession] updateLocalProgress failed:', error);
    });
  }, [refreshLocalProgress]);

  const updateVisibleCoverage = useCallback((ranges: readonly VisibleWordRange[], elapsedMilliseconds: number, visibleWordCount: number) => {
    void readingSync.updateVisibleCoverage(ranges, elapsedMilliseconds, visibleWordCount).then(refreshLocalProgress).catch((error) => {
      console.warn('[useReadingSession] updateVisibleCoverage failed:', error);
    });
  }, [refreshLocalProgress]);

  const dismissGoalBanner = useCallback(() => setIsGoalAchieved(false), []);

  return {
    currentPage,
    progressPercent,
    readingTimeSeconds,
    isGoalAchieved,
    dismissGoalBanner,
    initialCfi,
    updateProgress,
    updateVisibleCoverage,
  };
}
