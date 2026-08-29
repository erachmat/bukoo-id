/**
 * Demo publisher seed generator (SQL emitter — no DB access).
 *
 * Emits idempotent SQL that populates a real demo publisher account
 * (`demo-publisher@bukoo.id`, registered manually via /publisher/register)
 * with 6 published books, ~60 days of reader/daily/geo metrics, payouts,
 * notifications and demo readers (FKs require real `users` rows).
 *
 * Usage:
 *   npx tsx packages/db/src/seed-demo-publisher.ts
 *     → writes packages/db/sql/seed-demo-publisher.sql + …unseed….sql
 *
 * Then (from apps/web, where wrangler is installed):
 *   npx wrangler d1 execute bukoo-db --remote --file=packages/db/sql/seed-demo-publisher.sql
 *
 * IMPORTANT (see AGENTS.md + repo memory):
 *  - NEVER emit books_fts DELETE/UPDATE — D1 throws SQLITE_ERROR 7500. The
 *    insert-only AFTER INSERT trigger handles FTS for free book INSERTs.
 *  - This is DATA seeding only — migrate-d1.yml is NOT involved.
 *  - Deterministic PRNG ⇒ two runs emit identical SQL ⇒ fully idempotent.
 */

/* eslint-disable no-console */

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const DEMO_PUBLISHER_EMAIL = 'demo-publisher@bukoo.id';
const PRNG_SEED = 20260828;
const WINDOW_DAYS = 60;

interface DemoBook {
  id: string;
  title: string;
  synopsis: string;
  genres: string[];
  tags: string[];
  language: 'ID' | 'EN';
  totalPages: number;
  publishedYear: number;
  subscriptionRequired: 'FREE' | 'PELAJAR' | 'PERSONAL' | 'PLUS' | 'FAMILY';
  coverKey: string;
  epubKey: string;
}

const DEMO_BOOKS: DemoBook[] = [
  {
    id: 'demo-1',
    title: 'Filsafat Ajaran Islam',
    synopsis:
      'Buku demo BUKOO. Tinjauan ringkas atas fondasi filsafat dalam tradsi keilmuan Islam, dari LOGOS hingga akal dan wahyu.',
    genres: ['Agama', 'Filsafat'],
    tags: ['demo', 'bukoo-demo'],
    language: 'ID',
    totalPages: 312,
    publishedYear: 2024,
    subscriptionRequired: 'FREE',
    coverKey: 'covers/demo-1-cover.jpg',
    epubKey: 'epubs/demo-1.epub',
  },
  {
    id: 'demo-2',
    title: 'Perlunya Seorang Imam',
    synopsis:
      'Buku demo BUKOO. Kajian praktis tentang tanggung jawab imam dalam keluarga dan masyarakat modern.',
    genres: ['Agama', 'Pendidikan'],
    tags: ['demo', 'bukoo-demo'],
    language: 'ID',
    totalPages: 264,
    publishedYear: 2024,
    subscriptionRequired: 'PELAJAR',
    coverKey: 'covers/demo-2-cover.jpg',
    epubKey: 'epubs/demo-2.epub',
  },
  {
    id: 'demo-3',
    title: 'Riwayat Rasulullah',
    synopsis:
      'Buku demo BUKOO. Searah sejarah kehidupan Rasulullah SAW dalam narasi yang mengalir dan mudah diikuti.',
    genres: ['Agama', 'Sejarah'],
    tags: ['demo', 'bukoo-demo'],
    language: 'ID',
    totalPages: 448,
    publishedYear: 2025,
    subscriptionRequired: 'FREE',
    coverKey: 'covers/demo-3-cover.jpg',
    epubKey: 'epubs/demo-3.epub',
  },
  {
    id: 'demo-4',
    title: 'Filsafat Ajaran Islam (Contoh Demo)',
    synopsis:
      'Edisi contoh untuk demonstrasi dasbor penerbit BUKOO. Konten sama dengan judul utama, diterbitkan sebagai paket premium.',
    genres: ['Agama', 'Filsafat'],
    tags: ['demo', 'bukoo-demo'],
    language: 'ID',
    totalPages: 312,
    publishedYear: 2025,
    subscriptionRequired: 'PERSONAL',
    coverKey: 'covers/demo-4-cover.jpg',
    epubKey: 'epubs/demo-4.epub',
  },
  {
    id: 'demo-5',
    title: 'Perlunya Seorang Imam (Contoh Demo)',
    synopsis:
      'Edisi contoh untuk demonstrasi dasbor penerbit BUKOO. Konten sama dengan judul utama, tersedia gratis.',
    genres: ['Agama', 'Pendidikan'],
    tags: ['demo', 'bukoo-demo'],
    language: 'ID',
    totalPages: 264,
    publishedYear: 2025,
    subscriptionRequired: 'FREE',
    coverKey: 'covers/demo-5-cover.jpg',
    epubKey: 'epubs/demo-5.epub',
  },
  {
    id: 'demo-6',
    title: 'Riwayat Rasulullah (Contoh Demo)',
    synopsis:
      'Edisi contoh untuk demonstrasi dasbor penerbit BUKOO. Paket langganan PLUS.',
    genres: ['Agama', 'Sejarah'],
    tags: ['demo', 'bukoo-demo'],
    language: 'EN',
    totalPages: 448,
    publishedYear: 2025,
    subscriptionRequired: 'PLUS',
    coverKey: 'covers/demo-6-cover.jpg',
    epubKey: 'epubs/demo-6.epub',
  },
];

