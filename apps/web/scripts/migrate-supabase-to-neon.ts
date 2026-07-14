import { Client } from 'pg';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

// Load Env variables
const neonDbUrl = process.env.NEON_DATABASE_URL as string;
const supabaseDbUrl = process.env.SUPABASE_DATABASE_URL as string;

if (!process.env.NEON_DATABASE_URL) {
  console.error('❌ Error: NEON_DATABASE_URL environment variable is required. For safety, we do not fall back to DATABASE_URL.');
  process.exit(1);
}
if (!process.env.SUPABASE_DATABASE_URL) {
  console.error('❌ Error: SUPABASE_DATABASE_URL environment variable is required.');
  process.exit(1);
}

const DRY_RUN = process.env.DRY_RUN !== 'false'; // Default to dry-run unless explicitly set to false

async function askQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => rl.question(query, (ans) => {
    rl.close();
    resolve(ans);
  }));
}

async function runBackup(dbUrl: string, filename: string): Promise<boolean> {
  console.log(`Attempting backup of database to ${filename}...`);
  try {
    execSync(`pg_dump "${dbUrl}" -F c -b -v -f "${filename}"`, { stdio: 'ignore' });
    console.log(`✔ Backup saved successfully to ${filename}`);
    return true;
  } catch (err) {
    console.error(`❌ Backup FAILED for ${filename}: ${err}`);
    return false;
  }
}

