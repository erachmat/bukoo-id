import {
  defineWorkersConfig,
  readD1Migrations,
} from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig(async () => {
  const allMigrations = await readD1Migrations('../../packages/db/drizzle');
  return {
    test: {
      include: ['integration/reading-progress-sync.test.ts'],
      setupFiles: ['./integration/apply-migrations.ts'],
      pool: '@cloudflare/vitest-pool-workers' as const,
      poolOptions: {
        workers: {
          main: './src/index.ts',
          wrangler: { configPath: './wrangler.jsonc' },
          isolatedStorage: true,
          singleWorker: true,
          miniflare: {
            bindings: {
              JWT_SECRET: 'local-reading-sync-test-secret',
              TEST_MIGRATIONS: allMigrations,
            },
          },
        },
      },
    },
  };
});
