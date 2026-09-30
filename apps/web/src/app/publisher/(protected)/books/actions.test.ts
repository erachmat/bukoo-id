import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getDb: vi.fn(),
  getPublisherUser: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock('@/lib/db', () => ({ getDb: mocks.getDb }));
vi.mock('@/lib/publisher-auth', () => ({ getPublisherUser: mocks.getPublisherUser }));
vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock('@opennextjs/cloudflare', () => ({ getCloudflareContext: vi.fn() }));

import { books, notifications, publisherSubmissions } from '@bukoo/db';
import { bulkArchivePublisherBooks, restorePublisherBook, submitPublisherBookForReview } from './actions';

type Operation = {
  kind: 'update' | 'insert';
  table: unknown;
  values: Record<string, unknown>;
};

function createTestDb() {
  const operations: Operation[] = [];
  const db = {
    query: {
      books: { findFirst: vi.fn(), findMany: vi.fn() },
      publisherSubmissions: { findFirst: vi.fn() },
    },
    update: vi.fn((table: unknown) => ({
      set: vi.fn((values: Record<string, unknown>) => ({
        where: vi.fn(() => {
          const operation: Operation = { kind: 'update', table, values };
          operations.push(operation);
          return operation;
        }),
      })),
    })),
    insert: vi.fn((table: unknown) => ({
      values: vi.fn((values: Record<string, unknown>) => {
        const operation: Operation = { kind: 'insert', table, values };
        operations.push(operation);
        return operation;
      }),
    })),
    batch: vi.fn(async () => undefined),
  };

  return { db, operations };
}

const validDraft = {
  id: 'book-a',
  publisherUserId: 'publisher-a',
  archivedAt: null,
  publicationStatus: 'DRAFT',
  isPublished: false,
  title: 'Judul Uji',
  author: 'Penulis Uji',
  isbn: null,
  description: 'Sinopsis lengkap untuk pemeriksaan kurasi.',
  genre: '["Sastra"]',
  language: 'ID',
  publishedYear: 2025,
  totalPages: 120,
  subscriptionRequired: 'FREE',
  epubKey: 'epubs/book-a.epub',
  coverKey: 'covers/book-a.jpg',
};

describe('publisher book lifecycle actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getPublisherUser.mockResolvedValue({ id: 'publisher-a', name: 'Publisher Uji' });
  });

  it('moves a draft into review, withdraws it on archive, then restores it inactive', async () => {
    const { db, operations } = createTestDb();
    mocks.getDb.mockReturnValue(db as never);
    db.query.books.findFirst.mockResolvedValue(validDraft as never);
    db.query.publisherSubmissions.findFirst.mockResolvedValue(null);

    await submitPublisherBookForReview('book-a', true);

    expect(db.batch).toHaveBeenCalledTimes(1);
    expect(operations).toContainEqual(expect.objectContaining({
      kind: 'update',
      table: books,
      values: expect.objectContaining({ publicationStatus: 'IN_REVIEW', isPublished: false }),
    }));
    expect(operations).toContainEqual(expect.objectContaining({
      kind: 'insert',
      table: publisherSubmissions,
      values: expect.objectContaining({ bookId: 'book-a', status: 'IN_REVIEW' }),
    }));
    expect(operations).toContainEqual(expect.objectContaining({
      kind: 'insert',
      table: notifications,
      values: expect.objectContaining({ entityId: 'book-a', kind: 'submission' }),
    }));

    operations.length = 0;
    db.query.books.findMany.mockResolvedValue([{ ...validDraft, publicationStatus: 'IN_REVIEW' }] as never);
    await bulkArchivePublisherBooks(['book-a']);

    expect(db.batch).toHaveBeenCalledTimes(2);
    expect(operations).toContainEqual(expect.objectContaining({
      kind: 'update',
      table: books,
      values: expect.objectContaining({ archivedAt: expect.any(String), publicationStatus: 'DRAFT', isPublished: false }),
    }));
    expect(operations).toContainEqual(expect.objectContaining({
      kind: 'update',
      table: publisherSubmissions,
      values: expect.objectContaining({ status: 'WITHDRAWN' }),
    }));

    operations.length = 0;
    db.query.books.findFirst.mockResolvedValue({ ...validDraft, archivedAt: '2026-09-29T00:00:00.000Z' } as never);
    await restorePublisherBook('book-a');

    expect(operations).toContainEqual(expect.objectContaining({
      kind: 'update',
      table: books,
      values: expect.objectContaining({ archivedAt: null, publicationStatus: 'DRAFT', isPublished: false }),
    }));
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/publisher/books');
  });

  it('rejects review submission without rights confirmation or from the wrong owner', async () => {
    const { db } = createTestDb();
    mocks.getDb.mockReturnValue(db as never);

    await expect(submitPublisherBookForReview('book-a', false)).rejects.toThrow('Konfirmasi hak distribusi');
    expect(mocks.getPublisherUser).not.toHaveBeenCalled();

    db.query.books.findFirst.mockResolvedValue(null);
    await expect(submitPublisherBookForReview('book-a', true)).rejects.toThrow('Buku tidak ditemukan atau tidak berhak diakses.');
    expect(db.batch).not.toHaveBeenCalled();
  });
});
