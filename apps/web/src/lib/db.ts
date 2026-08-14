/**
 * apps/web Drizzle D1 HTTP client using sqlite-proxy
 *
 * apps/web runs on Vercel (Node.js/Edge). It accesses the Cloudflare D1 database
 * via Cloudflare's D1 REST API using Drizzle's `sqlite-proxy` driver.
 */
import { drizzle } from 'drizzle-orm/sqlite-proxy';
import * as schema from '@bukoo/db';

function getDb() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID;
  const token = process.env.CLOUDFLARE_D1_TOKEN;

  return drizzle(
    async (sql, params, method) => {
      if (!accountId || !databaseId || !token) {
        throw new Error(
          'Missing Cloudflare D1 env vars: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_D1_DATABASE_ID, CLOUDFLARE_D1_TOKEN',
        );
      }

      const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql, params }),
      });

      const data = (await response.json()) as {
        result: Array<{ results: Record<string, unknown>[] }>;
      };

      const results = data.result?.[0]?.results ?? [];

      if (method === 'all') {
        return { rows: results.map((row) => Object.values(row)) };
      }
      if (method === 'get') {
        return { rows: results[0] ? Object.values(results[0]) : [] };
      }
      return { rows: [] };
    },
    { schema },
  );
}

export const db = getDb();
