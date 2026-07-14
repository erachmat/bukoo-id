import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load env from bukoo-web/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL is not set in .env');
  process.exit(1);
}

const client = new Client({ connectionString: dbUrl });

async function run() {
  console.log('Connecting to database...');
  await client.connect();

  console.log('Resetting public schema...');
  await client.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');

  console.log('Applying 0_init migration to create starting table...');
  const initSql = `
    CREATE TABLE "User" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "emailVerified" TIMESTAMP(3),
        "name" TEXT,
        "passwordHash" TEXT,
        "avatarUrl" TEXT,
        "role" TEXT DEFAULT 'USER',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "User_pkey" PRIMARY KEY ("id")
    );
    CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
  `;
  await client.query(initSql);

  console.log('Inserting 8 realistic and dirty test users...');
  const testUsers = [
    { id: 'u1', email: 'u1@example.com', name: 'Standard User', passwordHash: 'hash1', avatarUrl: 'avatar1', role: 'USER' },
    { id: 'u2', email: 'u2@example.com', name: 'Social Login Admin', passwordHash: null, avatarUrl: 'avatar2', role: 'ADMIN' },
    { id: 'u3', email: 'u3@example.com', name: 'No Avatar Content Manager', passwordHash: 'hash3', avatarUrl: null, role: 'CONTENT_MANAGER' },
    { id: 'u4', email: 'u4@example.com', name: 'Publisher', passwordHash: 'hash4', avatarUrl: 'avatar4', role: 'PUBLISHER' },
    { id: 'u5', email: 'u5@example.com', name: 'Lowercase user', passwordHash: 'hash5', avatarUrl: 'avatar5', role: 'user' },
    { id: 'u6', email: 'u6@example.com', name: 'Lowercase admin', passwordHash: 'hash6', avatarUrl: 'avatar6', role: 'admin' },
    { id: 'u7', email: 'u7@example.com', name: 'Null role user', passwordHash: 'hash7', avatarUrl: 'avatar7', role: null },
    { id: 'u8', email: 'u8@example.com', name: 'Visitor unrecognized role', passwordHash: 'hash8', avatarUrl: 'avatar8', role: 'visitor' },
  ];

  for (const user of testUsers) {
    await client.query(
      `INSERT INTO "User" (id, email, name, "passwordHash", "avatarUrl", role) VALUES ($1, $2, $3, $4, $5, $6)`,
      [user.id, user.email, user.name, user.passwordHash, user.avatarUrl, user.role]
    );
  }

  console.log('\n=== USERS BEFORE MIGRATION ===');
  const beforeRes = await client.query('SELECT id, email, name, "passwordHash", "avatarUrl", role FROM "User" ORDER BY id');
  console.table(beforeRes.rows);

  console.log('Reading migration SQL file...');
  const migrationPath = path.join(__dirname, '../prisma/migrations/20260714000000_rename_user_columns/migration.sql');
  const migrationSql = fs.readFileSync(migrationPath, 'utf8');

  console.log('Applying migration SQL script to database...');
  await client.query(migrationSql);
  console.log('✔ Migration applied successfully!');

  console.log('\n=== USERS AFTER MIGRATION ===');
  const afterRes = await client.query('SELECT id, email, name, "password", "avatar", role, "onboardingCompleted" FROM "User" ORDER BY id');
  console.table(afterRes.rows);

  console.log('\n=== DISTINCT ROLES AND COUNT AFTER MIGRATION ===');
  const rolesRes = await client.query('SELECT DISTINCT role, COUNT(*) FROM "User" GROUP BY role');
  console.table(rolesRes.rows);

  await client.end();
  console.log('Done!');
}

run().catch(console.error);
