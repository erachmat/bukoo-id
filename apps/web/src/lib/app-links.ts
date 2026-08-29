/**
 * Single source of truth for mobile app links.
 *
 * ⚠️ PLACEHOLDER URLs — replace with the real store listings when available.
 */
export const APP_STORE_URL =
  "https://apps.apple.com/app/bukoo" // TODO(user): real App Store URL

export const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.erachmat.bukoo" // TODO(user): verify package id

/** Deep link into a specific book inside the mobile app (fallback: store). */
export function bookDeepLink(bookId: string): string {
  return `bukoo://book/${bookId}`
}
