import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';
import { readingGoals, readingStreaks, readingProgress } from '@bukoo/db';
import { createDb } from '../db/index.js';
import { authMiddleware } from '../middleware/auth.js';
import { createId } from '../lib/cuid.js';
import type { Env } from '../types/env.js';

const goals = new Hono<{ Bindings: Env }>();
goals.use('*', authMiddleware);

// ---------------------------------------------------------------------------
// GET /v1/goals — get or auto-create reading goal
// ---------------------------------------------------------------------------

goals.get('/', async (c) => {
  const db = createDb(c.env.DB);
  const userId = c.get('userId');

  let goal = await db.query.readingGoals.findFirst({ where: eq(readingGoals.userId, userId) });
  if (!goal) {
    const id = createId();
    await db.insert(readingGoals).values({ id, userId, dailyGoalMinutes: 5 });
    goal = await db.query.readingGoals.findFirst({ where: eq(readingGoals.userId, userId) });
  }

  return c.json(goal);
});

// ---------------------------------------------------------------------------
// PUT /v1/goals — upsert daily goal minutes
// ---------------------------------------------------------------------------

goals.put('/', zValidator('json', z.object({ dailyGoalMinutes: z.number().int().min(1).max(1440) })), async (c) => {
  const db = createDb(c.env.DB);
  const userId = c.get('userId');
  const { dailyGoalMinutes } = c.req.valid('json');

  const existing = await db.query.readingGoals.findFirst({ where: eq(readingGoals.userId, userId) });
  if (existing) {
    await db.update(readingGoals).set({ dailyGoalMinutes }).where(eq(readingGoals.userId, userId));
  } else {
    await db.insert(readingGoals).values({ id: createId(), userId, dailyGoalMinutes });
  }

  const updated = await db.query.readingGoals.findFirst({ where: eq(readingGoals.userId, userId) });
  return c.json(updated);
});

// ---------------------------------------------------------------------------
// POST /v1/goals/record — accumulate today's reading minutes
// ---------------------------------------------------------------------------

goals.post(
  '/record',
  zValidator('json', z.object({
    minutesRead: z.number().int().min(1),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  })),
  async (c) => {
    const db = createDb(c.env.DB);
    const userId = c.get('userId');
    const { minutesRead, date } = c.req.valid('json');

    const today = date ?? new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    const goal = await db.query.readingGoals.findFirst({ where: eq(readingGoals.userId, userId) })
      ?? { dailyGoalMinutes: 5 };

    const existing = await db.query.readingStreaks.findFirst({
      where: and(eq(readingStreaks.userId, userId), eq(readingStreaks.date, today)),
    });

    const total = (existing?.minutesRead ?? 0) + minutesRead;
    const goalMet = total >= goal.dailyGoalMinutes;

    if (existing) {
      await db
        .update(readingStreaks)
        .set({ minutesRead: total, goalMet })
        .where(and(eq(readingStreaks.userId, userId), eq(readingStreaks.date, today)));
    } else {
      await db.insert(readingStreaks).values({
        id: createId(),
        userId,
        date: today,
        minutesRead: total,
        goalMet,
      });
    }

    return c.json({ date: today, minutesRead: total, goalMet });
  },
);

// ---------------------------------------------------------------------------
// GET /v1/goals/streaks — per-day array for last N days (calendar)
// ---------------------------------------------------------------------------

goals.get('/streaks', zValidator('query', z.object({ days: z.coerce.number().int().min(1).max(365).default(7) })), async (c) => {
  const db = createDb(c.env.DB);
  const userId = c.get('userId');
  const { days } = c.req.valid('query');

  const today = new Date();
  const pastDate = new Date(today);
  pastDate.setUTCDate(today.getUTCDate() - (days - 1));

  const todayStr = today.toISOString().slice(0, 10);
  const pastDateStr = pastDate.toISOString().slice(0, 10);

  const rows = await db
    .select()
    .from(readingStreaks)
    .where(
      and(
        eq(readingStreaks.userId, userId),
        gte(readingStreaks.date, pastDateStr),
        lte(readingStreaks.date, todayStr),
      ),
    )
    .orderBy(readingStreaks.date);

  return c.json(rows);
});

// ---------------------------------------------------------------------------
// GET /v1/goals/streak/current — compute consecutive streak count
// ---------------------------------------------------------------------------

goals.get('/streak/current', async (c) => {
  const db = createDb(c.env.DB);
  const userId = c.get('userId');

  const allStreaks = await db
    .select()
    .from(readingStreaks)
    .where(eq(readingStreaks.userId, userId))
    .orderBy(desc(readingStreaks.date));

  let currentStreak = 0;
  const today = new Date().toISOString().slice(0, 10);

  const dates = allStreaks;
  let expectedDate = today;

  for (const row of dates) {
    if (row.date === expectedDate && row.goalMet) {
      currentStreak++;
      // Move expected date back by one day
      const d = new Date(expectedDate);
      d.setUTCDate(d.getUTCDate() - 1);
      expectedDate = d.toISOString().slice(0, 10);
    } else if (row.date === expectedDate && !row.goalMet) {
      // Gap — goal not met on this day
      break;
    } else if (row.date < expectedDate) {
      // Skip today if no entry yet; allow yesterday as start
      if (expectedDate === today) {
        const d = new Date(expectedDate);
        d.setUTCDate(d.getUTCDate() - 1);
        expectedDate = d.toISOString().slice(0, 10);
        // Re-check this row against yesterday
        if (row.date === expectedDate && row.goalMet) {
          currentStreak++;
          const d2 = new Date(expectedDate);
          d2.setUTCDate(d2.getUTCDate() - 1);
          expectedDate = d2.toISOString().slice(0, 10);
        } else {
          break;
        }
      } else {
        break;
      }
    }
  }

  return c.json({ currentStreak });
});

// ---------------------------------------------------------------------------
// GET /v1/goals/books-this-year
// ---------------------------------------------------------------------------

goals.get('/books-this-year', async (c) => {
  const db = createDb(c.env.DB);
  const userId = c.get('userId');

  const year = new Date().getFullYear();
  const startOfYear = `${year}-01-01T00:00:00.000Z`;
  const endOfYear = `${year}-12-31T23:59:59.999Z`;

  const result = await db
    .selectDistinct({ bookId: readingProgress.bookId })
    .from(readingProgress)
    .where(
      and(
        eq(readingProgress.userId, userId),
        sql`${readingProgress.progressPercent} = 100`,
        gte(readingProgress.updatedAt, startOfYear),
        lte(readingProgress.updatedAt, endOfYear),
      ),
    );

  return c.json({ booksReadThisYear: result.length });
});

export default goals;
