/**
 * apps/api — Cloudflare Workers entrypoint
 *
 * Runtime: Cloudflare Workers (Edge)
 * Framework: Hono
 * Database: Cloudflare D1 (via Drizzle ORM)
 * Storage: Cloudflare R2 (EPUB + cover files)
 * AI: Cloudflare Workers AI (llama-3-8b-instruct)
 * Auth: jose JWTs + opaque refresh token rotation in D1
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import type { Env } from './types/env.js';
import authRouter from './routes/auth.js';
import booksRouter from './routes/books.js';
import readingRouter from './routes/reading.js';
import goalsRouter from './routes/goals.js';
import usersRouter from './routes/users.js';
import aiRouter from './routes/ai.js';
import communityRouter from './routes/community.js';
import notificationsRouter from './routes/notifications.js';

const app = new Hono<{ Bindings: Env }>();

// ---------------------------------------------------------------------------
// Global middleware
// ---------------------------------------------------------------------------

app.use('*', logger());

app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposeHeaders: ['Content-Range', 'Accept-Ranges'],
    credentials: false,
  }),
);

// ---------------------------------------------------------------------------
// Health check (excluded from /v1 prefix — required by Cloudflare health checks)
// ---------------------------------------------------------------------------

app.get('/health', (c) =>
  c.json({
    status: 'ok',
    runtime: 'cloudflare-workers',
    timestamp: new Date().toISOString(),
  }),
);

// ---------------------------------------------------------------------------
// API routes (versioned under /v1)
// ---------------------------------------------------------------------------

app.route('/v1/auth', authRouter);
app.route('/v1/books', booksRouter);
app.route('/v1/reading', readingRouter);
app.route('/v1/goals', goalsRouter);
app.route('/v1/users', usersRouter);
app.route('/v1/ai', aiRouter);
app.route('/v1/community', communityRouter);
app.route('/v1/notifications', notificationsRouter);

// ---------------------------------------------------------------------------
// 404 fallback
// ---------------------------------------------------------------------------

app.notFound((c) => c.json({ error: 'Not found' }, 404));

app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});

export default app;
