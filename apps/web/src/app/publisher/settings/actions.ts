'use server';

import { revalidatePath } from 'next/cache';
import { getDb } from '@/lib/db';
import { publisherProfiles, publisherPayoutAccounts } from '@bukoo/db';
import { eq } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { getPublisherUser } from '@/lib/publisher-auth';

export async function updatePublisherProfile(formData: FormData) {
  const user = await getPublisherUser();
  const db = getDb();

  const displayName = (formData.get('displayName') as string)?.trim() || null;
  const legalName = (formData.get('legalName') as string)?.trim() || null;
  const contactEmail = (formData.get('contactEmail') as string)?.trim() || null;
  const contactPhone = (formData.get('contactPhone') as string)?.trim() || null;
  const website = (formData.get('website') as string)?.trim() || null;

  const existing = await db.query.publisherProfiles.findFirst({
    where: eq(publisherProfiles.userId, user.id),
  });

  if (existing) {
    await db
      .update(publisherProfiles)
      .set({
        displayName,
        legalName,
        contactEmail,
        contactPhone,
        website,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(publisherProfiles.id, existing.id));
  } else {
    await db.insert(publisherProfiles).values({
      id: createId(),
      userId: user.id,
      displayName,
      legalName,
      contactEmail,
      contactPhone,
      website,
    });
  }

  revalidatePath('/publisher/settings');
}

export async function savePayoutAccount(formData: FormData) {
  const user = await getPublisherUser();
  const db = getDb();

  const method = (formData.get('method') as string) || 'BANK';
  const bankCode = (formData.get('bankCode') as string)?.trim() || null;
  const accountHolderName = (formData.get('accountHolderName') as string)?.trim() || null;
  const accountNumber = (formData.get('accountNumber') as string)?.trim() || null;

  // Store only a masked reference — never the raw account number.
  const maskedAccount = accountNumber
    ? '••••' + accountNumber.slice(-4)
    : null;

  const existing = await db.query.publisherPayoutAccounts.findFirst({
    where: eq(publisherPayoutAccounts.publisherUserId, user.id),
  });

  if (existing) {
    await db
      .update(publisherPayoutAccounts)
      .set({
        method,
        bankCode,
        accountHolderName,
        maskedAccount,
        status: 'ACTIVE',
        updatedAt: new Date().toISOString(),
      })
      .where(eq(publisherPayoutAccounts.id, existing.id));
  } else {
    await db.insert(publisherPayoutAccounts).values({
      id: createId(),
      publisherUserId: user.id,
      method,
      bankCode,
      accountHolderName,
      maskedAccount,
      status: 'ACTIVE',
    });
  }

  revalidatePath('/publisher/settings');
}