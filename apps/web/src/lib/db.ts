/**
 * apps/web Drizzle D1 client bound to the Cloudflare D1 database.
 *
 * apps/web runs on Cloudflare Workers (via @opennextjs/cloudflare). The D1
 * binding `DB` is exposed through getCloudflareContext() during request
 * handling (server components / server actions / route handlers).
 *
 * Do NOT export a module-level `db` instance — bindings are only available
 * during a request, so call getDb() inside the request scope (this is also
 * what keeps each request on a fresh, request-scoped Drizzle handle).
 */
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import type { D1Database } from '@cloudflare/workers-types';
import * as schema from '@bukoo/db';

export type Database = DrizzleD1Database<typeof schema>;

export function getDb(): Database {
  const { env } = getCloudflareContext();
  return drizzle(env.DB as D1Database, { schema });
}
