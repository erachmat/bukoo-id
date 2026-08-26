import { GoogleSignin } from '@react-native-google-signin/google-signin';

/**
 * Google Sign-In configuration.
 *
 * This lives in a lazy, idempotent, guarded function (NOT at module scope) so
 * that importing this file can never crash the app — `GoogleSignin.configure()`
 * throws in Expo Go, where the native module is not bundled. Call
 * `configureGoogleSignIn()` right before any Google Sign-In / sign-out call.
 *
 * NOTE: `webClientId` must be the SERVER client ID (client_type 3) of the
 * Android Firebase project that owns google-services.json — here project
 * `bukoo-15ce3` (576187863248). That file's Android OAuth client carries the
 * release keystore SHA-1 that Google Play App Signing will use. Do NOT swap
 * this for the web project's client id (17547501035-...) — that breaks
 * native Google Sign-In in release builds.
 */
const GOOGLE_WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ||
  '576187863248-9voo043m0bm915b8g6b0k1m5ios9qai2.apps.googleusercontent.com';

let googleConfigured = false;

/**
 * Idempotent + guarded: safe to call from both login and logout paths.
 * In Expo Go (or any build without the native module) this silently no-ops
 * and Google Sign-In simply reports an error to the user instead of crashing.
 */
export function configureGoogleSignIn(): void {
  if (googleConfigured) return;
  try {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      offlineAccess: true,
    });
    googleConfigured = true;
  } catch {
    // Native module unavailable (Expo Go) — Google Sign-In disabled gracefully.
  }
}
