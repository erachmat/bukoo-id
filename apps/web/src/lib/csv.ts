/**
 * Minimal RFC-4180 CSV builder for publisher exports.
 *Excel-friendly: UTF-8 BOM handled by the caller embedding "\uFEFF" first.
 */
export function csvEscape(value: unknown): string {
  const raw = value === null || value === undefined ? '' : String(value);
  // Quote when the value contains a delimiter, quote, newline, or leading/trailing space.
  if (/[",\n\r]/.test(raw) || raw !== raw.trim()) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
}

export function toCsv(headers: string[], rows: unknown[][]): string {
  const lines = [
    headers.map(csvEscape).join(','),
    ...rows.map((row) => row.map(csvEscape).join(',')),
  ];
  return `\uFEFF${lines.join('\r\n')}\r\n`;
}

/** Attachment headers for a CSV download. */
export function csvResponseHeaders(filename: string): Headers {
  const headers = new Headers();
  headers.set('Content-Type', 'text/csv; charset=utf-8');
  headers.set('Content-Disposition', `attachment; filename="${filename}"`);
  headers.set('Cache-Control', 'no-store');
  return headers;
}
