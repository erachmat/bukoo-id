import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { BadRequestException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test-secret-key',
          signOptions: { expiresIn: '15m' },
        }),
      ],
      providers: [
        AuthService,
        {
          provide: MailService,
          useValue: {
            sendPasswordResetOtp: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
            refreshToken: {
              create: jest.fn().mockResolvedValue({ token: 'mock-refresh' }),
              findUnique: jest.fn(),
              update: jest.fn(),
              updateMany: jest.fn(),
            },
            account: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('socialLogin - Account Hijack Protection', () => {
    it('should reject Google auto-linking with existing email if email_verified is false', async () => {
      // 1. Mock existing user in database
      const existingUser = {
        id: 'existing-user-id',
        email: 'victim@example.com',
        name: 'Victim User',
        avatar: null,
        onboardingCompleted: true,
        createdAt: new Date(),
        subscription: null,
      };
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(existingUser as any);

      // 2. Mock no existing account link for this provider account
      jest.spyOn(prisma.account, 'findUnique').mockResolvedValue(null);

      // 3. Mock Google OAuth response to return email_verified = false (attacker case)
      (jest.spyOn(service['googleClient'] as any, 'verifyIdToken') as any).mockResolvedValue({
        getPayload: () => ({
          email: 'victim@example.com',
          name: 'Attacker Impersonator',
          sub: 'attacker-sub-id',
          email_verified: false, // crucial: unverified!
        }),
      });

      // 4. Assert socialLogin throws BadRequestException and does not link
      await expect(
        service.socialLogin({
          provider: 'google',
          idToken: 'real-google-token-from-attacker',
          deviceId: 'device-id',
        }),
      ).rejects.toThrow(BadRequestException);

      expect(prisma.account.create).not.toHaveBeenCalled();
    });

    it('should allow Google auto-linking with existing email if email_verified is true', async () => {
      // 1. Mock existing user in database
      const existingUser = {
        id: 'existing-user-id',
        email: 'owner@example.com',
        name: 'Owner User',
        avatar: null,
        onboardingCompleted: true,
        createdAt: new Date(),
        subscription: null,
      };
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(existingUser as any);

      // 2. Mock no existing account link for this provider account
      jest.spyOn(prisma.account, 'findUnique').mockResolvedValue(null);

      // 3. Mock Google OAuth response to return email_verified = true
      (jest.spyOn(service['googleClient'] as any, 'verifyIdToken') as any).mockResolvedValue({
        getPayload: () => ({
          email: 'owner@example.com',
          name: 'Owner User',
          sub: 'owner-sub-id',
          email_verified: true, // verified by google!
        }),
      });

      // Mock account creation to succeed
      jest.spyOn(prisma.account, 'create').mockResolvedValue({} as any);

      // 4. Run socialLogin and verify it succeeds and calls account.create
      const result = await service.socialLogin({
        provider: 'google',
        idToken: 'real-google-token-from-owner',
        deviceId: 'device-id',
      });

      expect(result).toBeDefined();
      expect(prisma.account.create).toHaveBeenCalledWith({
        data: {
          userId: 'existing-user-id',
          type: 'oauth',
          provider: 'google',
          providerAccountId: 'owner-sub-id',
        },
      });
    });
  });
});
