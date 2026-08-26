'use server';

import { revalidatePath } from 'next/cache';
import { getDb } from '@/lib/db';
import { notifications } from '@bukoo/db';
import { eq, and, isNull } from 'drizzle-orm';
import { getPublisherUser } from '@/lib/publisher-auth';

export async function getPublisherNotifications() {
  const user = await getPublisherUser();
  const db = getDb();
  const rows = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, user.id))
    .orderBy(notifications.createdAt)
    .limit(50);
  return rows.map((n) => ({
    id: n.id,
    kind: n.kind,
    title: n.title,
    body: n.body,
    createdAt: n.createdAt,
    read: !!n.readAt,
  }));
}

export async function markNotificationRead(id: string) {
  const user = await getPublisherUser();
  const db = getDb();
  await db
    .update(notifications)
    .set({ readAt: new Date().toISOString() })
    .where(and(eq(notifications.id, id), eq(notifications.userId, user.id)));
  revalidatePath('/publisher/dashboard');
}

export async function markAllNotificationsRead() {
  const user = await getPublisherUser();
  const db = getDb();
  await db
    .update(notifications)
    .set({ readAt: new Date().toISOString() })
    .where(eq(notifications.userId, user.id));
  revalidatePath('/publisher/dashboard');
}

export async function getUnreadNotificationCount() {
  const user = await getPublisherUser();
  const db = getDb();
  const rows = await db
    .select()
    .from(notifications)
    .where(and(eq(notifications.userId, user.id), isNull(notifications.readAt)));
  return rows.length;
}
