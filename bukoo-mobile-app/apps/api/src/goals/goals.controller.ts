import { Controller, Get, Put, Body, UseGuards, Request, Query } from '@nestjs/common';
import { GoalsService } from './goals.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

interface AuthenticatedRequest {
  user: { userId?: string; sub?: string; id?: string };
}

@ApiTags('Goals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Get()
  @ApiOperation({ summary: 'Get reading goal, today progress, and current streak' })
  async getDashboard(@Request() req: AuthenticatedRequest) {
    const userId = req.user.userId || req.user.sub || req.user.id || '';

    const goal = await this.goalsService.getGoal(userId);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const streakData = await this.goalsService.getStreakData(userId, 1);
    const todayProgress = streakData.find(s => s.date.getTime() === today.getTime());

    const currentStreak = await this.goalsService.getCurrentStreak(userId);
    const booksReadThisYear = await this.goalsService.getBooksReadThisYear(userId);

    return {
      goal,
      todayProgress: todayProgress || { minutesRead: 0, goalMet: false },
      currentStreak,
      booksReadThisYear,
    };
  }

  @Put()
  @ApiOperation({ summary: 'Update daily reading goal' })
  updateGoal(@Request() req: AuthenticatedRequest, @Body('dailyGoalMinutes') dailyGoalMinutes: number) {
    const userId = req.user.userId || req.user.sub || req.user.id || '';
    return this.goalsService.updateGoal(userId, dailyGoalMinutes);
  }

  @Get('streak')
  @ApiOperation({ summary: 'Get streak history for UI dots' })
  getStreak(@Request() req: AuthenticatedRequest, @Query('days') days?: string) {
    const userId = req.user.userId || req.user.sub || req.user.id || '';
    const numDays = days ? parseInt(days, 10) : 7;
    return this.goalsService.getStreakData(userId, numDays);
  }
}
