import { SignJWT, jwtVerify } from 'jose';

export interface JwtPayload {
  sub: string;   // userId
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * Signs a JWT access token valid for 15 minutes.
 */
export async function signJwt(payload: Omit<JwtPayload, 'iat' | 'exp'>, secret: string): Promise<string> {
  const key = new TextEncoder().encode(secret);
  return new SignJWT({ email: payload.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(key);
}

/**
 * Verifies a JWT and returns the decoded payload, or null if invalid/expired.
 */
export async function verifyJwt(token: string, secret: string): Promise<JwtPayload | null> {
  try {
    const key = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, key);
    return {
      sub: payload.sub as string,
      email: payload['email'] as string,
      iat: payload.iat,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}
