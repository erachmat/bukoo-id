/**
 * A/B feature-flag service backed by Firebase Remote Config.
 *
 * Every flag has a LOCAL DEFAULT so the app works correctly even when:
 *  - Firebase isn't configured yet (dev / Expo Go / before google-services.json)
 *  - the device is offline
 *  - fetch/activate fails
 *
 * Flow:
 *   App.tsx calls `initFeatureFlags()` once on startup (fire-and-forget).
 *   It sets local defaults, then fetch+activates the latest values from
 *   Remote Config (respecting Firebase A/B experiment assignments).
 *   Screens read flags via `useFeatureFlag('home_layout')` etc. — the zustand
 *   store re-renders subscribers the moment activate() lands.
 */

import { create } from 'zustand';
import {
  getRemoteConfig,
  fetchAndActivate,
  getValue,
} from '@react-native-firebase/remote-config';

/**
 * Flag registry. Add new A/B experiments here (key + allowed values + default).
 * Values must be strings — Remote Config treats everything as strings.
 */
export const FEATURE_FLAGS = {
  /** Home screen trending section: horizontal carousel vs 2-column grid. */
  home_layout: {
    default: 'carousel' as 'carousel' | 'grid',
    values: ['carousel', 'grid'] as const,
  },
  /** Subscription screen default billing cycle. */
  pricing_display: {
    default: 'monthly_first' as 'monthly_first' | 'yearly_first',
    values: ['monthly_first', 'yearly_first'] as const,
  },
  /**
   * Future: onboarding flow variant. No onboarding screen exists yet —
   * flag defined now so experiments can be added without a code change later.
   */
  onboarding_flow: {
    default: 'full' as 'full' | 'short',
    values: ['full', 'short'] as const,
  },
} as const;

export type FeatureFlagKey = keyof typeof FEATURE_FLAGS;
export type FeatureFlagValue<K extends FeatureFlagKey> =
  (typeof FEATURE_FLAGS)[K]['default'];

type FlagsState = {
  flags: Record<FeatureFlagKey, string>;
  ready: boolean;
  setFlag: (key: FeatureFlagKey, value: string) => void;
  setReady: (ready: boolean) => void;
};

export const useFeatureFlagsStore = create<FlagsState>((set) => ({
  flags: Object.fromEntries(
    Object.entries(FEATURE_FLAGS).map(([key, def]) => [key, def.default])
  ) as Record<FeatureFlagKey, string>,
  ready: false,
  setFlag: (key, value) =>
    set((state) => ({ flags: { ...state.flags, [key]: value } })),
  setReady: (ready) => set({ ready }),
}));

let initialized = false;

/**
 * Initialize Remote Config: set local defaults, then fetch+activate.
 * Never throws — on any failure the app keeps running on local defaults.
 * Idempotent — safe to call from multiple places.
 */
export async function initFeatureFlags(): Promise<void> {
  if (initialized) return;
  initialized = true;

  const store = useFeatureFlagsStore.getState();

  // 1. Publish local defaults immediately so reads never see undefined.
  store.setReady(true);

  try {
    const rc = getRemoteConfig();
    const activated = await fetchAndActivate(rc);

    // 2. Read every known flag and publish to the store.
    for (const key of Object.keys(FEATURE_FLAGS) as FeatureFlagKey[]) {
      const raw = getValue(rc, key).asString();
      const allowed = FEATURE_FLAGS[key].values as readonly string[];
      // Guard against unknown/typo'd remote values — fall back to default.
      if (allowed.includes(raw)) {
        store.setFlag(key, raw);
      }
    }
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log(`[featureFlags] Remote Config ${activated ? 'activated' : 'no update'}`);
    }
  } catch (err) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn('[featureFlags] Remote Config unavailable, using defaults', err);
    }
    // keep local defaults — app still fully works
  }
}

/**
 * Read the current value of a flag (safe default if not yet fetched).
 */
export function getFeatureFlag<K extends FeatureFlagKey>(key: K): FeatureFlagValue<K> {
  const value = useFeatureFlagsStore.getState().flags[key];
  const allowed = FEATURE_FLAGS[key].values as readonly string[];
  return (allowed.includes(value) ? value : FEATURE_FLAGS[key].default) as FeatureFlagValue<K>;
}
