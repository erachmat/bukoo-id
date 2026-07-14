import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
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
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      url: process.env.REDIS_URL || 'redis://localhost:6379',
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
