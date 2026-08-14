import type { MiddlewareHandler } from 'hono';
import { verifyJwt } from '../lib/jwt.js';
import type { Env } from '../types/env.js';

// Extend Hono's context Variables type with the authenticated userId
declare module 'hono' {
  interface ContextVariableMap {
    userId: string;
    userEmail: string;
  }
}

/**
 * JWT authentication middleware for Hono.
 *
 * Expects: Authorization: Bearer <accessToken>
 *
 * On success: sets c.get('userId') and c.get('userEmail') for downstream handlers.
 * On failure: returns 401 JSON response immediately.
 *
 * Usage:
 *   app.use('/v1/*', authMiddleware)
 *   // or per-route:
 *   app.get('/v1/books', authMiddleware, (c) => { ... })
 */
export const authMiddleware: MiddlewareHandler<{ Bindings: Env }> = async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Missing or malformed Authorization header' }, 401);
  }

  const token = authHeader.slice(7);
  const payload = await verifyJwt(token, c.env.JWT_SECRET);
  if (!payload) {
    return c.json({ error: 'Invalid or expired access token' }, 401);
  }

  c.set('userId', payload.sub);
  c.set('userEmail', payload.email);
  await next();
};
