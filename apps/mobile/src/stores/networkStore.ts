import { create } from 'zustand';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { readingSync } from '../services/readingSync';

interface NetworkState {
  isOffline: boolean;
  justReconnected: boolean;
  pendingSyncCount: number;
}

/**
 * Single source of truth for connectivity state. Exactly ONE NetInfo listener
 * is mounted app-wide (via initNetworkListener in App.tsx); every consumer
 * (offline banner, reading session, …) reads from this store instead of
 * registering its own listener. This fixes duplicate listeners firing
 * uncoordinated retry loops.
 */
export const useNetworkStore = create<NetworkState>(() => ({
  isOffline: false,
  justReconnected: false,
  pendingSyncCount: 0,
}));

let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let listenerStarted = false;

async function refreshPendingSyncCount(): Promise<void> {
  try {
    // Count both queued syncs AND dirty-but-unqueued progress rows.
    const count = await readingSync.getUnsyncedCount();
    useNetworkStore.setState({ pendingSyncCount: count });
  } catch {
    useNetworkStore.setState({ pendingSyncCount: 0 });
  }
}

/**
 * Mounts the app-wide NetInfo listener. Returns an unsubscribe function.
 * Safe to call multiple times — only the first call registers a listener.
 */
export function initNetworkListener(): () => void {
  if (listenerStarted) return () => {};
  listenerStarted = true;

  let wasOffline = false;

  const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
    const isConnected = !!(state.isConnected && state.isInternetReachable !== false);

    if (!isConnected) {
      wasOffline = true;
      useNetworkStore.setState({ isOffline: true });
      refreshPendingSyncCount();
    } else {
      useNetworkStore.setState({ isOffline: false });

      if (wasOffline) {
        wasOffline = false;
        useNetworkStore.setState({ justReconnected: true });

        // Retry the pending queue once, then refresh the banner count.
        readingSync.retryPendingSyncs().then(refreshPendingSyncCount).catch(() => {});

        if (reconnectTimer) clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(() => {
          useNetworkStore.setState({ justReconnected: false });
        }, 3500);
      }
    }
  });

  // Seed the initial pending count.
  refreshPendingSyncCount();

  return () => {
    unsubscribe();
    if (reconnectTimer) clearTimeout(reconnectTimer);
    listenerStarted = false;
  };
}
