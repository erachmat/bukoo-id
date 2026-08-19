/**
 * Builds a device-addressable URL for an R2 cover object.
 *
 * R2 `cover_key` values are object keys (e.g. "covers/abc123.png"), NOT public
 * URLs. The web worker (bukoo.id) serves them via its `/covers/[...key]`
 * route, which streams the object from the `BUKOO_STORAGE` binding — same
 * pattern the API's own `buildCoverUrl` uses.
 *
 * Returns an empty string when no key is present so callers can render
 * nothing / a placeholder instead of a broken image.
 */
export function getCoverUrl(coverKey?: string | null): string {
  if (!coverKey) return '';
  return `https://bukoo.id/covers/${coverKey}`;
}