const READER_COUNT = 24;
/** ISO-3166-1 alpha-2 per reader; index i (0-based) → COUNTRIES[i % len]. */
const COUNTRIES = ['ID', 'ID', 'ID', 'ID', 'ID', 'ID', 'ID', 'ID', 'ID', 'ID', 'ID', 'ID', 'ID', 'ID', 'ID', 'ID', 'MY', 'SG', 'US', 'SA', 'AE', 'MY', 'XX', 'US'];
const FAVORITE_GENRES = ['["Agama"]', '["Fiksi","Agama"]', '["Sejarah"]', '["Pendidikan"]', '["Filsafat","Agama"]', '["Fiksi"]'];

interface DemoSubscription {
  readerIndex: number; // 0-based
  planId: string;
}

const DEMO_SUBSCRIPTIONS: DemoSubscription[] = [
  { readerIndex: 0, planId: 'plan_BACA' },
  { readerIndex: 1, planId: 'plan_PERSONAL' },
  { readerIndex: 2, planId: 'plan_PLUS' },
  { readerIndex: 3, planId: 'plan_FAMILY' },
  { readerIndex: 6, planId: 'plan_PERSONAL' },
  { readerIndex: 8, planId: 'plan_PERSONAL' },
  { readerIndex: 10, planId: 'plan_PLUS' },
  { readerIndex: 12, planId: 'plan_BACA' },
  { readerIndex: 14, planId: 'plan_PLUS' },
  { readerIndex: 17, planId: 'plan_PERSONAL' },
  { readerIndex: 19, planId: 'plan_PLUS' },
  { readerIndex: 21, planId: 'plan_FAMILY' },
];

// ---------------------------------------------------------------------------
// Deterministic PRNG (mulberry32) — stable across runs
// ---------------------------------------------------------------------------

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Date helpers (UTC, 'YYYY-MM-DD' text — matches publisher-metrics.ts)
// ---------------------------------------------------------------------------

function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(base: Date, days: number): Date {
  return new Date(base.getTime() + days * 86_400_000);
}

function utcDayInMonth(base: Date, day: number): Date {
  return new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), day));
}

/** Earliest UTC date of the 60-day window (WINDOW_DAYS - 1 days before yesterday's end). */
export function windowStart(now: Date): Date {
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  return addDays(today, -(WINDOW_DAYS - 1));
}

// ---------------------------------------------------------------------------
// Reading-schedule generation
// ---------------------------------------------------------------------------

interface ReaderDay {
  bookId: string;
  readerNumber: number; // 1..READER_COUNT
  dayOffset: number; // 0..WINDOW_DAYS-1 (0 = oldest)
  seconds: number;
  completed: boolean;
}

/** Loyalty profile per global reader index: 0 = casual (1–4 days), 1 = habitual (10–30 days). */
function isHabitualReader(readerNumber: number, pick: number): boolean {
  return (readerNumber + pick) % 5 === 0; // deterministic spread across readers/books
}

/**
 * Generates the reader-day schedule used for ALL five the metric tables,
 * guaranteeing read_starts /_SECONDS/count sums are mutually consistent.
 */
