import { useEffect, useRef, useState, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { readingSync } from '../services/readingSync';
import { readingGoalService } from '../services/readingGoalService';
import { notificationService } from '../services/notificationService';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UseReadingSessionReturn {
  /** The current page number (0-indexed or as sent by epubjs) */
  currentPage: number;
  /** Reading progress percentage (0–100) */
  progressPercent: number;
  /** Total seconds spent reading this session */
  readingTimeSeconds: number;
  /** True when the daily reading goal has been achieved during this session */
  isGoalAchieved: boolean;
  /** Dismiss celebration banner */
  dismissGoalBanner: () => void;
  /**
   * The CFI position where the user left off, loaded from local SQLite on mount.
   * Empty string when there is no saved position (first open).
   */
  initialCfi: string;
  /**
   * Call this every time the reader reports a new page / CFI position.
   * Updates local SQLite immediately and accumulates the sync queue.
   */
  updateProgress: (page: number, cfi: string, percent?: number) => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useReadingSession(bookId: string, isReady: boolean = true): UseReadingSessionReturn {
  const [currentPage, setCurrentPage] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [readingTimeSeconds, setReadingTimeSeconds] = useState(0);
  const [initialCfi, setInitialCfi] = useState('');
  const [isGoalAchieved, setIsGoalAchieved] = useState(false);

  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  // ── Bootstrap / teardown ────────────────────────────────────────────────────

  useEffect(() => {
    if (!bookId) return;

    // Load existing local progress to seed initial state
    readingSync.getLocalProgress(bookId).then((saved) => {
      if (saved) {
        setCurrentPage(saved.currentPage);
        setProgressPercent(saved.progressPercent);
        setReadingTimeSeconds(saved.readingTimeSeconds);
        if (saved.cfiPosition) setInitialCfi(saved.cfiPosition);
      }
    });

    // Start the 30s sync interval
    readingSync.startSession(bookId);

    return () => {
      // Teardown: flush immediately (stopSession handles interval clearing)
      readingSync.stopSession().catch((err) => {
        if ((err as { response?: { status?: number } })?.response?.status !== 404) {
          console.warn('[useReadingSession] stopSession on unmount failed:', err);
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId]);

  // ── AppState (background / foreground) ──────────────────────────────────────

  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      const prevState = appStateRef.current;
      appStateRef.current = nextState;

      const isGoingToBackground =
        prevState === 'active' && (nextState === 'background' || nextState === 'inactive');
      const isComingToForeground =
        (prevState === 'background' || prevState === 'inactive') && nextState === 'active';

      if (isGoingToBackground) {
        // Pause time accumulation and force-flush to server
        readingSync.pauseTimeTracking();
        readingSync.stopSession().catch((err) => {
          if ((err as { response?: { status?: number } })?.response?.status !== 404) {
            console.warn('[useReadingSession] stopSession on background failed:', err);
          }
        });
      } else if (isComingToForeground) {
        // Re-start the session (restores 30s interval and time tracking)
        readingSync.startSession(bookId);
        readingSync.resumeTimeTracking();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [bookId]);

  // ── Network recovery ────────────────────────────────────────────────────────
  //
  // Reconnect retries are handled centrally by the app-wide network store
  // (stores/networkStore.ts) — no per-session NetInfo listener here.

  // ── Reading time ticker ─────────────────────────────────────────────────────

  useEffect(() => {
    // Only count time while the reader is actually ready (book loaded) AND the
    // app is in the foreground. Loading, location generation, load failures, and
    // backgrounding must not inflate the displayed reading time.
    let intervalHandle: ReturnType<typeof setInterval> | null = null;

    const startTicker = () => {
      if (intervalHandle) return;
      intervalHandle = setInterval(() => {
        setReadingTimeSeconds((prev) => prev + 1);
        readingGoalService.recordReadingTime(1).then(({ isGoalAchievedNow }) => {
          if (isGoalAchievedNow) {
            setIsGoalAchieved(true);
            // Feed the in-app notification center with a real event.
            notificationService
              .addNotification({
                title: '🎯 Target Membaca Tercapai!',
                body: 'Kamu mencapai target membaca harian hari ini. Pertahankan streak-mu!',
                type: 'streak',
              })
              .catch(() => {});
          }
        });
      }, 1_000);
    };

    const stopTicker = () => {
      if (intervalHandle) {
        clearInterval(intervalHandle);
        intervalHandle = null;
      }
    };

    if (isReady && appStateRef.current === 'active') {
      startTicker();
    }

    const handleAppStateForTicker = (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        if (isReady) startTicker();
      } else {
        stopTicker();
      }
    };

    const sub = AppState.addEventListener('change', handleAppStateForTicker);

    return () => {
      stopTicker();
      sub.remove();
    };
  }, [isReady]);

  // ── updateProgress (exposed to consumer) ────────────────────────────────────

  const updateProgress = useCallback(
    (page: number, cfi: string, percent?: number) => {
      setCurrentPage(page);
      if (percent !== undefined) {
        setProgressPercent(percent);
      }

      readingSync.updateLocalProgress(page, cfi, percent).catch((err) =>
        console.warn('[useReadingSession] updateLocalProgress failed:', err)
      );
    },
    []
  );

  const dismissGoalBanner = useCallback(() => {
    setIsGoalAchieved(false);
  }, []);

  return {
    currentPage,
    progressPercent,
    readingTimeSeconds,
    isGoalAchieved,
    dismissGoalBanner,
    initialCfi,
    updateProgress,
  };
}
