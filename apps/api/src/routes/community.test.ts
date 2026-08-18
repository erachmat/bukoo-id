import { describe, it, expect } from 'vitest';
import community from './community.js';
import { signJwt } from '../lib/jwt.js';

const JWT_SECRET = 'test-secret';

async function authedToken(): Promise<string> {
  return signJwt({ sub: 'user_1', email: 'reader@bukoo.id' }, JWT_SECRET);
}

function makeEnv() {
  return {
    JWT_SECRET,
    DB: {} as D1Database,
    BUKOO_STORAGE: {} as R2Bucket,
  };
}

function authedInit(token: string, body: unknown): RequestInit {
  return {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  };
}

describe('v1/community', () => {
  it('rejects unauthenticated requests with 401', async () => {
    const res = await community.request('/posts', { method: 'GET' }, makeEnv());
    expect(res.status).toBe(401);
  });

  it('rejects an empty post with 400', async () => {
    const token = await authedToken();
    const res = await community.request(
      '/posts',
      authedInit(token, { type: 'DISCUSSION', content: '' }),
      makeEnv(),
    );
    expect(res.status).toBe(400);
  });

  it('rejects an invalid post type with 400', async () => {
    const token = await authedToken();
    const res = await community.request(
      '/posts',
      authedInit(token, { type: 'MEME', content: 'halo' }),
      makeEnv(),
    );
    expect(res.status).toBe(400);
  });

  it('rejects an over-length comment with 400', async () => {
    const token = await authedToken();
    const res = await community.request(
      '/posts/post_1/comments',
      authedInit(token, { content: 'x'.repeat(501) }),
      makeEnv(),
    );
    expect(res.status).toBe(400);
  });
});