export function buildSchedule(now: Date): ReaderDay[] {
  const prng = mulberry32(PRNG_SEED);
  const rows: ReaderDay[] = [];
  for (const book of DEMO_BOOKS) {
    const readerPool = 8 + Math.floor(prng() * 7); // 8–14 distinct readers/book
    const pop = (bookIndex: number, r: number): number => ((bookIndex * 7 + r * 11) % READER_COUNT) + 1;
    const seen = new Map<number, number>();
    let r = 0;
    while (seen.size < readerPool) {
      const readerNumber = pop(DEMO_BOOKS.indexOf(book), r++);
      if (!seen.has(readerNumber)) seen.set(readerNumber, r - 1);
    }
    for (const [readerNumber, pick] of seen) {
      const habitual = isHabitualReader(readerNumber, pick);
      const activeDays = habitual ? 10 + Math.floor(prng() * 21) : 1 + Math.floor(prng() * 4);
      const chosen = new Set<number>();
      while (chosen.size < activeDays) chosen.add(Math.floor(prng() * WINDOW_DAYS));
      const daysSorted = [...chosen].sort((a, b) => a - b);
      const lastDay = daysSorted[daysSorted.length - 1];
      const willComplete = habitual && daysSorted.length >= 8 && prng() < 0.5;
      for (const dayOffset of daysSorted) {
        const baseSeconds = 600 + Math.floor(prng() * 5400);
        const seconds = dayOffset === lastDay && willComplete ? baseSeconds + 900 : baseSeconds;
        rows.push({ bookId: book.id, readerNumber, dayOffset, seconds, completed: dayOffset === lastDay && willComplete });
      }
    }
  }
  return rows;
}

// ---------------------------------------------------------------------------
// SQL helpers
// ---------------------------------------------------------------------------