async function main() {
  console.log(`===================================================`);
  console.log(` BUKOO DATABASE MIGRATION & ETL PIPELINE (SUPABASE -> NEON)`);
  console.log(` Mode: ${DRY_RUN ? 'DRY-RUN (Safe, no writes)' : 'LIVE MIGRATION (WILL MODIFY NEON DATABASE)'}`);
  console.log(`===================================================\n`);

  if (!DRY_RUN) {
    console.log("Creating database backups before migration...");
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const neonBackupOk = await runBackup(neonDbUrl, `backup-neon-${timestamp}.dump`);
    const supabaseBackupOk = await runBackup(supabaseDbUrl, `backup-supabase-${timestamp}.dump`);
    if (!neonBackupOk || !supabaseBackupOk) {
      console.error("❌ Cannot proceed without successful backups of both databases. Exiting.");
      process.exit(1);
    }
  }

  const supabase = new Client({ connectionString: supabaseDbUrl });
  const neon = new Client({ connectionString: neonDbUrl });

  try {
    await supabase.connect();
    await neon.connect();
    console.log("✔ Connected successfully to both Supabase and Neon databases.\n");

    // 1. Fetch Users
    const { rows: sUsers } = await supabase.query(`SELECT * FROM "User"`);
    const { rows: nUsers } = await neon.query(`SELECT * FROM "User"`);

    console.log(`Supabase Users: ${sUsers.length}`);
    console.log(`Neon Users: ${nUsers.length}`);

    // 2. Detect collisions
    const sUserMap = new Map(sUsers.map(u => [u.email.toLowerCase(), u]));
    const nUserMap = new Map(nUsers.map(u => [u.email.toLowerCase(), u]));

    const emailCollisions: string[] = [];
    const passwordCollisions: string[] = []; // Emails where passwords differ
    const collidingIdMapping = new Map<string, string>(); // SupabaseId -> NeonId for collisions

    for (const sUser of sUsers) {
      const email = sUser.email.toLowerCase();
      const nUser = nUserMap.get(email);
      if (nUser) {
        emailCollisions.push(email);
        collidingIdMapping.set(sUser.id, nUser.id);
        
        // Compare password fields
        // Supabase has passwordHash, Neon has password
        const sHash = sUser.passwordHash || '';
        const nHash = nUser.password || '';
        
        if (sHash !== nHash) {
          passwordCollisions.push(email);
        }
      }
    }

    console.log(`\n--- Collision Analysis ---`);
    console.log(`Total Email Collisions: ${emailCollisions.length}`);
    console.log(`Total Password Collisions (Web wins): ${passwordCollisions.length}`);
    
    if (passwordCollisions.length > 0) {
      console.log(`\n⚠️ The following users exist in both systems with DIFFERENT passwords.`);
      console.log(`Per Single Auth Authority decision, the Web password wins. These users must be prompted to reset passwords on mobile:`);
      passwordCollisions.forEach(email => console.log(`  - ${email}`));
    }

    // Prepare lists of entities to migrate
    const usersToInsert = sUsers.filter(u => !nUserMap.has(u.email.toLowerCase()));
    console.log(`\nNew Users to Migrate from Supabase: ${usersToInsert.length}`);

    if (DRY_RUN) {
      console.log(`\n[DRY RUN] Analysis complete. No changes were made.`);
      console.log(`To run the live migration, set env variable DRY_RUN=false.`);
      return;
    }

    // Live migration confirmation
    const confirm = await askQuestion(`\n⚠️ WARNING: You are about to write to the Neon Database (${neonDbUrl}). Type "CONFIRM" to proceed: `);
    if (confirm !== "CONFIRM") {
      console.log("Migration aborted by user.");
      return;
    }

    console.log("\nStarting migration transaction...");
    await neon.query("BEGIN");

    // 3. Migrate Users (New only)
    for (const u of usersToInsert) {
      const normalizedRole = (u.role || 'USER').trim().toUpperCase();
      await neon.query(
        `INSERT INTO "User" (id, email, name, "password", "avatar", role, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [u.id, u.email, u.name, u.passwordHash, u.avatarUrl, normalizedRole, u.createdAt, u.updatedAt]
      );
    }
    console.log(`✔ Migrated ${usersToInsert.length} new users.`);

    // 4. Populate default Subscription Plans on Neon if missing
    console.log("Populating subscription plans...");
    const { rows: sPlans } = await supabase.query(`SELECT * FROM "SubscriptionPlan"`);
    for (const plan of sPlans) {
      await neon.query(
        `INSERT INTO "SubscriptionPlan" (id, name, "priceMonthly", currency, "trialDays", features, "isPopular", "isActive")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO NOTHING`,
        [plan.id, plan.name, plan.priceMonthly, plan.currency, plan.trialDays, plan.features, plan.isPopular, plan.isActive]
      );
    }
    console.log(`✔ Migrated ${sPlans.length} subscription plans from source data.`);

    // 5. Migrate Subscriptions
    const { rows: sSubscriptions } = await supabase.query(`SELECT * FROM "Subscription"`);
    let migratedSubsCount = 0;
    for (const sub of sSubscriptions) {
      // Remap userId if colliding
      const targetUserId = collidingIdMapping.get(sub.userId) || sub.userId;
      const normalizedStatus = (sub.status || 'ACTIVE').trim().toUpperCase();
      const normalizedGateway = sub.paymentGateway ? sub.paymentGateway.trim().toUpperCase() : null;
      
      await neon.query(
        `INSERT INTO "Subscription" (id, "userId", "planId", status, "trialEndsAt", "currentPeriodStart", "currentPeriodEnd", "cancelAtPeriodEnd", "paymentGateway", "externalSubscriptionId", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT ("userId") DO UPDATE 
         SET "planId" = EXCLUDED."planId", status = EXCLUDED.status, "currentPeriodEnd" = EXCLUDED."currentPeriodEnd"`,
        [sub.id, targetUserId, sub.planId, normalizedStatus, sub.trialEndsAt, sub.currentPeriodStart, sub.currentPeriodEnd, sub.cancelAtPeriodEnd, normalizedGateway, sub.externalSubscriptionId, sub.createdAt, sub.updatedAt]
      );
      migratedSubsCount++;
    }
    console.log(`✔ Migrated ${migratedSubsCount} subscription records.`);

    // 6. Migrate Books with Deduplication logic
    const { rows: sBooks } = await supabase.query(`SELECT * FROM "Book"`);
    const bookDuplicateReport: Array<{supabaseId: string, title: string, matchedNeonId: string, matchType: string}> = [];
    let migratedBooksCount = 0;
    let skippedBooksCount = 0;

    for (const b of sBooks) {
      // Check id or isbn match first (exact duplicate)
      const exactMatch = await neon.query(
        `SELECT id, title FROM "Book" WHERE id = $1 OR (isbn IS NOT NULL AND isbn = $2)`,
        [b.id, b.isbn]
      );
      if (exactMatch.rows.length > 0) {
        bookDuplicateReport.push({ supabaseId: b.id, title: b.title, matchedNeonId: exactMatch.rows[0].id, matchType: 'id_or_isbn' });
        skippedBooksCount++;
        continue;
      }

      // Check normalized title+author match (probable duplicate, needs review)
      const fuzzyMatch = await neon.query(
        `SELECT id, title FROM "Book" WHERE LOWER(TRIM(title)) = LOWER(TRIM($1)) AND LOWER(TRIM(author)) = LOWER(TRIM($2))`,
        [b.title, b.author]
      );
      if (fuzzyMatch.rows.length > 0) {
        bookDuplicateReport.push({ supabaseId: b.id, title: b.title, matchedNeonId: fuzzyMatch.rows[0].id, matchType: 'title_author_fuzzy' });
        skippedBooksCount++;
        continue; // do NOT auto-insert, this needs human review
      }

      const normalizedLanguage = (b.language || 'ID').trim().toUpperCase();
      let normalizedGating = (b.subscriptionRequired || 'FREE').trim().toUpperCase();
      if (normalizedGating === 'PERSONAL') {
        normalizedGating = 'PREMIUM';
      }

      await neon.query(
        `INSERT INTO "Book" (id, title, author, publisher, isbn, synopsis, "coverUrl", genre, tags, language, "publishedYear", "totalPages", "ratingAverage", "ratingCount", "readTimeMinutes", "isPublished", "isAvailableOffline", "subscriptionRequired", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)`,
        [b.id, b.title, b.author, b.publisher, b.isbn, b.synopsis, b.coverUrl, b.genre, b.tags, normalizedLanguage, b.publishedYear, b.totalPages, b.ratingAverage, b.ratingCount, b.readTimeMinutes, b.isPublished, b.isAvailableOffline, normalizedGating, b.createdAt, b.updatedAt]
      );
      migratedBooksCount++;
    }

    console.log(`✔ Migrated ${migratedBooksCount} new books. Skipped ${skippedBooksCount} likely duplicates.`);
    if (bookDuplicateReport.length > 0) {
      fs.writeFileSync(`book-duplicate-report-${Date.now()}.json`, JSON.stringify(bookDuplicateReport, null, 2));
      console.log(`⚠️  Wrote duplicate candidate report. Review this file before assuming the skipped books don't need manual merging (e.g. differing metadata between the two source copies).`);
    }

    // 7. Migrate Reading Progress (with Collision Remapping)
    const { rows: sProgress } = await supabase.query(`SELECT * FROM "ReadingProgress"`);
    let progressMigrated = 0;
    for (const p of sProgress) {
      const targetUserId = collidingIdMapping.get(p.userId) || p.userId;
      
      // Merge Strategy: Check if Neon already has progress for this user + book
      const { rows: existingProgress } = await neon.query(
        `SELECT * FROM "ReadingProgress" WHERE "userId" = $1 AND "bookId" = $2`,
        [targetUserId, p.bookId]
      );

      if (existingProgress.length > 0) {
        // Collision exists. We keep the higher progress percent
        // KNOWN LIMITATION: if a user re-reads a completed book on one platform
        // (progress intentionally resets to a lower value), this merge keeps the
        // old higher progress and ignores the more recent lower one. Acceptable
        // for Phase 1 migration; revisit if re-read tracking becomes a feature.
        const existing = existingProgress[0];
        if (p.progressPercent > (existing.progressPercent || 0)) {
          await neon.query(
            `UPDATE "ReadingProgress"
             SET "progressPercent" = $1, "currentPage" = $2, "totalPages" = $3, "cfiPosition" = $4, "readingTimeMinutes" = $5, "updatedAt" = $6
             WHERE id = $7`,
            [p.progressPercent, p.currentPage, p.totalPages, p.cfiPosition, p.readingTimeMinutes, p.updatedAt, existing.id]
          );
        }
      } else {
        await neon.query(
          `INSERT INTO "ReadingProgress" (id, "userId", "bookId", "progressPercent", "currentPage", "totalPages", "cfiPosition", "readingTimeMinutes", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [p.id, targetUserId, p.bookId, p.progressPercent, p.currentPage, p.totalPages, p.cfiPosition, p.readingTimeMinutes, p.updatedAt]
        );
      }
      progressMigrated++;
    }
    console.log(`✔ Migrated/merged ${progressMigrated} reading progress records.`);

    // 8. Migrate Library Shelves & ShelfBooks
    const { rows: sShelves } = await supabase.query(`SELECT * FROM "LibraryShelf"`);
    const { rows: sShelfBooks } = await supabase.query(`SELECT * FROM "ShelfBook"`);
    
    let shelvesMigrated = 0;
    for (const sh of sShelves) {
      const targetUserId = collidingIdMapping.get(sh.userId) || sh.userId;
      
      // Insert shelf
      await neon.query(
        `INSERT INTO "LibraryShelf" (id, "userId", name, type, slug, "createdAt")
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO NOTHING`,
        [sh.id, targetUserId, sh.name, sh.type, sh.slug, sh.createdAt]
      );
      shelvesMigrated++;
    }
    console.log(`✔ Migrated ${shelvesMigrated} library shelves.`);

    let shelfBooksMigrated = 0;
    for (const sb of sShelfBooks) {
      await neon.query(
        `INSERT INTO "ShelfBook" ("shelfId", "bookId", "addedAt")
         VALUES ($1, $2, $3)
         ON CONFLICT ("shelfId", "bookId") DO NOTHING`,
        [sb.shelfId, sb.bookId, sb.addedAt]
      );
      shelfBooksMigrated++;
    }
    console.log(`✔ Migrated ${shelfBooksMigrated} shelf-book associations.`);

    // 9. Migrate Reading Streaks
    const { rows: sStreaks } = await supabase.query(`SELECT * FROM "ReadingStreak"`);
    let streaksMigrated = 0;
    for (const st of sStreaks) {
      const targetUserId = collidingIdMapping.get(st.userId) || st.userId;
      await neon.query(
        `INSERT INTO "ReadingStreak" (id, "userId", date, "minutesRead", "goalMet")
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT ("userId", date) DO UPDATE 
         SET "minutesRead" = GREATEST("ReadingStreak"."minutesRead", EXCLUDED."minutesRead"), "goalMet" = "ReadingStreak"."goalMet" OR EXCLUDED."goalMet"`,
        [st.id, targetUserId, st.date, st.minutesRead, st.goalMet]
      );
      streaksMigrated++;
    }
    console.log(`✔ Migrated ${streaksMigrated} reading streak logs.`);

    // 10. Migrate Reading Goals
    const { rows: sGoals } = await supabase.query(`SELECT * FROM "ReadingGoal"`);
    let goalsMigrated = 0;
    for (const g of sGoals) {
      const targetUserId = collidingIdMapping.get(g.userId) || g.userId;
      await neon.query(
        `INSERT INTO "ReadingGoal" (id, "userId", "dailyGoalMinutes")
         VALUES ($1, $2, $3)
         ON CONFLICT ("userId") DO NOTHING`,
        [g.id, targetUserId, g.dailyGoalMinutes]
      );
      goalsMigrated++;
    }
    console.log(`✔ Migrated ${goalsMigrated} daily reading goals.`);

    // 11. Migrate Auth Sessions & Device Tokens
    const { rows: sRefreshTokens } = await supabase.query(`SELECT * FROM "RefreshToken"`);
    let refreshTokensMigrated = 0;
    for (const rt of sRefreshTokens) {
      const targetUserId = collidingIdMapping.get(rt.userId) || rt.userId;
      await neon.query(
        `INSERT INTO "RefreshToken" (id, token, "userId", "deviceId", "expiresAt", "revokedAt")
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (token) DO NOTHING`,
        [rt.id, rt.token, targetUserId, rt.deviceId, rt.expiresAt, rt.revokedAt]
      );
      refreshTokensMigrated++;
    }
    console.log(`✔ Migrated ${refreshTokensMigrated} mobile refresh tokens.`);

    const { rows: sDeviceTokens } = await supabase.query(`SELECT * FROM "DeviceToken"`);
    let deviceTokensMigrated = 0;
    for (const dt of sDeviceTokens) {
      const targetUserId = collidingIdMapping.get(dt.userId) || dt.userId;
      await neon.query(
        `INSERT INTO "DeviceToken" (id, "userId", token, platform, "deviceId", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT ("deviceId") DO NOTHING`,
        [dt.id, targetUserId, dt.token, dt.platform, dt.deviceId, dt.updatedAt]
      );
      deviceTokensMigrated++;
    }
    console.log(`✔ Migrated ${deviceTokensMigrated} mobile device push tokens.`);

    console.log("\nCommitting transaction...");
    await neon.query("COMMIT");
    console.log("\n🎉 Database migration finished successfully! All tables consolidated.");

  } catch (error) {
    console.error("\n❌ Error during migration, rolling back changes:", error);
    try {
      await neon.query("ROLLBACK");
    } catch (rbErr) {
      console.error("Rollback failed:", rbErr);
    }
    process.exit(1);
  } finally {
    await supabase.end();
    await neon.end();
  }
}

main().catch(err => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
