import { Injectable } from '@nestjs/common';
import { User, Book, ReadingProgress } from '@bukoo/shared-types';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Welcome to BUKOO REST API';
  }

  getMockUser(): User {
    return {
      id: 'usr_1001',
      name: 'Rian Erachmat',
      email: 'rian@bukoo.app',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
      subscriptionTier: 'premium',
      onboardingCompleted: true,
      createdAt: '2026-01-15T08:30:00Z',
    };
  }

  getMockBook(id: string): Book {
    return {
      id,
      title: 'Laskar Pelangi',
      author: 'Andrea Hirata',
      coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f',
      genre: ['Fiction', 'Drama', 'Inspirational'],
      language: 'id',
      rating: 4.8,
      totalPages: 529,
      readTimeMinutes: 320,
    };
  }

  getMockProgress(bookId: string): ReadingProgress {
    return {
      bookId,
      currentPage: 120,
      totalPages: 529,
      progressPercent: 22.68,
      cfiPosition: 'epubcfi(/6/12[chap-4]!/4/2/4/1:24)',
      readingTimeMinutes: 72,
      lastReadAt: new Date().toISOString(),
    };
  }
}
