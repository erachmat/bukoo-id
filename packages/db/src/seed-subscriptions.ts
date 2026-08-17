/**
 * Seed script for `subscription_plans` (v1, web-only monetization).
 *
 * Tiers must map to `TIER_ORDER` in @bukoo/shared-types and to the
 * `books.subscriptionRequired` values: FREE | PELAJAR | PERSONAL | PLUS | FAMILY.
 *
 * Plan IDs follow the existing `plan_<TIER>` convention so
 * `planId.replace('plan_','').toUpperCase()` yields the tier everywhere.
 *
 * Usage (against local/dev D1, review before prod):
 *   npx tsx packages/db/src/seed-subscriptions.ts
 *
 * For remote D1, extract the INSERT ... ON CONFLICT SQL and run via:
 *   npx wrangler d1 execute bukoo-db --remote --command="..."
 * (never run migrations/seeds directly against production without review)
 */
import { drizzle } from 'drizzle-orm/d1';
import type { D1Database } from '@cloudflare/workers-types';
import { subscriptionPlans } from './schema.js';
import { sql } from 'drizzle-orm';

export const SEED_PLANS = [
  {
    id: 'plan_BACA',
    name: 'BACA',
    priceMonthly: 29900,
    priceYearly: 289000,
    currency: 'IDR',
    trialDays: 7,
    features: JSON.stringify([
      '2.000+ judul kurasi',
      'Koleksi lokal penuh',
      'Offline 10 judul',
      'Tanpa iklan',
    ]),
    isPopular: false,
    isActive: true,
  },
  {
    id: 'plan_PLUS',
    name: 'PLUS',
    priceMonthly: 49900,
    priceYearly: 499000,
    currency: 'IDR',
    trialDays: 7,
    features: JSON.stringify([
      '2000+ judul + Audiobook',
      'Audiobook Indonesia',
      'Offline Unlimited',
      'AI Rekomendasi',
      'Komunitas penuh',
    ]),
    isPopular: true,
    isActive: true,
  },
  {
    id: 'plan_PERSONAL',
    name: 'Premium',
    priceMonthly: 79900,
    priceYearly: 799000,
    currency: 'IDR',
    trialDays: 7,
    features: JSON.stringify([
      'Seluruh katalog global',
      '3 kredit buku terbaru',
      'AI Companion penuh',
      'BUKOO Originals',
      'Priority support',
    ]),
    isPopular: false,
    isActive: true,
  },
  {
    id: 'plan_FAMILY',
    name: 'Keluarga',
    priceMonthly: 99900,
    priceYearly: 959000,
    currency: 'IDR',
    trialDays: 7,
    features: JSON.stringify([
      'Semua fitur Premium',
      '5 profil terpisah',
      'Konten anak & parental control',
      'Sharing buku keluarga',
      'Hemat 40% vs 5 akun Premium',
    ]),
    isPopular: false,
    isActive: true,
  },
];

/**
 * Upsert the seed plans into an existing D1 database (safe to run repeatedly).
 */
export async function seedSubscriptionPlans(db: ReturnType<typeof drizzle<{ schema: typeof import('./schema.js') }>>) {
  for (const plan of SEED_PLANS) {
    await db
      .insert(subscriptionPlans)
      .values(plan)
      .onConflictDoUpdate({
        target: subscriptionPlans.id,
        set: {
          name: plan.name,
          priceMonthly: plan.priceMonthly,
          priceYearly: plan.priceYearly,
          currency: plan.currency,
          trialDays: plan.trialDays,
          features: plan.features,
          isPopular: plan.isPopular,
          isActive: plan.isActive,
        },
      });
  }
}

/**
 * Print the equivalent raw SQL for manual review / remote execution.
 */
export function plansToSql(): string {
  const rows = SEED_PLANS.map((p) => {
    const vals = [
      `'${p.id}'`,
      `'${p.name}'`,
      String(p.priceMonthly),
      String(p.priceYearly),
      `'${p.currency}'`,
      String(p.trialDays),
      `'${p.features.replace(/'/g, "''")}'`,
      p.isPopular ? '1' : '0',
      p.isActive ? '1' : '0',
    ].join(', ');
    return `(${vals})`;
  });
  return `INSERT INTO subscription_plans (id, name, price_monthly, price_yearly, currency, trial_days, features, is_popular, is_active) VALUES\n${rows.join(',\n')}\nON CONFLICT(id) DO UPDATE SET\n  name=excluded.name,\n  price_monthly=excluded.price_monthly,\n  price_yearly=excluded.price_yearly,\n  currency=excluded.currency,\n  trial_days=excluded.trial_days,\n  features=excluded.features,\n  is_popular=excluded.is_popular,\n  is_active=excluded.is_active;`;
}