import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ReadingService } from './reading.service';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { CreateHighlightDto } from './dto/create-highlight.dto';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
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

  // --- Highlights ---
  @Get(':bookId/highlights')
  @ApiOperation({ summary: 'Get highlights for a book' })
  getHighlights(@Request() req: AuthenticatedRequest, @Param('bookId') bookId: string) {
    return this.readingService.getHighlights(req.user.userId || req.user.sub || req.user.id || '', bookId);
  }

  @Post(':bookId/highlights')
  @ApiOperation({ summary: 'Create highlight for a book' })
  saveHighlight(
    @Request() req: AuthenticatedRequest,
    @Param('bookId') bookId: string,
    @Body() dto: CreateHighlightDto,
  ) {
    return this.readingService.saveHighlight(req.user.userId || req.user.sub || req.user.id || '', bookId, dto);
  }

  @Delete('highlights/:highlightId')
  @ApiOperation({ summary: 'Delete a highlight' })
  deleteHighlight(@Request() req: AuthenticatedRequest, @Param('highlightId') highlightId: string) {
    return this.readingService.deleteHighlight(req.user.userId || req.user.sub || req.user.id || '', highlightId);
  }

  // --- Bookmarks ---
  @Get(':bookId/bookmarks')
  @ApiOperation({ summary: 'Get bookmarks for a book' })
  getBookmarks(@Request() req: AuthenticatedRequest, @Param('bookId') bookId: string) {
    return this.readingService.getBookmarks(req.user.userId || req.user.sub || req.user.id || '', bookId);
  }

  @Post(':bookId/bookmarks')
  @ApiOperation({ summary: 'Create bookmark for a book' })
  saveBookmark(
    @Request() req: AuthenticatedRequest,
    @Param('bookId') bookId: string,
    @Body() dto: CreateBookmarkDto,
  ) {
    return this.readingService.saveBookmark(req.user.userId || req.user.sub || req.user.id || '', bookId, dto);
  }

  @Delete('bookmarks/:bookmarkId')
  @ApiOperation({ summary: 'Delete a bookmark' })
  deleteBookmark(@Request() req: AuthenticatedRequest, @Param('bookmarkId') bookmarkId: string) {
    return this.readingService.deleteBookmark(req.user.userId || req.user.sub || req.user.id || '', bookmarkId);
  }
}

