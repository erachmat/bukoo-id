import { auth } from '@/lib/auth';

export interface PublisherUser {
  id: string;
  name?: string | null;
  email?: string | null;
  role: string;
}

/**
 * Returns the authenticated publisher user, or throws if the session is not a
 * PUBLISHER. Every publisher server action/query must call this first so the
 * publisher ID is always derived from the session (never from user input).
 */
export async function getPublisherUser(): Promise<PublisherUser> {
  const session = await auth();
  const user = session?.user as (PublisherUser & { role?: string }) | undefined;
  if (!user || user.role !== 'PUBLISHER') {
    throw new Error('Unauthorized');
  }
  return user as PublisherUser;
}

/**
 * Returns the authenticated ADMIN user, or throws. Used by the admin review flow.
 */
export async function getAdminUser(): Promise<PublisherUser> {
  const session = await auth();
  const user = session?.user as (PublisherUser & { role?: string }) | undefined;
  if (!user || user.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }
  return user as PublisherUser;
}
