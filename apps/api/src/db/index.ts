import { drizzle } from 'drizzle-orm/d1';
import * as schema from '@bukoo/db';
import type { DrizzleD1Database } from 'drizzle-orm/d1';

export type Database = DrizzleD1Database<typeof schema>;

/**
 * Creates a Drizzle D1 database instance bound to the current request's D1 binding.
 *
 * Usage in a Hono route:
 *   const db = createDb(c.env.DB);
 *   const user = await db.query.users.findFirst({ where: eq(users.email, email) });
 */
export function createDb(d1: D1Database): Database {
  return drizzle(d1, { schema });
}
