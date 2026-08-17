import { useFeatureFlagsStore } from '../services/featureFlags';
import type { FeatureFlagKey, FeatureFlagValue } from '../services/featureFlags';

/**
 * React hook: subscribe to a single A/B flag.
 * Re-renders the component when the value changes (e.g. Remote Config
 * activate() lands mid-session). Returns the flag's current value.
 */
export function useFeatureFlag<K extends FeatureFlagKey>(key: K): FeatureFlagValue<K> {
  // Subscribe to the whole flags record; selector picks the key we want.
  // zustand re-renders subscribers whose selected slice changed.
  return useFeatureFlagsStore((state) => state.flags[key] as FeatureFlagValue<K>);
}

/**
 * React hook: is the feature-flag system ready (defaults applied)?
 * Useful for showing a non-blocking "loading variants" state if desired.
 */
export function useFeatureFlagsReady(): boolean {
  return useFeatureFlagsStore((state) => state.ready);
}