function q(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

function nullableOr(value: string | null, fallback = 'NULL'): string {
  return value === null ? fallback : q(value);
}

// ---------------------------------------------------------------------------
// Seed SQL
// ---------------------------------------------------------------------------

export function buildDemoSeedSql(now: Date = new Date()): string {
  const stmts: string[] = [];
  const winStart = windowStart(now);
  const schedule = buildSchedule(now);

  const publisherIdExpr = `(SELECT id FROM users WHERE email = ${q(DEMO_PUBLISHER_EMAIL)})`;

  // 1) Demo READERS (users) — inserted first so table FKs resolve. Re-runs upsert.
  for (let i = 1; i <= READER_COUNT; i++) {
    const id = `demo-reader-${i}`;
    const name = `Demo Pembaca ${i}`;
    const email = `demo-reader-${i}@demo.bukoo.id`;
    const genres = FAVORITE_GENRES[i % FAVORITE_GENRES.length];
    stmts.push(
      `INSERT INTO users (id, email, name, role, favorite_genres) VALUES (${q(id)}, ${q(email)}, ${q(name)}, 'USER', ${q(genres)}) ` +
        `ON CONFLICT(id) DO UPDATE SET email = excluded.email, name = excluded.name, role = 'USER', favorite_genres = excluded.favorite_genres;`,
    );
  }

  // 2) DEMO_SUBSCRIPTIONS — premium-insights tab.
  const periodStart = isoDay(addDays(now, -30));
  const periodEnd = isoDay(addDays(now, 335));
  DEMO_SUBSCRIPTIONS.forEach((sub, idx) => {
    const id = `demo-subscription-${idx + 1}`;
    const userId = `demo-reader-${sub.readerIndex + 1}`;
    stmts.push(
      `INSERT INTO subscriptions (id, user_id, plan_id, status, current_period_start, current_period_end, cancel_at_period_end) ` +
        `VALUES (${q(id)}, ${q(userId)}, ${q(sub.planId)}, 'ACTIVE', ${q(periodStart)}, ${q(periodEnd)}, 0) ` +
        `ON CONFLICT(id) DO UPDATE SET plan_id = excluded.plan_id, status = 'ACTIVE', current_period_start = excluded.current_period_start, current_period_end = excluded.current_period_end;`,
    );
  });

  // 3) BOOKS — FK publisher_user_id resolved via subquery (pre-flight check required).
  for (const b of DEMO_BOOKS) {
    const totalSeconds = schedule.filter((s) => s.bookId === b.id).reduce((acc, s) => acc + s.seconds, 0);
    const readCount = schedule.filter((s) => s.bookId === b.id).length;
    const readMinutes = Math.floor(totalSeconds / 60);
    const createdAt = `${isoDay(winStart)}T00:00:00.000Z`;
    stmts.push(
      `INSERT INTO books (id, title, author, publisher, synopsis, genre, tags, language, total_pages, read_count, read_time_minutes, is_published, publication_status, subscription_required, publisher_user_id, cover_key, epub_key, featured, created_at, updated_at) ` +
        `VALUES (${q(b.id)}, ${q(b.title)}, 'BUKOO Demo', 'BUKOO Demo Press', ${q(b.synopsis)}, ${q(JSON.stringify(b.genres))}, ${q(JSON.stringify(b.tags))}, '${b.language}', ${b.totalPages}, ${readCount}, ${readMinutes}, 1, 'PUBLISHED', '${b.subscriptionRequired}', ${publisherIdExpr}, ${q(b.coverKey)}, ${q(b.epubKey)}, 0, ${q(createdAt)}, ${q(`${isoDay(now)}T00:00:00.000Z`)}) ` +
        `ON CONFLICT(id) DO UPDATE SET title = excluded.title, author = excluded.author, publisher = excluded.publisher, synopsis = excluded.synopsis, genre = excluded.genre, tags = excluded.tags, language = excluded.language, total_pages = excluded.total_pages, read_count = excluded.read_count, read_time_minutes = excluded.read_time_minutes, is_published = 1, publication_status = 'PUBLISHED', subscription_required = excluded.subscription_required, publisher_user_id = excluded.publisher_user_id, cover_key = excluded.cover_key, epub_key = excluded.epub_key, updated_at = excluded.updated_at;`,
    );
  }

  // 4) publisher_book_reader_days — PK (book_id, user_id, read_date).
  const byBookDate = new Map<string, { starts: number; seconds: number; completed: number }>();
  const byBookDateCountry = new Map<string, number>();
  for (const s of schedule) {
    const day = isoDay(addDays(winStart, s.dayOffset));
    const readerId = `demo-reader-${s.readerNumber}`;
    const firstAt = `${day}T02:00:00.000Z`;
    const lastAt = `${day}T08:${String((s.readerNumber * 3) % 60).padStart(2, '0')}:00.000Z`;
    stmts.push(
      `INSERT INTO publisher_book_reader_days (book_id, user_id, read_date, first_read_at, last_read_at) ` +
        `VALUES (${q(s.bookId)}, ${q(readerId)}, ${q(day)}, ${q(firstAt)}, ${q(lastAt)}) ` +
        `ON CONFLICT(book_id, user_id, read_date) DO UPDATE SET first_read_at = excluded.first_read_at, last_read_at = excluded.last_read_at;`,
    );
    const key = `${s.bookId}|${day}`;
    const agg = byBookDate.get(key) ?? { starts: 0, seconds: 0, completed: 0 };
    agg.starts += 1;
    agg.seconds += s.seconds;
    agg.completed += s.completed ? 1 : 0;
    byBookDate.set(key, agg);
    const cKey = `${key}|${COUNTRIES[(s.readerNumber - 1) % COUNTRIES.length]}`;
    byBookDateCountry.set(cKey, (byBookDateCountry.get(cKey) ?? 0) + 1);
  }

  // 5) publisher_book_daily_metrics — unique (book_id, metric_date).
  for (const [key, agg] of byBookDate) {
    const [bookId, day] = key.split('|');
    const id = `demo-dm-${bookId}-${day}`;
    stmts.push(
      `INSERT INTO publisher_book_daily_metrics (id, book_id, metric_date, read_starts, completed_reads, reading_seconds, created_at, updated_at) ` +
        `VALUES (${q(id)}, ${q(bookId)}, ${q(day)}, ${agg.starts}, ${agg.completed}, ${agg.seconds}, ${q(`${day}T23:59:00.000Z`)}, ${q(`${day}T23:59:00.000Z`)}) ` +
        `ON CONFLICT(book_id, metric_date) DO UPDATE SET read_starts = excluded.read_starts, completed_reads = excluded.completed_reads, reading_seconds = excluded.reading_seconds, updated_at = excluded.updated_at;`,
    );
  }

  // 6) publisher_book_country_metrics — unique (book_id, metric_date, country_code).
  for (const [key, readerDays] of byBookDateCountry) {
    const [bookId, day, country] = key.split('|');
    const id = `demo-cm-${bookId}-${day}-${country}`;
    stmts.push(
      `INSERT INTO publisher_book_country_metrics (id, book_id, metric_date, country_code, reader_days, created_at, updated_at) ` +
        `VALUES (${q(id)}, ${q(bookId)}, ${q(day)}, ${q(country)}, ${readerDays}, ${q(`${day}T23:59:00.000Z`)}, ${q(`${day}T23:59:00.000Z`)}) ` +
        `ON CONFLICT(book_id, metric_date, country_code) DO UPDATE SET reader_days = excluded.reader_days, updated_at = excluded.updated_at;`,
    );
  }

  // 7) publisher_payouts — 1 PAID (last month), 1 SCHEDULED (this month).
  const periodAnchor = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const lastMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 15));
  stmts.push(
    `INSERT INTO publisher_payouts (id, publisher_user_id, amount, currency, status, scheduled_at, processed_at, external_ref) ` +
      `VALUES ('demo-payout-1', ${publisherIdExpr}, 4250000, 'IDR', 'PAID', ${q(`${isoDay(lastMonth)}T09:00:00.000Z`)}, ${q(`${isoDay(lastMonth)}T15:30:00.000Z`)}, ${q('DEMO-TRX-0001')}) ` +
      `ON CONFLICT(id) DO UPDATE SET amount = excluded.amount, status = 'PAID', processed_at = excluded.processed_at, external_ref = excluded.external_ref;`,
  );
  stmts.push(
    `INSERT INTO publisher_payouts (id, publisher_user_id, amount, currency, status, scheduled_at, processed_at, external_ref) ` +
      `VALUES ('demo-payout-2', ${publisherIdExpr}, 3800000, 'IDR', 'SCHEDULED', ${q(`${isoDay(utcDayInMonth(periodAnchor, 1))}T09:00:00.000Z`)}, NULL, NULL) ` +
      `ON CONFLICT(id) DO UPDATE SET amount = excluded.amount, status = 'SCHEDULED', processed_at = NULL, external_ref = NULL;`,
  );

  // 8) notifications for the demo publisher.
  const notes: Array<{ id: string; kind: string; title: string; body: string; daysAgo: number }> = [
    { id: 'demo-note-1', kind: 'payout', title: 'Settlement dibayar', body: 'Pembayaran royalti sebesar Rp 4.250.000 telah diproses (ref DEMO-TRX-0001).', daysAgo: 5 },
    { id: 'demo-note-2', kind: 'review', title: 'Buku disetujui', body: 'Riwayat Rasulullah telah lolos review dan kini tayang di katalog.', daysAgo: 12 },
    { id: 'demo-note-3', kind: 'campaign', title: 'Kampanye promosi', body: 'Permintaan kampanye "Pameran Baca Agustus" telah dikirim untuk review admin.', daysAgo: 3 },
    { id: 'demo-note-4', kind: 'milestone', title: 'Milestone pembaca', body: 'Filsafat Ajaran Islam menembus 100 pembaca unik bulan ini!', daysAgo: 1 },
  ];
  for (const n of notes) {
    const createdAt = `${isoDay(addDays(now, -n.daysAgo))}T10:00:00.000Z`;
    stmts.push(
      `INSERT INTO notifications (id, user_id, kind, title, body, data, read_at, created_at) ` +
        `VALUES (${q(n.id)}, ${publisherIdExpr}, ${q(n.kind)}, ${q(n.title)}, ${q(n.body)}, NULL, ${nullableOr(null)}, ${q(createdAt)}) ` +
        `ON CONFLICT(id) DO UPDATE SET title = excluded.title, body = excluded.body, created_at = excluded.created_at;`,
    );
  }

  // 9) platform_settings — DO NOTHING: never clobber genuinely-configured values.
  stmts.push(
    `INSERT INTO platform_settings (key, value) VALUES ('royalty_monthly_pool', '75000000') ON CONFLICT(key) DO NOTHING;`,
  );
  stmts.push(
    `INSERT INTO platform_settings (key, value) VALUES ('royalty_rate_bps', '6500') ON CONFLICT(key) DO NOTHING;`,
  );

  return stmts.join('\n') + '\n';
}

