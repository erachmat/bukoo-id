-- Create enums if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Role') THEN
    CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'CONTENT_MANAGER', 'PUBLISHER');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SubscriptionStatus') THEN
    CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'EXPIRED', 'PENDING_PAYMENT');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentGateway') THEN
    CREATE TYPE "PaymentGateway" AS ENUM ('MIDTRANS', 'XENDIT');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'FileType') THEN
    CREATE TYPE "FileType" AS ENUM ('EPUB', 'PDF');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Language') THEN
    CREATE TYPE "Language" AS ENUM ('ID', 'EN');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ShelfType') THEN
    CREATE TYPE "ShelfType" AS ENUM ('SYSTEM', 'CUSTOM');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'DevicePlatform') THEN
    CREATE TYPE "DevicePlatform" AS ENUM ('ANDROID', 'IOS');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SubscriptionTier') THEN
    CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'BASIC', 'PREMIUM');
  END IF;
END$$;

-- Rename User columns if exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'passwordHash') THEN
    ALTER TABLE "User" RENAME COLUMN "passwordHash" TO "password";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'avatarUrl') THEN
    ALTER TABLE "User" RENAME COLUMN "avatarUrl" TO "avatar";
  END IF;
END$$;
-- Sanitize and cast User role if it is currently text
DO $$
BEGIN
  IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'role') = 'text' THEN
    UPDATE "User"
    SET "role" = 
      CASE 
        WHEN UPPER(TRIM("role")) = 'ADMIN' THEN 'ADMIN'
        WHEN UPPER(TRIM("role")) = 'CONTENT_MANAGER' THEN 'CONTENT_MANAGER'
        WHEN UPPER(TRIM("role")) = 'PUBLISHER' THEN 'PUBLISHER'
        ELSE 'USER'
      END;

    ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
    ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role" USING "role"::"Role";
    ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER';
  END IF;
END$$;

-- Add other missing columns to User
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'onboardingCompleted') THEN
    ALTER TABLE "User" ADD COLUMN "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'updatedAt') THEN
    ALTER TABLE "User" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE "User" ALTER COLUMN "updatedAt" DROP DEFAULT;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'subscriptionTier') THEN
    ALTER TABLE "User" DROP COLUMN "subscriptionTier";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'subscriptionEndsAt') THEN
    ALTER TABLE "User" DROP COLUMN "subscriptionEndsAt";
  END IF;
END$$;

-- Create tables if not exists
CREATE TABLE IF NOT EXISTS "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

CREATE TABLE IF NOT EXISTS "Book" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "publisher" TEXT,
    "description" TEXT,
    "synopsis" TEXT,
    "isbn" TEXT,
    "coverUrl" TEXT,
    "fileUrl" TEXT,
    "fileType" "FileType" NOT NULL DEFAULT 'EPUB',
    "genre" TEXT[],
    "tags" TEXT[],
    "language" "Language" NOT NULL DEFAULT 'ID',
    "year" INTEGER,
    "publishedYear" INTEGER,
    "pageCount" INTEGER,
    "totalPages" INTEGER,
    "readCount" INTEGER NOT NULL DEFAULT 0,
    "ratingAverage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "readTimeMinutes" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isAvailableOffline" BOOLEAN NOT NULL DEFAULT false,
    "subscriptionRequired" "SubscriptionTier" NOT NULL DEFAULT 'FREE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ReadingProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "progressPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currentPage" INTEGER NOT NULL DEFAULT 0,
    "totalPages" INTEGER NOT NULL DEFAULT 0,
    "cfiPosition" TEXT,
    "readingTimeMinutes" INTEGER NOT NULL DEFAULT 0,
    "readingTimeSeconds" INTEGER NOT NULL DEFAULT 0,
    "lastReadAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReadingProgress_pkey" PRIMARY KEY ("id")
);

-- Alter Book columns if it already exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Book' AND column_name = 'synopsis') THEN
    ALTER TABLE "Book" ADD COLUMN "synopsis" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Book' AND column_name = 'isbn') THEN
    ALTER TABLE "Book" ADD COLUMN "isbn" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Book' AND column_name = 'tags') THEN
    ALTER TABLE "Book" ADD COLUMN "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Book' AND column_name = 'publishedYear') THEN
    ALTER TABLE "Book" ADD COLUMN "publishedYear" INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Book' AND column_name = 'totalPages') THEN
    ALTER TABLE "Book" ADD COLUMN "totalPages" INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Book' AND column_name = 'ratingAverage') THEN
    ALTER TABLE "Book" ADD COLUMN "ratingAverage" DOUBLE PRECISION NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Book' AND column_name = 'ratingCount') THEN
    ALTER TABLE "Book" ADD COLUMN "ratingCount" INTEGER NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Book' AND column_name = 'readTimeMinutes') THEN
    ALTER TABLE "Book" ADD COLUMN "readTimeMinutes" INTEGER NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Book' AND column_name = 'isAvailableOffline') THEN
    ALTER TABLE "Book" ADD COLUMN "isAvailableOffline" BOOLEAN NOT NULL DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Book' AND column_name = 'subscriptionRequired') THEN
    ALTER TABLE "Book" ADD COLUMN "subscriptionRequired" "SubscriptionTier" NOT NULL DEFAULT 'FREE';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Book' AND column_name = 'createdAt') THEN
    ALTER TABLE "Book" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Book' AND column_name = 'updatedAt') THEN
    ALTER TABLE "Book" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Book' AND column_name = 'isPremium') THEN
    UPDATE "Book" SET "subscriptionRequired" = CASE WHEN "isPremium" = true THEN 'PREMIUM'::"SubscriptionTier" ELSE 'FREE'::"SubscriptionTier" END;
    ALTER TABLE "Book" DROP COLUMN "isPremium";
  END IF;
