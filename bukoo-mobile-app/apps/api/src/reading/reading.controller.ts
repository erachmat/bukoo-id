import { Controller, Get, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ReadingService } from './reading.service';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

interface AuthenticatedRequest {
  user: { userId?: string; sub?: string; id?: string };
}

@ApiTags('Reading')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reading')
export class ReadingController {
  constructor(private readonly readingService: ReadingService) {}

  @Get('recent')
  @ApiOperation({ summary: 'Get recently read books that are not finished' })
  getRecentReading(@Request() req: AuthenticatedRequest) {
    return this.readingService.getRecentReading(req.user.userId || req.user.sub || req.user.id || '');
  }

  @Get(':bookId/progress')
  @ApiOperation({ summary: 'Get current reading progress for a book' })
  getProgress(@Request() req: AuthenticatedRequest, @Param('bookId') bookId: string) {
    return this.readingService.getProgress(req.user.userId || req.user.sub || req.user.id || '', bookId);
  }

  @Put(':bookId/progress')
  @ApiOperation({ summary: 'Update reading progress for a book' })
  updateProgress(
    @Request() req: AuthenticatedRequest,
    @Param('bookId') bookId: string,
    @Body() updateProgressDto: UpdateProgressDto,
  ) {
    return this.readingService.updateProgress(
      req.user.userId || req.user.sub || req.user.id || '',
      bookId,
      updateProgressDto,
    );
  }
}

