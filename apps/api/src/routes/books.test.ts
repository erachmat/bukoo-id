import { describe, expect, it } from 'vitest';
import { uniqueBookRows } from './books.js';

describe('publisher book search result uniqueness', () => {
  it('keeps one result per book when the FTS index contains duplicate rows', () => {
    const results = uniqueBookRows([
      { id: 'book-a', title: 'Buku A', rank: -2 },
      { id: 'book-a', title: 'Buku A', rank: -1 },
      { id: 'book-b', title: 'Buku B', rank: -3 },
    ]);

    expect(results).toEqual([
      { id: 'book-a', title: 'Buku A', rank: -2 },
      { id: 'book-b', title: 'Buku B', rank: -3 },
    ]);
  });
});
