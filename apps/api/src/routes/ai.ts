import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.js';
import type { Env } from '../types/env.js';

const ai = new Hono<{ Bindings: Env }>();
ai.use('*', authMiddleware);

const summarySchema = z.object({
  chapterText: z.string().min(10).max(10_000),
  bookTitle: z.string().optional(),
  chapterTitle: z.string().optional(),
});

// ---------------------------------------------------------------------------
// POST /v1/ai/companion/summary
// ---------------------------------------------------------------------------

ai.post('/companion/summary', zValidator('json', summarySchema), async (c) => {
  const { chapterText, bookTitle, chapterTitle } = c.req.valid('json');

  const context = [
    bookTitle && `Judul buku: "${bookTitle}"`,
    chapterTitle && `Bab: "${chapterTitle}"`,
  ]
    .filter(Boolean)
    .join('\n');

  const prompt = [
    context,
    `Berikut adalah isi bab yang perlu dirangkum:\n\n${chapterText}`,
    `\nBuatkan rangkuman singkat (3–5 poin utama) dalam Bahasa Indonesia, tulis dalam format poin-poin jelas yang membantu pembaca memahami isi bab ini.`,
  ]
    .filter(Boolean)
    .join('\n');

  const response = await c.env.AI.run('@cf/meta/llama-3-8b-instruct', {
    messages: [
      {
        role: 'system',
        content:
          'Kamu adalah asisten membaca yang membantu pengguna memahami isi buku. Berikan rangkuman yang jelas, informatif, dan mudah dipahami dalam Bahasa Indonesia.',
      },
      { role: 'user', content: prompt },
    ],
  });

  return c.json({ summary: (response as { response: string }).response });
});

export default ai;
