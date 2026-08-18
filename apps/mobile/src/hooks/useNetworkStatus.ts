import { useNetworkStore } from '../stores/networkStore';

export interface UseNetworkStatusReturn {
  isOffline: boolean;
  justReconnected: boolean;
  pendingSyncCount: number;
}

/**
 * Thin selector over the shared network store. The single NetInfo listener is
 * mounted app-wide in App.tsx (initNetworkListener) — this hook only reads it.
 */
export function useNetworkStatus(): UseNetworkStatusReturn {
  const isOffline = useNetworkStore((s) => s.isOffline);
  const justReconnected = useNetworkStore((s) => s.justReconnected);
  const pendingSyncCount = useNetworkStore((s) => s.pendingSyncCount);

  return { isOffline, justReconnected, pendingSyncCount };
}