// ---------------------------------------------------------------------------
// Unseed SQL
// ---------------------------------------------------------------------------

export function buildDemoUnseedSql(): string {
  return [
    `DELETE FROM publisher_book_reader_days WHERE book_id IN (SELECT id FROM books WHERE id IN ('demo-1','demo-2','demo-3','demo-4','demo-5','demo-6'));`,
    `DELETE FROM publisher_book_daily_metrics WHERE book_id IN (SELECT id FROM books WHERE id IN ('demo-1','demo-2','demo-3','demo-4','demo-5','demo-6'));`,
    `DELETE FROM publisher_book_country_metrics WHERE book_id IN (SELECT id FROM books WHERE id IN ('demo-1','demo-2','demo-3','demo-4','demo-5','demo-6'));`,
    `DELETE FROM books WHERE id IN ('demo-1','demo-2','demo-3','demo-4','demo-5','demo-6');`,
    `DELETE FROM subscriptions WHERE id LIKE 'demo-subscription-%';`,
    `DELETE FROM publisher_payouts WHERE id LIKE 'demo-payout-%';`,
    `DELETE FROM notifications WHERE id LIKE 'demo-note-%';`,
    `DELETE FROM users WHERE id LIKE 'demo-reader-%';`,
    `-- NOTE: orphan books_fts rows from the deleted demo books are EXPECTED and harmless;`,
    `-- the search JOIN filters is_published = 1 (D1 forbids FTS DELETE).`,
    `-- platform_settings deliberately left untouched.`,
  ].join('\n') + '\n';
}

