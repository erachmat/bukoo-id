import { Test, TestingModule } from '@nestjs/testing';
import { ReadingService } from './reading.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('ReadingService', () => {
  let service: ReadingService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReadingService,
        {
          provide: PrismaService,
          useValue: {
            book: {
              findUnique: jest.fn(),
            },
            subscription: {
              findUnique: jest.fn(),
            },
            readingProgress: {
              findUnique: jest.fn(),
              upsert: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ReadingService>(ReadingService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateProgress / getProgress gating & precision', () => {
    it('should throw NotFoundException if book does not exist', async () => {
      jest.spyOn(prisma.book, 'findUnique').mockResolvedValue(null);

      await expect(
        service.getProgress('user-1', 'book-invalid'),
      ).rejects.toThrow(NotFoundException);

      await expect(
        service.updateProgress('user-1', 'book-invalid', {
          currentPage: 1,
          cfiPosition: '',
          progressPercent: 10,
          reading_time_delta: 30,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user subscription is insufficient', async () => {
      // Mock premium book
      jest.spyOn(prisma.book, 'findUnique').mockResolvedValue({
        id: 'book-premium',
        subscriptionRequired: 'PREMIUM',
        totalPages: 200,
      } as any);

      // Mock user subscription: FREE (none/inactive)
      jest.spyOn(prisma.subscription, 'findUnique').mockResolvedValue(null);

      await expect(
        service.getProgress('user-free', 'book-premium'),
      ).rejects.toThrow(ForbiddenException);

      await expect(
        service.updateProgress('user-free', 'book-premium', {
          currentPage: 1,
          cfiPosition: '',
          progressPercent: 10,
          reading_time_delta: 30,
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow reading premium book if user has PREMIUM subscription', async () => {
      // Mock premium book
      jest.spyOn(prisma.book, 'findUnique').mockResolvedValue({
        id: 'book-premium',
        subscriptionRequired: 'PREMIUM',
        totalPages: 200,
      } as any);

      // Mock active PREMIUM subscription
      jest.spyOn(prisma.subscription, 'findUnique').mockResolvedValue({
        planId: 'plan_premium',
        status: 'ACTIVE',
      } as any);

      // Mock no existing progress
      jest.spyOn(prisma.readingProgress, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.readingProgress, 'upsert').mockResolvedValue({} as any);

      await service.updateProgress('user-premium', 'book-premium', {
        currentPage: 2,
        cfiPosition: 'cfi-2',
        progressPercent: 1.0,
        reading_time_delta: 45,
      });

      expect(prisma.readingProgress.upsert).toHaveBeenCalledWith({
        where: { userId_bookId: { userId: 'user-premium', bookId: 'book-premium' } },
        update: expect.objectContaining({
          readingTimeSeconds: 45,
          readingTimeMinutes: 0,
        }),
        create: expect.objectContaining({
          readingTimeSeconds: 45,
          readingTimeMinutes: 0,
        }),
      });
    });

    it('should aggregate reading time precisely without loss of seconds across sync intervals', async () => {
      // Mock free book
      jest.spyOn(prisma.book, 'findUnique').mockResolvedValue({
        id: 'book-free',
        subscriptionRequired: 'FREE',
        totalPages: 100,
      } as any);

      // Mock active subscription (doesn't matter since book is free)
      jest.spyOn(prisma.subscription, 'findUnique').mockResolvedValue(null);

      // Mock existing progress with 45 seconds accumulated
      jest.spyOn(prisma.readingProgress, 'findUnique').mockResolvedValue({
        readingTimeSeconds: 45,
        readingTimeMinutes: 0,
      } as any);

      jest.spyOn(prisma.readingProgress, 'upsert').mockResolvedValue({} as any);

      // Sync 30 seconds (total 75 seconds -> 1 minute)
      await service.updateProgress('user-free', 'book-free', {
        currentPage: 5,
        cfiPosition: 'cfi-5',
        progressPercent: 5.0,
        reading_time_delta: 30,
      });

      expect(prisma.readingProgress.upsert).toHaveBeenCalledWith({
        where: { userId_bookId: { userId: 'user-free', bookId: 'book-free' } },
        update: expect.objectContaining({
          readingTimeSeconds: 75,
          readingTimeMinutes: 1,
        }),
        create: expect.objectContaining({
          readingTimeSeconds: 75,
          readingTimeMinutes: 1,
        }),
      });
    });
  });
});
