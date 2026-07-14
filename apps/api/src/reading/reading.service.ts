import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { isBookAccessible } from '@bukoo/shared-types';

@Injectable()
export class ReadingService {
  constructor(private readonly prisma: PrismaService) {}

  private async getUserSubscriptionTier(userId: string): Promise<string> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    });

    if (
      subscription &&
      (subscription.status === 'ACTIVE' || subscription.status === 'TRIALING')
    ) {
      const cleanTier = subscription.planId.replace('plan_', '').toUpperCase();
      return cleanTier;
    }

    return 'FREE';
  }

  async updateProgress(userId: string, bookId: string, dto: UpdateProgressDto) {
    const book = await this.prisma.book.findUnique({
      where: { id: bookId },
      select: { totalPages: true, subscriptionRequired: true },
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    const userTier = await this.getUserSubscriptionTier(userId);
    if (!isBookAccessible(userTier, book.subscriptionRequired)) {
      throw new ForbiddenException('Subscription required to access this book');
    }

    const existing = await this.prisma.readingProgress.findUnique({
      where: {
        userId_bookId: {
          userId,
          bookId,
        },
      },
    });

    const totalSeconds = (existing?.readingTimeSeconds ?? 0) + dto.reading_time_delta;
    const totalMinutes = Math.floor(totalSeconds / 60);

    return this.prisma.readingProgress.upsert({
      where: {
        userId_bookId: {
          userId,
          bookId,
        },
      },
      update: {
        currentPage: dto.currentPage,
        cfiPosition: dto.cfiPosition,
        progressPercent: dto.progressPercent,
        readingTimeSeconds: totalSeconds,
        readingTimeMinutes: totalMinutes,
        lastReadAt: new Date(),
      },
      create: {
        userId,
        bookId,
        currentPage: dto.currentPage,
        totalPages: book.totalPages ?? 0,
        cfiPosition: dto.cfiPosition,
        progressPercent: dto.progressPercent,
        readingTimeSeconds: totalSeconds,
        readingTimeMinutes: totalMinutes,
        lastReadAt: new Date(),
      },
    });
  }

  async getProgress(userId: string, bookId: string) {
    const book = await this.prisma.book.findUnique({
      where: { id: bookId },
      select: { subscriptionRequired: true },
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    const userTier = await this.getUserSubscriptionTier(userId);
    if (!isBookAccessible(userTier, book.subscriptionRequired)) {
      throw new ForbiddenException('Subscription required to access this book');
    }

    return this.prisma.readingProgress.findUnique({
      where: {
        userId_bookId: {
          userId,
          bookId,
        },
      },
    });
  }

  async getRecentReading(userId: string) {
    return this.prisma.readingProgress.findMany({
      where: {
        userId,
        progressPercent: { lt: 100 },
      },
      orderBy: {
        lastReadAt: 'desc',
      },
      take: 10,
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            coverUrl: true,
          },
        },
      },
    });
  }
}

