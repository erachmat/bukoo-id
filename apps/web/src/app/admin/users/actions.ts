'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { users } from '@bukoo/db';
import { eq } from 'drizzle-orm';

export async function updateUserRole(userId: string, role: string) {
  await db.update(users).set({ role }).where(eq(users.id, userId));
  revalidatePath('/admin/users');
}

export async function deleteUser(userId: string) {
  await db.delete(users).where(eq(users.id, userId));
  revalidatePath('/admin/users');
}
