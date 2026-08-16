/**
 * Builds a browser-addressable URL for an R2 cover object.
 *
 * R2 `cover_key` values are object keys (e.g. "covers/abc123.png"), NOT public
 * URLs. The web worker serves them via the `/covers/[...key]` route handler,
 * which streams the object from the `BUKOO_STORAGE` binding.
 *
 * Returns an empty string when no key is present so callers can fall back to
 * a placeholder image.
 */
export function getCoverUrl(coverKey?: string | null): string {
  if (!coverKey) return '';
  return `/covers/${coverKey}`;
}
