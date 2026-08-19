/** R2 cover keys are not public URLs — the web worker serves them at /covers/<key>. */
export function buildCoverUrl(coverKey: string | null): string | null {
  return coverKey ? `https://bukoo.id/covers/${coverKey}` : null;
}