END$$;

-- Alter ReadingProgress columns if it already exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ReadingProgress' AND column_name = 'progressPercent') THEN
    ALTER TABLE "ReadingProgress" ADD COLUMN "progressPercent" DOUBLE PRECISION NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ReadingProgress' AND column_name = 'currentPage') THEN
    ALTER TABLE "ReadingProgress" ADD COLUMN "currentPage" INTEGER NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ReadingProgress' AND column_name = 'totalPages') THEN
    ALTER TABLE "ReadingProgress" ADD COLUMN "totalPages" INTEGER NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ReadingProgress' AND column_name = 'cfiPosition') THEN
    ALTER TABLE "ReadingProgress" ADD COLUMN "cfiPosition" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ReadingProgress' AND column_name = 'readingTimeMinutes') THEN
    ALTER TABLE "ReadingProgress" ADD COLUMN "readingTimeMinutes" INTEGER NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ReadingProgress' AND column_name = 'readingTimeSeconds') THEN
    ALTER TABLE "ReadingProgress" ADD COLUMN "readingTimeSeconds" INTEGER NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ReadingProgress' AND column_name = 'lastReadAt') THEN
    ALTER TABLE "ReadingProgress" ADD COLUMN "lastReadAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ReadingProgress' AND column_name = 'progress') THEN
    UPDATE "ReadingProgress" SET "progressPercent" = COALESCE("progress", 0) * 100;
    ALTER TABLE "ReadingProgress" DROP COLUMN "progress";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ReadingProgress' AND column_name = 'location') THEN
    UPDATE "ReadingProgress" SET "cfiPosition" = "location";
    ALTER TABLE "ReadingProgress" DROP COLUMN "location";
  END IF;
END$$;

-- Create rest of target tables
CREATE TABLE IF NOT EXISTS "SubscriptionPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priceMonthly" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'IDR',
    "trialDays" INTEGER NOT NULL DEFAULT 7,
    "features" TEXT[],
    "isPopular" BOOLEAN NOT NULL,
    "isActive" BOOLEAN NOT NULL,

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL,
    "trialEndsAt" TIMESTAMP(3),
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "paymentGateway" "PaymentGateway",
    "externalSubscriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "LibraryShelf" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ShelfType" NOT NULL DEFAULT 'CUSTOM',
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LibraryShelf_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ShelfBook" (
    "shelfId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShelfBook_pkey" PRIMARY KEY ("shelfId","bookId")
);

CREATE TABLE IF NOT EXISTS "RefreshToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "DeviceToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" "DevicePlatform" NOT NULL,
    "deviceId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeviceToken_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ReadingGoal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dailyGoalMinutes" INTEGER NOT NULL DEFAULT 5,

    CONSTRAINT "ReadingGoal_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ReadingStreak" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "minutesRead" INTEGER NOT NULL,
    "goalMet" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ReadingStreak_pkey" PRIMARY KEY ("id")
);

-- Drop Transaction table if exists
DROP TABLE IF EXISTS "Transaction" CASCADE;

-- Create Indexes if not exists
CREATE UNIQUE INDEX IF NOT EXISTS "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");
CREATE UNIQUE INDEX IF NOT EXISTS "Session_sessionToken_key" ON "Session"("sessionToken");
CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_token_key" ON "VerificationToken"("token");
CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");
CREATE UNIQUE INDEX IF NOT EXISTS "Book_isbn_key" ON "Book"("isbn");
CREATE UNIQUE INDEX IF NOT EXISTS "ReadingProgress_userId_bookId_key" ON "ReadingProgress"("userId", "bookId");
CREATE UNIQUE INDEX IF NOT EXISTS "Subscription_userId_key" ON "Subscription"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "RefreshToken_token_key" ON "RefreshToken"("token");
CREATE UNIQUE INDEX IF NOT EXISTS "DeviceToken_deviceId_key" ON "DeviceToken"("deviceId");
CREATE UNIQUE INDEX IF NOT EXISTS "ReadingGoal_userId_key" ON "ReadingGoal"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "ReadingStreak_userId_date_key" ON "ReadingStreak"("userId", "date");

-- Add constraints if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Account_userId_fkey') THEN
    ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Session_userId_fkey') THEN
    ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'ReadingProgress_userId_fkey') THEN
    ALTER TABLE "ReadingProgress" ADD CONSTRAINT "ReadingProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'ReadingProgress_bookId_fkey') THEN
    ALTER TABLE "ReadingProgress" ADD CONSTRAINT "ReadingProgress_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Subscription_userId_fkey') THEN
    ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Subscription_planId_fkey') THEN
    ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'LibraryShelf_userId_fkey') THEN
    ALTER TABLE "LibraryShelf" ADD CONSTRAINT "LibraryShelf_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'ShelfBook_shelfId_fkey') THEN
    ALTER TABLE "ShelfBook" ADD CONSTRAINT "ShelfBook_shelfId_fkey" FOREIGN KEY ("shelfId") REFERENCES "LibraryShelf"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'ShelfBook_bookId_fkey') THEN
    ALTER TABLE "ShelfBook" ADD CONSTRAINT "ShelfBook_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'RefreshToken_userId_fkey') THEN
    ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'DeviceToken_userId_fkey') THEN
    ALTER TABLE "DeviceToken" ADD CONSTRAINT "DeviceToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'ReadingGoal_userId_fkey') THEN
    ALTER TABLE "ReadingGoal" ADD CONSTRAINT "ReadingGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'ReadingStreak_userId_fkey') THEN
    ALTER TABLE "ReadingStreak" ADD CONSTRAINT "ReadingStreak_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END$$;
