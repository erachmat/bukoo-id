import type { Config } from 'drizzle-kit';

export default {
  schema: './src/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  // D1 is SQLite under the hood; drizzle-kit generates standard SQLite migrations
} satisfies Config;
