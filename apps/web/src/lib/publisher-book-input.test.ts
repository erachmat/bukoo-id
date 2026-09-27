import { describe, expect, it } from 'vitest';
import { catalogFingerprint, normalizeBookIsbn, parsePublisherBookFields, reviewRequirements } from './publisher-book-input';

describe('publisher book input', () => {
  it('normalizes spacing, case, and Unicode for duplicate identity', () => {
    expect(catalogFingerprint('  Laut   Bercerita ', 'LAILA')).toBe(catalogFingerprint('laut bercerita', 'laila'));
    expect(normalizeBookIsbn('978-602-1234-56-7')).toBe('9786021234567');
  });

  it('allows a minimal draft and reports requirements before review', () => {
    const input = new FormData();
    input.set('title', 'Buku Baru');
    input.set('author', 'Penulis');
    const draft = parsePublisherBookFields(input);
    expect(draft.catalogFingerprint).toBe(catalogFingerprint('Buku Baru', 'Penulis'));
    expect(reviewRequirements({ description: null, genre: '[]', coverKey: null, epubKey: null })).toEqual(['sinopsis', 'kategori', 'cover', 'file EPUB/PDF']);
  });

  it('rejects malformed ISBN and invalid metadata', () => {
    expect(() => normalizeBookIsbn('abc')).toThrow('ISBN');
    const input = new FormData();
    input.set('title', 'Buku');
    input.set('author', 'Penulis');
    input.set('year', '1890');
    expect(() => parsePublisherBookFields(input)).toThrow('Tahun terbit');
  });
});
