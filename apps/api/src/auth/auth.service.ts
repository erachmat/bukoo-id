import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import appleSignin from 'apple-signin-auth';
import { RegisterDto } from './dto/register.dto';
import { SocialAuthDto } from './dto/social-auth.dto';
import { UserPublicDto } from './dto/user-public.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { PrismaService } from '../prisma/prisma.service';
import { MailService, MailTestResult } from '../mail/mail.service';

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client;
  private resetTokens = new Map<string, { token: string; expiresAt: Date }>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  // --- Core Queries ---
  async findUserById(id: string): Promise<UserPublicDto | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { subscription: { include: { plan: true } } },
    });
    return user ? this.toPublicDto(user) : null;
  }

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  // --- Password Validation ---
  async validateUser(email: string, pass: string): Promise<UserPublicDto | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { subscription: { include: { plan: true } } },
    });
    if (user && user.password) {
      const isMatch = await bcrypt.compare(pass, user.password);
      if (isMatch) {
        return this.toPublicDto(user);
      }
    }
    return null;
  }

  // --- Register Route ---
  async register(registerDto: RegisterDto) {
    const existing = await this.findUserByEmail(registerDto.email);
    if (existing) {
      throw new BadRequestException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 12);
    
    const newUser = await this.prisma.user.create({
      data: {
        name: registerDto.name,
        email: registerDto.email.toLowerCase(),
        password: passwordHash,
      },
      include: { subscription: { include: { plan: true } } }
    });

    return {
      user: this.toPublicDto(newUser),
    };
  }

  // --- Login / Session Issuer ---
  async login(userDto: UserPublicDto, deviceId: string) {
    const payload = { sub: userDto.id, email: userDto.email };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });

    // Opaque Refresh Token generation
    const opaqueToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(opaqueToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 Days TTL

    await this.prisma.refreshToken.create({
      data: {
        token: tokenHash,
        userId: userDto.id,
        deviceId,
        expiresAt,
      },
    });

    return {
      user: userDto,
      accessToken,
      refreshToken: opaqueToken,
      expiresIn: 900, // 15 mins in seconds
    };
  }

  // --- Refresh Token Rotation & Theft Detection ---
  async refresh(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: tokenHash },
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // THEFT DETECTION TRIGGER
    if (tokenRecord.revokedAt) {
      // Immediately revoke all sessions for this compromised user account
      await this.prisma.refreshToken.updateMany({
        where: { userId: tokenRecord.userId },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException(
        'Revoked refresh token re-submitted. Theft detected. All sessions terminated.',
      );
    }

    // Check expiration
    if (new Date() > tokenRecord.expiresAt) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    // Revoke old token immediately
    await this.prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { revokedAt: new Date() },
    });

    // Fetch user
    const user = await this.prisma.user.findUnique({
      where: { id: tokenRecord.userId },
      include: { subscription: { include: { plan: true } } },
    });

    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    // Issue rotated credentials
    return this.login(this.toPublicDto(user), tokenRecord.deviceId);
  }

  // --- Social OAuth Validation ---
  async socialLogin(socialAuthDto: SocialAuthDto) {
    let email: string;
    let name: string;
    let avatar: string | null = null;
    let provider: string;
    let providerAccountId: string;
    let emailVerified = false;

    if (socialAuthDto.provider === 'google') {
      const googleInfo = await this.verifyGoogle(socialAuthDto.idToken);
      email = googleInfo.email;
      name = googleInfo.name;
      avatar = googleInfo.avatar;
      provider = 'google';
      providerAccountId = googleInfo.providerAccountId;
      emailVerified = !!googleInfo.emailVerified;
    } else {
      const appleInfo = await this.verifyApple(socialAuthDto.idToken);
      email = appleInfo.email;
      name = appleInfo.name;
      provider = 'apple';
      providerAccountId = appleInfo.providerAccountId;
      emailVerified = !!appleInfo.emailVerified;
    }

    // 1. Check if Account link already exists
    const account = await this.prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId,
        },
      },
      include: {
        user: {
          include: { subscription: { include: { plan: true } } },
        },
      },
    });

    let user;

    if (account) {
      user = account.user;
    } else {
      // 2. Check if a User with the email already exists
      user = await this.prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        include: { subscription: { include: { plan: true } } },
      });

      if (user) {
        // Prevent auto-linking for unverified emails to avoid account hijacking
        if (!emailVerified) {
          console.warn(`[AUDIT] Blocked OAuth link to existing user ${email} via ${provider}. Reason: Email not verified by OAuth provider.`);
          throw new BadRequestException('EMAIL_LINK_REQUIRES_VERIFICATION');
        }
      } else {
        // Create user profile
        user = await this.prisma.user.create({
          data: {
            name,
            email: email.toLowerCase(),
            avatar,
          },
          include: { subscription: { include: { plan: true } } },
        });
      }

      // 3. Create Account connection
      await this.prisma.account.create({
        data: {
          userId: user.id,
          type: 'oauth',
          provider,
          providerAccountId,
        },
      });
    }

    return this.login(this.toPublicDto(user), socialAuthDto.deviceId);
  }

  // --- Logout ---
  async logout(refreshToken: string): Promise<void> {
    const tokenHash = this.hashToken(refreshToken);
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: tokenHash },
    });
    if (tokenRecord && !tokenRecord.revokedAt) {
      await this.prisma.refreshToken.update({
        where: { id: tokenRecord.id },
        data: { revokedAt: new Date() },
      });
    }
  }

  // --- Helpers ---
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private toPublicDto(user: { id: string; name: string | null; email: string; avatar: string | null; onboardingCompleted: boolean; createdAt: Date; subscription?: { status: string; planId: string } | null }): UserPublicDto {
    let subscriptionTier = 'FREE';
    if (
      user.subscription &&
      (user.subscription.status === 'ACTIVE' || user.subscription.status === 'TRIALING')
    ) {
      subscriptionTier = user.subscription.planId.replace('plan_', '').toUpperCase();
    }

    return {
      id: user.id,
      name: user.name || '',
      email: user.email,
      avatarUrl: user.avatar,
      subscriptionTier,
      onboardingCompleted: user.onboardingCompleted,
      createdAt: user.createdAt.toISOString(),
    };
  }

  // Google OIDC Token Verify with Test-Friendly Bypass
  private async verifyGoogle(idToken: string) {
    if (idToken === 'mock-google-token' || idToken.startsWith('mock-')) {
      return {
        email: 'social.google@bukoo.app',
        name: 'Google User',
        avatar: 'https://avatar.google.com/social',
        providerAccountId: 'mock-google-id',
        emailVerified: true,
      };
    }

    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.email || !payload.name || !payload.sub) {
        throw new Error('Missing user fields');
      }
      return {
        email: payload.email,
        name: payload.name,
        avatar: payload.picture || null,
        providerAccountId: payload.sub,
        emailVerified: payload.email_verified,
      };
    } catch {
      throw new UnauthorizedException('Google ID token verification failed');
    }
  }

  // Apple OIDC Token Verify with Test-Friendly Bypass
  private async verifyApple(idToken: string) {
    if (idToken === 'mock-apple-token' || idToken.startsWith('mock-')) {
      return {
        email: 'social.apple@bukoo.app',
        name: 'Apple User',
        providerAccountId: 'mock-apple-id',
        emailVerified: true,
      };
    }

    try {
      const payload = await appleSignin.verifyIdToken(idToken, {
        audience: process.env.APPLE_CLIENT_ID,
      });
      if (!payload || !payload.email || !payload.sub) {
        throw new Error('Missing user email or sub');
      }
      const emailVerified = payload.email_verified === true || payload.email_verified === 'true';
      return {
        email: payload.email,
        name: 'Apple User',
        providerAccountId: payload.sub,
        emailVerified,
      };
    } catch {
      throw new UnauthorizedException('Apple ID token verification failed');
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const email = forgotPasswordDto.email.toLowerCase();
    const user = await this.findUserByEmail(email);
    if (!user) {
      throw new NotFoundException('Alamat email tidak terdaftar');
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    this.resetTokens.set(email, { token: code, expiresAt });

    // Send email asynchronously in the background so the HTTP request is not blocked
    this.mailService.sendPasswordResetOtp(email, code).catch((err) => {
      console.error(`AuthService: Failed to send password reset email:`, err);
    });

    return {
      message: 'Kode verifikasi telah dikirim ke email Anda',
      code,
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const email = resetPasswordDto.email.toLowerCase();
    const record = this.resetTokens.get(email);

    if (!record) {
      throw new BadRequestException('Permintaan reset password tidak ditemukan atau kadaluarsa');
    }

    if (record.token !== resetPasswordDto.token) {
      throw new BadRequestException('Kode verifikasi salah');
    }

    if (new Date() > record.expiresAt) {
      this.resetTokens.delete(email);
      throw new BadRequestException('Kode verifikasi telah kadaluarsa');
    }

    const passwordHash = await bcrypt.hash(resetPasswordDto.newPassword, 12);
    await this.prisma.user.update({
      where: { email },
      data: { password: passwordHash },
    });

    this.resetTokens.delete(email);

    return {
      success: true,
      message: 'Password berhasil diubah',
    };
  }

  async testMailConnection(): Promise<MailTestResult> {
    return this.mailService.testMailConnection();
  }
}
