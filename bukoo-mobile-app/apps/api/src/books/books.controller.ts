import { Controller, Get, Query, Param, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BooksService } from './books.service';
import { QueryBooksDto } from './dto/query-books.dto';
import { UserPublicDto } from '../auth/dto/user-public.dto';

interface RequestWithUser extends Request {
  user: UserPublicDto;
}

@Controller('books')
@UseGuards(JwtAuthGuard)
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get('featured')
  getFeatured(@Req() req: RequestWithUser) {
    return this.booksService.getFeatured(req.user);
  }

  @Get('search')
  search(@Query('q') q: string, @Req() req: RequestWithUser) {
    return this.booksService.search(q, req.user);
  }

  @Get()
  findAll(@Query() query: QueryBooksDto, @Req() req: RequestWithUser) {
    return this.booksService.findAll(query, req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.booksService.findOne(id, req.user);
  }
}
