import { describe, expect, it } from 'vitest';
import { filterAndSortBooks, paginateBooks } from './catalog-filter';

const books = [
  { title: 'Zeta', author: 'Ayu', subscriptionRequired: 'PREMIUM', language: 'ID', readCount: 2, updatedAt: '2026-08-02', isPublished: true, publicationStatus: 'PUBLISHED' },
  { title: 'Alpha', author: 'Bima', subscriptionRequired: 'FREE', language: 'EN', readCount: 8, updatedAt: '2026-08-03', isPublished: false, publicationStatus: 'IN_REVIEW' },
  { title: 'Beta', author: 'Citra', subscriptionRequired: 'FREE', language: 'ID', readCount: 4, updatedAt: null, isPublished: false, publicationStatus: 'UNPUBLISHED' },
];

describe('catalog filtering', () => {
  it('searches title and author case-insensitively', () => {
    expect(filterAndSortBooks(books, { q: 'BIMA' }).map((book) => book.title)).toEqual(['Alpha']);
    expect(filterAndSortBooks(books, { q: 'ayu' }).map((book) => book.title)).toEqual(['Zeta']);
  });

  it('filters status, access, and language', () => {
    expect(filterAndSortBooks(books, { status: 'published' }).map((book) => book.title)).toEqual(['Zeta']);
    expect(filterAndSortBooks(books, { status: 'unpublished' }).map((book) => book.title)).toEqual(['Beta']);
    expect(filterAndSortBooks(books, { access: 'FREE', language: 'ID' }).map((book) => book.title)).toEqual(['Beta']);
  });

  it('sorts by title, reads, and most recently updated', () => {
    expect(filterAndSortBooks(books, { sort: 'title' }).map((book) => book.title)).toEqual(['Alpha', 'Beta', 'Zeta']);
    expect(filterAndSortBooks(books, { sort: 'reads' }).map((book) => book.title)).toEqual(['Alpha', 'Beta', 'Zeta']);
    expect(filterAndSortBooks(books, { sort: 'updated' }).map((book) => book.title)).toEqual(['Alpha', 'Zeta', 'Beta']);
  });

  it('paginates and clamps invalid page values', () => {
    expect(paginateBooks(Array.from({ length: 21 }, (_, index) => index), 2, 10)).toEqual({ items: Array.from({ length: 10 }, (_, index) => index + 10), totalPages: 3, page: 2 });
    expect(paginateBooks([1, 2], 9, 10)).toEqual({ items: [1, 2], totalPages: 1, page: 1 });
    expect(paginateBooks([], 0, 10)).toEqual({ items: [], totalPages: 1, page: 1 });
  });
});
