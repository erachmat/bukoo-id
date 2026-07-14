import { Controller, Post, Body, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SocialAuthDto } from './dto/social-auth.dto';
import { RefreshDto } from './dto/refresh.dto';
import { UserPublicDto } from './dto/user-public.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { MailTestResult } from '../mail/mail.service';

interface RequestWithUser {
  user: UserPublicDto;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Request() req: RequestWithUser, @Body() loginDto: LoginDto) {
    // req.user has been attached by Passport LocalStrategy
    return this.authService.login(req.user, loginDto.deviceId);
  }

  @Post('social')
  @HttpCode(HttpStatus.OK)
  async socialLogin(@Body() socialAuthDto: SocialAuthDto) {
    return this.authService.socialLogin(socialAuthDto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() refreshDto: RefreshDto) {
    return this.authService.refresh(refreshDto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body() refreshDto: RefreshDto) {
    await this.authService.logout(refreshDto.refreshToken);
    return { success: true, message: 'Logged out successfully' };
  }

  @Post('test-email')
  @HttpCode(HttpStatus.OK)
  async testEmail(): Promise<MailTestResult> {
    return this.authService.testMailConnection();
  }
}
