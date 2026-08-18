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

const CHAT_SYSTEM_PROMPT = [
  'Kamu adalah AI Companion BUKOO, asisten membaca yang ramah dan membantu.',
  'Bantu pengguna memahami buku yang sedang dibaca, jawab pertanyaan seputar isi buku,',
  'beri rekomendasi buku serupa, dan dorong kebiasaan membaca.',
  'Selalu jawab dalam Bahasa Indonesia, ringkas namun informatif.',
].join(' ');

const chatSchema = z.object({
  message: z.string().min(1).max(4_000),
  bookTitle: z.string().max(200).optional(),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1).max(4_000),
      }),
    )
    .max(12)
    .optional(),
});

// ---------------------------------------------------------------------------
// POST /v1/ai/chat — free-form assistant chat (stateless per request)
// ---------------------------------------------------------------------------

ai.post('/chat', zValidator('json', chatSchema), async (c) => {
  const { message, bookTitle, history } = c.req.valid('json');

  const context = bookTitle ? `Buku yang sedang dibaca: "${bookTitle}".\n` : '';

  const messages = [
    { role: 'system' as const, content: CHAT_SYSTEM_PROMPT },
    ...(history ?? []),
    { role: 'user' as const, content: `${context}${message}` },
  ];

  try {
    const response = await c.env.AI.run('@cf/meta/llama-3-8b-instruct', { messages });
    const reply = (response as { response: string }).response;
    return c.json({ reply });
  } catch (err) {
    console.error('AI chat error:', err);
    return c.json({ error: 'AI service unavailable, coba lagi nanti' }, 502);
  }
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

ai.post('/summarize', zValidator('json', summarySchema), async (c) => {
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

  try {
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
  } catch (err) {
    console.error('AI summarize error:', err);
    return c.json({ error: 'AI service unavailable, coba lagi nanti' }, 502);
  }
});

export default ai;
