import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { BooksModule } from './books/books.module';
import { ReadingModule } from './reading/reading.module';
import { GoalsModule } from './goals/goals.module';
import { UsersModule } from './users/users.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        if (process.env.REDIS_URL) {
          const { redisStore } = await import('cache-manager-redis-yet');
          return {
            store: redisStore as any,
            url: process.env.REDIS_URL,
          };
        }
        return {}; // Local in-memory caching fallback
      },
    }),
    PrismaModule,
    MailModule,
    AuthModule,
    BooksModule,
    ReadingModule,
    GoalsModule,
    UsersModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
