'use server';

import { revalidatePath } from 'next/cache';
import { publisherCampaignRequests, notifications } from '@bukoo/db';
import { and, eq, inArray } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { getAdminUser } from '@/lib/publisher-auth';
import { getDb } from '@/lib/db';

export async function reviewCampaign(campaignId: string, decision: 'APPROVED' | 'REJECTED', note: string) {
  const admin = await getAdminUser();
  const db = getDb();
  const campaign = await db.query.publisherCampaignRequests.findFirst({ where: eq(publisherCampaignRequests.id, campaignId) });
  if (!campaign || !['SUBMITTED', 'IN_REVIEW'].includes(campaign.status)) throw new Error('Kampanye tidak tersedia untuk ditinjau.');
  const now = new Date().toISOString();
  await db.update(publisherCampaignRequests).set({ status: decision, reviewerUserId: admin.id, reviewNote: note.trim() || null, reviewedAt: now, updatedAt: now }).where(and(eq(publisherCampaignRequests.id, campaignId), inArray(publisherCampaignRequests.status, ['SUBMITTED', 'IN_REVIEW'])));
  await db.insert(notifications).values({ id: createId(), userId: campaign.publisherUserId, kind: 'campaign_review', title: decision === 'APPROVED' ? 'Pengajuan promosi disetujui' : 'Pengajuan promosi ditolak', body: note.trim() || `Pengajuan kampanye Anda telah ${decision === 'APPROVED' ? 'disetujui' : 'ditolak'}.`, entityType: 'campaign', entityId: campaignId });
  revalidatePath('/admin/campaigns');
  revalidatePath('/publisher/promotions');
}