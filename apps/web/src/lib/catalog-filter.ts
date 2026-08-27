export type CatalogStatus = 'all' | 'published' | 'in_review' | 'draft' | 'rejected' | 'unpublished';
export type CatalogSort = 'title' | 'author' | 'reads' | 'updated';

export interface CatalogFilterBook {
  title: string;
  author: string;
  subscriptionRequired: string;
  language: string;
  readCount: number;
  updatedAt: string | null;
  isPublished: boolean;
  publicationStatus: string;
}

export interface CatalogFilters {
  q?: string;
  status?: CatalogStatus;
  access?: string;
  language?: string;
  sort?: CatalogSort;
}

export const CATALOG_PAGE_SIZE = 10;

function matchesStatus(book: CatalogFilterBook, status: CatalogStatus): boolean {
  switch (status) {
    case 'published': return book.isPublished;
    case 'in_review': return book.publicationStatus === 'IN_REVIEW';
    case 'draft': return book.publicationStatus === 'DRAFT';
    case 'rejected': return book.publicationStatus === 'REJECTED';
    case 'unpublished': return !book.isPublished && book.publicationStatus === 'UNPUBLISHED';
    default: return true;
  }
}

export function filterAndSortBooks<T extends CatalogFilterBook>(books: T[], filters: CatalogFilters = {}): T[] {
  const query = filters.q?.trim().toLocaleLowerCase('id-ID') ?? '';
  const status = filters.status ?? 'all';
  const access = filters.access ?? 'all';
  const language = filters.language ?? 'all';

  return books
    .filter((book) => {
      const textMatches = !query || `${book.title} ${book.author}`.toLocaleLowerCase('id-ID').includes(query);
      return textMatches && matchesStatus(book, status) && (access === 'all' || book.subscriptionRequired === access) && (language === 'all' || book.language === language);
    })
    .sort((left, right) => {
      switch (filters.sort ?? 'updated') {
        case 'title': return left.title.localeCompare(right.title, 'id-ID');
        case 'author': return left.author.localeCompare(right.author, 'id-ID');
        case 'reads': return right.readCount - left.readCount || left.title.localeCompare(right.title, 'id-ID');
        case 'updated': return (right.updatedAt ?? '').localeCompare(left.updatedAt ?? '') || left.title.localeCompare(right.title, 'id-ID');
      }
    });
}

export function paginateBooks<T>(books: T[], requestedPage: number, pageSize = CATALOG_PAGE_SIZE): { items: T[]; totalPages: number; page: number } {
  const safePageSize = Number.isInteger(pageSize) && pageSize > 0 ? pageSize : CATALOG_PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(books.length / safePageSize));
  const page = Math.min(Math.max(Number.isInteger(requestedPage) ? requestedPage : 1, 1), totalPages);
  return { items: books.slice((page - 1) * safePageSize, page * safePageSize), totalPages, page };
}
