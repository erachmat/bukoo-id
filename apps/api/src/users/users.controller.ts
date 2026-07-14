import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserPublicDto } from '../auth/dto/user-public.dto';

interface RequestWithUser extends Request {
  user: UserPublicDto;
}

@ApiTags('users')
@Controller('users')
export class UsersController {
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, type: UserPublicDto })
  @ApiResponse({ status: 401, description: 'Invalid or missing authentication token' })
  getProfile(@Request() req: RequestWithUser): UserPublicDto {
    return req.user;
  }
}
