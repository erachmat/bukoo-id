import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Prisma, Book, Language } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { QueryBooksDto } from './dto/query-books.dto';
import { isBookAccessible } from '@bukoo/shared-types';
import { BookResponseDto, BookDetailResponseDto } from './dto/book-response.dto';
import { UserPublicDto } from '../auth/dto/user-public.dto';

interface GlobalFeaturedData {
  editors_choice: Book[];
  trending: Book[];
  new_releases: Book[];
}

export interface FeaturedSectionsResponse {
  continue_reading: BookResponseDto[];
  editors_choice: BookResponseDto[];
  trending: BookResponseDto[];
  new_releases: BookResponseDto[];
}

@Injectable()
export class BooksService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  // --- Helper to get user's active subscription tier ---
  private async getUserSubscriptionTier(userId: string): Promise<string> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    });

    if (
      subscription &&
      (subscription.status === 'ACTIVE' || subscription.status === 'TRIALING')
    ) {
      // Map planId to SubscriptionTier (e.g. "plan_personal" -> "PERSONAL")
      const cleanTier = subscription.planId.replace('plan_', '').toUpperCase();
      return cleanTier;
    }

    return 'FREE';
  }

  // --- GET /books ---
  async findAll(query: QueryBooksDto, user: UserPublicDto): Promise<BookResponseDto[]> {
    const { limit, offset, genre, sort, language } = query;
    const userTier = await this.getUserSubscriptionTier(user.id);

    const whereClause: Prisma.BookWhereInput = {
      isPublished: true,
    };

    if (genre) {
      whereClause.genre = {
        has: genre,
      };
    }

    if (language) {
      whereClause.language = language.toUpperCase() as Language;
    }

    let orderBy: Prisma.BookOrderByWithRelationInput = {};
    if (sort === 'popular') {
      orderBy = { ratingCount: 'desc' };
    } else if (sort === 'newest') {
      orderBy = { createdAt: 'desc' };
    } else if (sort === 'rating') {
      orderBy = { ratingAverage: 'desc' };
    } else {
      orderBy = { id: 'asc' };
    }

    const books = await this.prisma.book.findMany({
      where: whereClause,
      skip: offset,
      take: limit,
      orderBy,
    });

    return books.map((book) => ({
      ...book,
      publisher: book.publisher || '',
      synopsis: book.synopsis || '',
      coverUrl: book.coverUrl || '',
      publishedYear: book.publishedYear ?? 0,
      totalPages: book.totalPages ?? 0,
      is_accessible: isBookAccessible(userTier, book.subscriptionRequired),
    }));
  }

  // --- GET /books/featured ---
  async getFeatured(user: UserPublicDto): Promise<FeaturedSectionsResponse> {
    const userTier = await this.getUserSubscriptionTier(user.id);

    // Fetch global featured and user continue reading in parallel
    const [globalData, continueReading] = await Promise.all([
      this.getGlobalFeaturedCached(),
      this.getContinueReadingCached(user.id),
    ]);

    // Map user accessibility dynamically
    return {
      continue_reading: continueReading.map((b) => ({
        ...b,
        publisher: b.publisher || '',
        synopsis: b.synopsis || '',
        coverUrl: b.coverUrl || '',
        publishedYear: b.publishedYear ?? 0,
        totalPages: b.totalPages ?? 0,
        is_accessible: isBookAccessible(userTier, b.subscriptionRequired),
      })),
      editors_choice: globalData.editors_choice.map((b) => ({
        ...b,
        publisher: b.publisher || '',
        synopsis: b.synopsis || '',
        coverUrl: b.coverUrl || '',
        publishedYear: b.publishedYear ?? 0,
        totalPages: b.totalPages ?? 0,
        is_accessible: isBookAccessible(userTier, b.subscriptionRequired),
      })),
      trending: globalData.trending.map((b) => ({
        ...b,
        publisher: b.publisher || '',
        synopsis: b.synopsis || '',
        coverUrl: b.coverUrl || '',
        publishedYear: b.publishedYear ?? 0,
        totalPages: b.totalPages ?? 0,
        is_accessible: isBookAccessible(userTier, b.subscriptionRequired),
      })),
      new_releases: globalData.new_releases.map((b) => ({
        ...b,
        publisher: b.publisher || '',
        synopsis: b.synopsis || '',
        coverUrl: b.coverUrl || '',
        publishedYear: b.publishedYear ?? 0,
        totalPages: b.totalPages ?? 0,
        is_accessible: isBookAccessible(userTier, b.subscriptionRequired),
      })),
    };
  }

  // --- Helper to fetch global featured books with 5 min (300s) TTL caching ---
  private async getGlobalFeaturedCached(): Promise<GlobalFeaturedData> {
    const cacheKey = 'featured:global';
    const cached = await this.cacheManager.get<GlobalFeaturedData>(cacheKey);
    if (cached) {
      return cached;
    }

    const [editors_choice, trending, new_releases] = await Promise.all([
      // High rating average
      this.prisma.book.findMany({
        where: { isPublished: true },
        orderBy: { ratingAverage: 'desc' },
        take: 10,
      }),
      // Most ratings count
      this.prisma.book.findMany({
        where: { isPublished: true },
        orderBy: { ratingCount: 'desc' },
        take: 10,
      }),
      // Latest books
      this.prisma.book.findMany({
        where: { isPublished: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    const globalData = { editors_choice, trending, new_releases };
    // Cache for 300 seconds (5 minutes)
    await this.cacheManager.set(cacheKey, globalData, 300 * 1000);
    return globalData;
  }

  // --- Helper to fetch user continue reading with 2 min (120s) TTL caching ---
  private async getContinueReadingCached(userId: string): Promise<Book[]> {
    const cacheKey = `continue_reading:${userId}`;
    const cached = await this.cacheManager.get<Book[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const progressList = await this.prisma.readingProgress.findMany({
      where: {
        userId,
        progressPercent: { lt: 100 },
      },
      include: {
        book: true,
      },
      orderBy: {
        lastReadAt: 'desc',
      },
      take: 10,
    });

    const books = progressList.map((p) => p.book);
    // Cache for 120 seconds (2 minutes)
    await this.cacheManager.set(cacheKey, books, 120 * 1000);
    return books;
  }

  // --- GET /books/search ---
  async search(q: string, user: UserPublicDto): Promise<BookResponseDto[]> {
    if (!q || q.trim().length < 2) {
      throw new BadRequestException('Search query must be at least 2 characters');
    }

    const userTier = await this.getUserSubscriptionTier(user.id);

    // Postgres Full-Text Search via plainto_tsquery against GIN index
    const books = await this.prisma.$queryRaw<Book[]>`
      SELECT * FROM "Book"
      WHERE "isPublished" = true
        AND to_tsvector('indonesian', coalesce("title", '') || ' ' || coalesce("author", '')) 
        @@ plainto_tsquery('indonesian', ${q})
    `;

    return books.map((book) => ({
      ...book,
      publisher: book.publisher || '',
      synopsis: book.synopsis || '',
      coverUrl: book.coverUrl || '',
      publishedYear: book.publishedYear ?? 0,
      totalPages: book.totalPages ?? 0,
      is_accessible: isBookAccessible(userTier, book.subscriptionRequired),
    }));
  }

  // --- GET /books/:id ---
  async findOne(id: string, user: UserPublicDto): Promise<BookDetailResponseDto> {
    const book = await this.prisma.book.findUnique({
      where: { id },
    });

    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    const userTier = await this.getUserSubscriptionTier(user.id);

    // Query reading progress
    const progress = await this.prisma.readingProgress.findUnique({
      where: {
        userId_bookId: {
          userId: user.id,
          bookId: id,
        },
      },
    });

    // Query shelf status
    const shelfBook = await this.prisma.shelfBook.findFirst({
      where: {
        bookId: id,
        shelf: {
          userId: user.id,
        },
      },
      include: {
        shelf: true,
      },
    });

    return {
      ...book,
      publisher: book.publisher || '',
      synopsis: book.synopsis || '',
      coverUrl: book.coverUrl || '',
      publishedYear: book.publishedYear ?? 0,
      totalPages: book.totalPages ?? 0,
      is_accessible: isBookAccessible(userTier, book.subscriptionRequired),
      progress_percent: progress ? progress.progressPercent : 0,
      shelf_status: shelfBook ? shelfBook.shelf.slug : null,
    };
  }
}
