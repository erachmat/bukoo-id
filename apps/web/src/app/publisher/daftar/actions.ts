'use server';

import { revalidatePath } from 'next/cache';
import { notifications, users } from '@bukoo/db';
import { eq } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { getDb } from '@/lib/db';
import { headers } from 'next/headers';
import {
  checkRateLimit,
  d1LimiterStorage,
  getRequestIp,
  RATE_LIMIT_POLICIES,
  rateLimitKey,
  recordFailure,
} from '@/lib/rate-limit';

const limiter = d1LimiterStorage();

export type PublisherLeadState = { ok: boolean; message: string };

export async function submitPublisherLead(
  _previousState: PublisherLeadState,
  formData: FormData,
): Promise<PublisherLeadState> {
  const fields = {
    company: String(formData.get('company') ?? '').trim(),
    contact: String(formData.get('contact') ?? '').trim(),
    position: String(formData.get('position') ?? '').trim(),
    email: String(formData.get('email') ?? '').trim(),
    whatsapp: String(formData.get('whatsapp') ?? '').trim(),
    titleCount: String(formData.get('titleCount') ?? '').trim(),
    genre: String(formData.get('genre') ?? '').trim(),
    message: String(formData.get('message') ?? '').trim(),
  };
  if (!fields.company || !fields.contact || !fields.position || !fields.email || !fields.whatsapp || !fields.titleCount || !fields.genre) {
    return { ok: false, message: 'Lengkapi kolom wajib terlebih dahulu.' };
  }
  if (fields.company.length > 160 || fields.contact.length > 120 || fields.email.length > 254 || fields.whatsapp.length > 40 || fields.message.length > 2000) {
    return { ok: false, message: 'Salah satu kolom terlalu panjang.' };
  }
  if (!/^\S+@\S+\.\S+$/.test(fields.email)) {
    return { ok: false, message: 'Masukkan alamat email yang valid.' };
  }

  try {
    const requestIp = await getRequestIp(await headers());
    const ipKey = rateLimitKey('publisherLeadIp', 'ip', requestIp);
    const now = Date.now();
    const rateLimit = await checkRateLimit(limiter, now, ipKey);
    if (!rateLimit.allowed) {
      return { ok: false, message: 'Terlalu banyak pengajuan dari jaringan ini. Silakan coba lagi nanti.' };
    }

    // Count every valid submission attempt, including ones that later fail to persist.
    await recordFailure(limiter, now, RATE_LIMIT_POLICIES.publisherLeadIp, ipKey);

    const db = getDb();
    const admins = await db.select({ id: users.id }).from(users).where(eq(users.role, 'ADMIN'));
    if (admins.length === 0) {
      return { ok: false, message: 'Pengajuan belum dapat diterima. Silakan coba lagi nanti.' };
    }

    const body = [
      `Perusahaan: ${fields.company}`,
      `PIC: ${fields.contact}${fields.position ? ` (${fields.position})` : ''}`,
      `Email: ${fields.email}`,
      `WhatsApp: ${fields.whatsapp}`,
      `Perkiraan judul: ${fields.titleCount}`,
      `Genre: ${fields.genre}`,
      fields.message ? `Pesan: ${fields.message}` : '',
    ].filter(Boolean).join('\n');
    await db.insert(notifications).values(admins.map((admin) => ({
      id: createId(),
      userId: admin.id,
      kind: 'publisher_lead',
      title: 'Pengajuan kemitraan penerbit baru',
      body,
      entityType: 'publisher_lead',
      entityId: fields.email,
    })));
  } catch {
    // Avoid logging submitted contact details or database error payloads.
    console.error('[publisher-lead] Submission could not be persisted.');
    return { ok: false, message: 'Pengajuan belum dapat diproses. Silakan coba lagi beberapa saat.' };
  }

  revalidatePath('/admin');
  return { ok: true, message: 'Pengajuan terkirim. Tim kemitraan BUKOO akan menghubungi Anda.' };
}
