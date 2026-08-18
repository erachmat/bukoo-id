import { describe, it, expect, vi } from 'vitest';
import ai from './ai.js';
import { signJwt } from '../lib/jwt.js';

const JWT_SECRET = 'test-secret';

async function authedToken(): Promise<string> {
  return signJwt({ sub: 'user_1', email: 'reader@bukoo.id' }, JWT_SECRET);
}

function makeEnv(aiRun?: () => Promise<unknown>) {
  return {
    JWT_SECRET,
    DB: {} as D1Database,
    BUKOO_STORAGE: {} as R2Bucket,
    AI: {
      run: aiRun ?? (async () => ({ response: 'Halo! Aku asisten membacamu.' })),
    } as unknown as Ai,
  };
}

describe('POST /v1/ai/chat', () => {
  it('rejects unauthenticated requests with 401', async () => {
    const res = await ai.request('/chat', { method: 'POST' }, makeEnv());
    expect(res.status).toBe(401);
  });

  it('rejects an empty message with 400', async () => {
    const token = await authedToken();
    const res = await ai.request(
      '/chat',
      {
        method: 'POST',
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify({ message: '' }),
      },
      makeEnv(),
    );
    expect(res.status).toBe(400);
  });

  it('returns the model reply for a valid message', async () => {
    const token = await authedToken();
    const aiRun = vi.fn(async () => ({ response: 'Ringkasan bab: ...' }));
    const res = await ai.request(
      '/chat',
      {
        method: 'POST',
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify({ message: 'Rangkum bab 3', bookTitle: 'Laut Bercerita' }),
      },
      makeEnv(aiRun),
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { reply: string };
    expect(body.reply).toContain('Ringkasan bab');
    expect(aiRun).toHaveBeenCalledOnce();
  });

  it('returns 502 when the AI binding fails', async () => {
    const token = await authedToken();
    const res = await ai.request(
      '/chat',
      {
        method: 'POST',
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify({ message: 'Halo' }),
      },
      makeEnv(async () => {
        throw new Error('model down');
      }),
    );
    expect(res.status).toBe(502);
  });
});
