'use server';

import { revalidatePath } from 'next/cache';
import { getAdminUser } from '@/lib/publisher-auth';
import { setPlatformSetting } from '@/lib/platform-settings';

export type RoyaltySettingsState = {
  ok: boolean;
  message: string;
};

export async function saveRoyaltySettings(
  _previousState: RoyaltySettingsState,
  formData: FormData,
): Promise<RoyaltySettingsState> {
  await getAdminUser();

  const poolValue = String(formData.get('monthlyPool') ?? '').trim();
  const rateValue = String(formData.get('rateBps') ?? '').trim();
  const monthlyPool = Number(poolValue);
  const rateBps = Number(rateValue);

  if (!/^\d+$/.test(poolValue) || !Number.isSafeInteger(monthlyPool)) {
    return { ok: false, message: 'Pool bulanan harus berupa bilangan bulat IDR.' };
  }
  if (!/^\d+$/.test(rateValue) || !Number.isInteger(rateBps) || rateBps > 10000) {
    return { ok: false, message: 'Persentase penerbit harus antara 0 dan 10000 basis poin.' };
  }

  await setPlatformSetting('royalty_monthly_pool', String(monthlyPool));
  await setPlatformSetting('royalty_rate_bps', String(rateBps));
  revalidatePath('/admin/settings');
  revalidatePath('/publisher/dashboard');
  return { ok: true, message: 'Pengaturan royalti tersimpan.' };
}
