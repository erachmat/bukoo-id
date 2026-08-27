import { eq } from 'drizzle-orm';
import { platformSettings } from '@bukoo/db';
import { getDb } from '@/lib/db';

export async function getPlatformSetting(key: string): Promise<string | null> {
  const row = await getDb().query.platformSettings.findFirst({
    where: eq(platformSettings.key, key),
  });
  return row?.value ?? null;
}

export async function setPlatformSetting(key: string, value: string): Promise<void> {
  const now = new Date().toISOString();
  await getDb()
    .insert(platformSettings)
    .values({ key, value, updatedAt: now })
    .onConflictDoUpdate({
      target: platformSettings.key,
      set: { value, updatedAt: now },
    });
}