// ---------------------------------------------------------------------------
// CLI entry (tsx / node) — writes SQL files and prints the runbook
// ---------------------------------------------------------------------------

const invokedDirectly = process.argv[1] !== undefined && process.argv[1].includes('seed-demo-publisher');
if (invokedDirectly) {
  // npm workspace scripts run with cwd = packages/db; repo-root invocation also supported.
  const cwd = process.cwd();
  const atWorkspaceRoot = cwd.endsWith('packages/db') || cwd.endsWith('packages/db/');
  const sqlDir = atWorkspaceRoot ? 'sql' : join('packages', 'db', 'sql');
  const seedSql = buildDemoSeedSql();
  const unseedSql = buildDemoUnseedSql();
  mkdirSync(sqlDir, { recursive: true });
  writeFileSync(join(sqlDir, 'seed-demo-publisher.sql'), seedSql);
  writeFileSync(join(sqlDir, 'unseed-demo-publisher.sql'), unseedSql);
  console.log('Wrote packages/db/sql/seed-demo-publisher.sql and unseed-demo-publisher.sql (deterministic, idempotent).');
    console.log('\nPRE-FLIGHT — ensure the demo publisher exists (register via https://bukoo.id/publisher/register first):');
    console.log(`  npx wrangler d1 execute bukoo-db --remote --command="SELECT id, email, role FROM users WHERE email = '${DEMO_PUBLISHER_EMAIL}'"`);
    console.log('\nAPPLY (data seed — NOT a schema migration; migrate-d1.yml not involved), from apps/web:');
    console.log('  npx wrangler d1 execute bukoo-db --remote --file=packages/db/sql/seed-demo-publisher.sql');
    console.log('\nVERIFY afterwards:');
    console.log(`  npx wrangler d1 execute bukoo-db --remote --command="SELECT (SELECT count(*) FROM books WHERE id LIKE 'demo-%') AS books, (SELECT count(*) FROM publisher_book_daily_metrics WHERE book_id LIKE 'demo-%') AS daily, (SELECT count(*) FROM publisher_book_country_metrics WHERE book_id LIKE 'demo-%') AS geo, (SELECT count(*) FROM publisher_book_reader_days WHERE book_id LIKE 'demo-%') AS reader_days"`);
    console.log('  npx wrangler d1 execute bukoo-db --remote --command="SELECT title FROM books JOIN books_fts ON books_fts.rowid = books.rowid WHERE books_fts MATCH \'demo\'"');
  console.log('\nTEARDOWN, if ever needed:');
  console.log('  npx wrangler d1 execute bukoo-db --remote --file=packages/db/sql/unseed-demo-publisher.sql');
}
