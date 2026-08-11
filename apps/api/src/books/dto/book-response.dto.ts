import { SubscriptionTier } from '@prisma/client';

export class BookResponseDto {
  id!: string;
  title!: string;
  author!: string;
  publisher!: string;
  isbn!: string | null;
  synopsis!: string;
  coverUrl!: string;
  genre!: string[];
  tags!: string[];
  language!: string;
  publishedYear!: number;
  totalPages!: number;
  ratingAverage!: number;
  ratingCount!: number;
  readTimeMinutes!: number;
  isPublished!: boolean;
  subscriptionRequired!: SubscriptionTier;
  isAvailableOffline!: boolean;
  fileUrl!: string | null;
  fileType!: string | null;
  createdAt!: Date;
  updatedAt!: Date;
  is_accessible!: boolean;
}

export class BookDetailResponseDto extends BookResponseDto {
  progress_percent!: number;
  shelf_status!: string | null; // e.g. "reading", "completed", "want_to_read", or null
}
