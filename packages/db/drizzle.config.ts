import type { Config } from 'drizzle-kit';

// NOTE: `schema` and `out` are resolved relative to the process CWD. Run
// drizzle-kit from `packages/db` (e.g. `npm run db:generate` in that package),
// NOT from apps/api — see the migrate-d1.yml workflow which `cd`s there.
export default {
  schema: './src/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  // D1 is SQLite under the hood; drizzle-kit generates standard SQLite migrations.
} satisfies Config;
