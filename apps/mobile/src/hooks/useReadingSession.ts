import { useEffect, useRef, useState, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { readingSync } from '../services/readingSync';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UseReadingSessionReturn {
  /** The current page number (0-indexed or as sent by epubjs) */
  currentPage: number;
  /** Reading progress percentage (0–100) */
  progressPercent: number;
  /** Total seconds spent reading this session */
  readingTimeSeconds: number;
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

/**
 * Manages the full lifecycle of a reading session for a single book.
 *
 * - Initialises ReadingSync on mount, tears it down on unmount.
 * - Calls stopSession when the app is backgrounded so the final state
 *   is flushed to the server immediately.
 * - Resumes time tracking when the app returns to the foreground.
 * - Listens for network recovery and retries any pending offline syncs.
 * - Exposes reactive state (currentPage, progressPercent) that drives the UI.
 */
export function useReadingSession(bookId: string): UseReadingSessionReturn {
  const [currentPage, setCurrentPage] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [readingTimeSeconds, setReadingTimeSeconds] = useState(0);
  const [initialCfi, setInitialCfi] = useState('');

  // Track whether we were previously offline so we only retry on transition
  const wasOfflineRef = useRef(false);
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

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const isConnected = state.isConnected && state.isInternetReachable !== false;

      if (!isConnected) {
        wasOfflineRef.current = true;
      } else if (wasOfflineRef.current && isConnected) {
        // Transitioned from offline → online: retry pending queue
        wasOfflineRef.current = false;
        readingSync.retryPendingSyncs().catch((err) =>
          console.warn('[useReadingSession] retryPendingSyncs failed:', err)
        );
      }
    });

    return () => unsubscribe();
  }, []);

  // ── Reading time ticker ─────────────────────────────────────────────────────

  useEffect(() => {
    // Update displayed reading time every second
    const ticker = setInterval(() => {
      setReadingTimeSeconds((prev) => prev + 1);
    }, 1_000);

    // Pause ticker when app is backgrounded
    const handleAppStateForTicker = (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        // nothing — ticker runs while active
      }
    };

    const sub = AppState.addEventListener('change', handleAppStateForTicker);

    return () => {
      clearInterval(ticker);
      sub.remove();
    };
  }, []);

  // ── updateProgress (exposed to consumer) ────────────────────────────────────

  const updateProgress = useCallback(
    (page: number, cfi: string, percent?: number) => {
      setCurrentPage(page);
      if (percent !== undefined) {
        setProgressPercent(percent);
      }

      // Persist to SQLite and mark dirty
      readingSync.updateLocalProgress(page, cfi).catch((err) =>
        console.warn('[useReadingSession] updateLocalProgress failed:', err)
      );

      if (percent !== undefined) {
        readingSync.updateProgressPercent(percent).catch((err) =>
          console.warn('[useReadingSession] updateProgressPercent failed:', err)
        );
      }
    },
    []
  );

  return {
    currentPage,
    progressPercent,
    readingTimeSeconds,
    initialCfi,
    updateProgress,
  };
}
