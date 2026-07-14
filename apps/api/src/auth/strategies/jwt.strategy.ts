import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { decode } = require('next-auth/jwt');

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'fallback-secret-key-for-development-purposes',
    });
  }

  async authenticate(req: any, options?: any) {
    const extractor = ExtractJwt.fromAuthHeaderAsBearerToken();
    const token = extractor(req);

    if (token) {
      try {
        const nextAuthSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
        const decoded = await decode({
          token,
          secret: nextAuthSecret,
        });

        if (decoded && decoded.sub) {
          const user = await this.authService.findUserById(decoded.sub);
          if (user) {
            return (this as any).success(user);
          }
        }
      } catch (err) {
        // Fall through to standard passport-jwt verification if NextAuth decryption fails
      }
    }

    super.authenticate(req, options);
  }

  async validate(payload: { sub: string; email: string }) {
    const user = await this.authService.findUserById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
