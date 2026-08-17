import {
  getCrashlytics,
  setCrashlyticsCollectionEnabled,
  recordError,
  log,
} from '@react-native-firebase/crashlytics';

/**
 * Firebase Crashlytics wrapper (modular API).
 *
 * Collection is enabled by default on release builds. In __DEV__ we explicitly
 * disable it (per Firebase best practice) so dev crashes don't pollute the
 * dashboard; a separate `initCrashReporting()` call enables it for pre-release
 * test builds (Firebase App Distribution / TestFlight) where we WANT crashes.
 */
let devOverrideSet = false;

export function initCrashReporting(): void {
  if (__DEV__) {
    if (!devOverrideSet) {
      setCrashlyticsCollectionEnabled(getCrashlytics(), false);
      devOverrideSet = true;
    }
    return;
  }
  // Production: collection is on by default via the config plugin.
  // For internal test builds you can flip this to true via a build-time flag.
}

/**
 * Log a recoverable error to Crashlytics without crashing the app.
 * Use for caught exceptions that we still want on the dashboard.
 */
export function reportError(error: unknown, context?: string): void {
  try {
    const crashlytics = getCrashlytics();
    if (context) log(crashlytics, context);
    recordError(
      crashlytics,
      error instanceof Error ? error : new Error(String(error))
    );
  } catch {
    // Crashlytics itself must never break app flow.
  }
}
