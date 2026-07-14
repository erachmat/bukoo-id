import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProgressDto } from './dto/update-progress.dto';

@Injectable()
export class ReadingService {
  constructor(private readonly prisma: PrismaService) {}

  async updateProgress(userId: string, bookId: string, dto: UpdateProgressDto) {
    const deltaMinutes = Math.floor(dto.reading_time_delta / 60);

    const book = await this.prisma.book.findUnique({
      where: { id: bookId },
      select: { totalPages: true },
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

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
        readingTimeMinutes: { increment: deltaMinutes },
        lastReadAt: new Date(),
      },
      create: {
        userId,
        bookId,
        currentPage: dto.currentPage,
        totalPages: book.totalPages ?? 0,
        cfiPosition: dto.cfiPosition,
        progressPercent: dto.progressPercent,
        readingTimeMinutes: deltaMinutes,
        lastReadAt: new Date(),
      },
    });
  }

  async getProgress(userId: string, bookId: string) {
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
