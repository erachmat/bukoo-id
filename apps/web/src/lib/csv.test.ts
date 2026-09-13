import { describe, expect, it } from 'vitest';
import { csvEscape, toCsv, csvResponseHeaders } from '@/lib/csv';

describe('csv utility', () => {
  it('escapes values with commas, quotes, and newlines', () => {
    expect(csvEscape('hello')).toBe('hello');
    expect(csvEscape('hello, world')).toBe('"hello, world"');
    expect(csvEscape('he said "hi"')).toBe('"he said ""hi"""');
    expect(csvEscape('line1\nline2')).toBe('"line1\nline2"');
    expect(csvEscape('  spaced  ')).toBe('"  spaced  "');
    expect(csvEscape(null)).toBe('');
    expect(csvEscape(undefined)).toBe('');
    expect(csvEscape(123)).toBe('123');
  });

  it('builds RFC-4180 CSV with UTF-8 BOM and CRLF', () => {
    const csv = toCsv(['Name', 'Value'], [['A', 1], ['B, C', 2]]);
    expect(csv.charCodeAt(0)).toBe(0xFEFF); // UTF-8 BOM
    expect(csv).toContain('\r\n');
    expect(csv).toContain('Name,Value');
    expect(csv).toContain('A,1');
    expect(csv).toContain('"B, C",2');
  });

  it('generates correct attachment headers', () => {
    const headers = csvResponseHeaders('test.csv');
    expect(headers.get('Content-Type')).toBe('text/csv; charset=utf-8');
    expect(headers.get('Content-Disposition')).toBe('attachment; filename="test.csv"');
    expect(headers.get('Cache-Control')).toBe('no-store');
  });
});