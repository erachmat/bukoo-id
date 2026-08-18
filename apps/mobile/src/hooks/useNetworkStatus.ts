import { useState, useEffect, useRef } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { readingSync } from '../services/readingSync';

export interface UseNetworkStatusReturn {
  isOffline: boolean;
  justReconnected: boolean;
  pendingSyncCount: number;
}

export function useNetworkStatus(): UseNetworkStatusReturn {
  const [isOffline, setIsOffline] = useState(false);
  const [justReconnected, setJustReconnected] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  const wasOfflineRef = useRef(false);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const checkSyncCount = async () => {
      try {
        const count = await readingSync.getPendingSyncCount();
        setPendingSyncCount(count);
      } catch {
        setPendingSyncCount(0);
      }
    };

    checkSyncCount();

    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const isConnected = !!(state.isConnected && state.isInternetReachable !== false);

      if (!isConnected) {
        setIsOffline(true);
        wasOfflineRef.current = true;
        checkSyncCount();
      } else {
        setIsOffline(false);

        if (wasOfflineRef.current) {
          wasOfflineRef.current = false;
          setJustReconnected(true);

          // Retry pending syncs
          readingSync.retryPendingSyncs().then(() => checkSyncCount()).catch(() => {});

          if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
          reconnectTimerRef.current = setTimeout(() => {
            setJustReconnected(false);
          }, 3500);
        }
      }
    });

    return () => {
      unsubscribe();
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    };
  }, []);

  return {
    isOffline,
    justReconnected,
    pendingSyncCount,
  };
}
