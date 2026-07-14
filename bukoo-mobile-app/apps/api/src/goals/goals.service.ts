import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GoalsService {
  constructor(private readonly prisma: PrismaService) {}

  async getGoal(userId: string) {
    let goal = await this.prisma.readingGoal.findUnique({ where: { userId } });
    if (!goal) {
      goal = await this.prisma.readingGoal.create({
        data: { userId, dailyGoalMinutes: 5 },
      });
    }
    return goal;
  }

  async updateGoal(userId: string, dailyGoalMinutes: number) {
    return this.prisma.readingGoal.upsert({
      where: { userId },
      update: { dailyGoalMinutes },
      create: { userId, dailyGoalMinutes },
    });
  }

  async recordReading(userId: string, minutesRead: number, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const goal = await this.getGoal(userId);
    
    const existing = await this.prisma.readingStreak.findUnique({
      where: {
        userId_date: {
          userId,
          date: startOfDay,
        },
      },
    });

    const totalMinutes = (existing?.minutesRead || 0) + minutesRead;
    const goalMet = totalMinutes >= goal.dailyGoalMinutes;

    return this.prisma.readingStreak.upsert({
      where: {
        userId_date: {
          userId,
          date: startOfDay,
        },
      },
      update: {
        minutesRead: totalMinutes,
        goalMet,
      },
      create: {
        userId,
        date: startOfDay,
        minutesRead: totalMinutes,
        goalMet,
      },
    });
  }

  async getStreakData(userId: string, days: number = 7) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    
    const pastDate = new Date(today);
    pastDate.setUTCDate(today.getUTCDate() - (days - 1));

    return this.prisma.readingStreak.findMany({
      where: {
        userId,
        date: {
          gte: pastDate,
          lte: today,
        },
      },
      orderBy: { date: 'asc' },
    });
  }

  async getBooksReadThisYear(userId: string) {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(Date.UTC(currentYear, 0, 1));
    const endOfYear = new Date(Date.UTC(currentYear, 11, 31, 23, 59, 59));

    const result = await this.prisma.readingProgress.findMany({
      where: {
        userId,
        progressPercent: 100,
        updatedAt: {
          gte: startOfYear,
          lte: endOfYear,
        },
      },
      select: {
        bookId: true,
      },
      distinct: ['bookId'],
    });

    return result.length;
  }

  async getCurrentStreak(userId: string) {
    const streaks = await this.prisma.readingStreak.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    let currentStreak = 0;
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    
    const expectedDate = new Date(today);
    
    if (streaks.length > 0 && streaks[0].date.getTime() === expectedDate.getTime()) {
      if (streaks[0].goalMet) currentStreak++;
      expectedDate.setUTCDate(expectedDate.getUTCDate() - 1);
      streaks.shift();
    } else if (streaks.length > 0 && streaks[0].date.getTime() > expectedDate.getTime()) {
       // Future dates ignored
    } else {
       // Today is missing
       expectedDate.setUTCDate(expectedDate.getUTCDate() - 1);
    }

    for (const streak of streaks) {
      if (streak.date.getTime() === expectedDate.getTime() && streak.goalMet) {
        currentStreak++;
        expectedDate.setUTCDate(expectedDate.getUTCDate() - 1);
      } else {
        break;
      }
    }

    return currentStreak;
  }
}
