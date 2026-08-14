# BUKOO - Feature Specifications & Capabilities

**BUKOO** is a digital reading platform and mobile ecosystem designed for reading, tracking, and engaging with digital books (EPUBs). The platform consists of a mobile app (Expo / React Native), a backend API (NestJS + Prisma + Neon PostgreSQL), a web app (Next.js + NextAuth.js), and shared monorepo packages.

---

## 📱 1. Mobile Application (`apps/mobile`)

### 🔑 Authentication & Session Management
- **Multi-method Login & Registration**: Support for Email/Password credentials and Google OAuth authentication.
- **Persistent Auth & Offline Hydration**: Secure JWT token storage with silent auto-login. Gracefully handles network loss by preserving cached user profiles for offline reading.
- **Custom Logout Dialog**: Dark forest-themed confirmation modal with red glow emblem and styled confirmation actions.

### 📚 Book Discovery & Catalog Navigation
- **Home Screen Dashboard**:
  - Dynamic user greeting header.
  - Interactive search bar pill for quick navigation.
  - Category pill filter funnel for genre browsing (e.g., Self-Improvement, Fiction, Philosophy).
  - Hero Book Banner featuring highlighted titles (e.g. *Atomic Habits*).
  - Trending Books horizontal carousel.
  - Pull-to-refresh support.
- **Search & Catalog Exploration (`SearchScreen`)**:
  - Catalog search by title, author, or ISBN.
  - Filter drawer with genre tags and reading length options.
  - BUKOO Original series carousel.

### 📖 High-Performance EPUB Reader Engine (`ReadingScreen`)
- **Offline & Streamed EPUB Reading**:
  - 100% offline reading support with local asset fallback and streamed EPUB loading for minimal memory footprint on 50MB+ books.
  - Sub-16ms native page turns with tap zone overlays and smooth text selection.
- **Navigation & Search Controls**:
  - **Table of Contents (TOC)**: Hierarchical nested chapters and subchapters with progress indicators (`TocModal`).
  - **In-Book Full-Text Search**: In-book search engine with match count, preview snippets, and instant jump (`SearchModal`).
  - **QuickJump Slider**: Draggable scrubber bar for fast page navigation (`QuickJumpSlider`).
- **Personalization & Typography Settings (`SettingsModal`)**:
  - Debounced font size control.
  - Font family selections (Serif, Sans-serif, Monospace).
  - Theme presets: Day (Light), Sepia (Cream), Night (Dark Forest).
  - Custom line-height and margin spacing adjustments.
  - Persistent settings saved to `AsyncStorage`.
- **Annotations & Highlights (`HighlightModal`)**:
  - Text selection highlights with customizable colors (Yellow, Green, Blue, Pink).
  - Attached note taking on highlights.
  - Highlight manager for reviewing and deleting notes/highlights.
- **Bookmarks & CFI Progress Tracking**:
  - One-tap bookmarking for canonical EPUB CFI locations.
  - Automatic CFI progress sync to cloud.

### 📊 Reading Stats & Library Management (`LibraryScreen`)
- **User Library Overview**:
  - Active book card with real-time percentage progress bar and page count.
  - 3-Card Summary Grid: Completed books count, total reading time, current daily streak.
- **Custom Reading Shelves**: Books organized into system shelves (Finished, Saved, Offline) and custom shelves.

### 🤖 AI Reading Companion (`AiCompanionScreen`)
- **Reading Time Estimation (ETA)**: Calculates estimated remaining time based on current reading speed.
- **Smart Recommendations**: Suggests next reads based on 90%+ completion rates and genre affinity.
- **AI Companion Insight Cards**: Key takeaways and summary points for active titles.

### 👥 Community & Social Features (`CommunityScreen`)
- **Community Feed**: Member activity feed, reviews, and reading updates.
- **"Baca Bareng" Events**: Synchronized group reading challenges and discussions.
- **Active Member Counter**: Real-time counter of active community readers.

### 👤 Profile & Habit Gamification (`ProfileScreen`)
- **Streak Tracker**: Weekly streak calendar bar visualizing daily goal compliance.
- **Reading Goal Setup**: Daily target reading time configurator (e.g., 15 mins/day).
- **Gamified Achievements**: Unlockable badges for reading milestones.

### 💳 Subscription & Tier Access (`SubscriptionScreen`)
- **Tier Selector**: Subscription tiers including FREE, PELAJAR, PERSONAL, PLUS, and FAMILY.
- **Billing Frequency Toggle**: Monthly vs. Annual billing options with dynamic price display.
- **Tier Gating Engine**: Evaluates user tier against book `subscriptionRequired` status.

---

## ⚡ 2. Backend REST API (`apps/api`)

### 🏗️ Architecture & Deployment
- **Framework**: NestJS TypeScript REST API.
- **Deployment**: Containerized Docker build deployed on Railway with automated health monitoring (`/health`).
- **Database**: Neon Serverless PostgreSQL with Prisma ORM.

### 🛡️ Authentication & Authorization (`/v1/auth`)
- **JWT Strategy**: Access Token & Refresh Token rotation.
- **OAuth 2.0 Integration**: Google OAuth token verification.
- **Security**: Password hashing using `bcrypt`, device token tracking, and token revocation.

### 📚 Catalog Management API (`/v1/books`)
- **Book Indexing & Filtering**: Filter by genre, language, published year, and access tier.
- **Full-Text Catalog Search**: Database querying for title, author, and tags.
- **Metadata & Asset Serving**: EPUB file URL resolution and cover image endpoints.

### 🔄 Reading Sync & Annotations API (`/v1/reading`)
- **Progress Synchronization**: `POST /v1/reading/progress` syncs CFI location, percentage, page numbers, and total minutes.
- **Highlights Sync**: CRUD endpoints for CFI range highlights, notes, and colors.
- **Bookmarks API**: Endpoint to save and retrieve bookmarks per user/book.

### 🎯 Goals & Gamification API (`/v1/goals`)
- **Daily Reading Goal API**: Fetch and update daily reading targets.
- **Streak Calculation**: Logs daily reading activity and calculates streak continuity.

---

## 🌐 3. Web Platform (`apps/web`)

### 🏢 Architecture & Deployment
- **Framework**: Next.js (App Router) with React 19.
- **Authentication**: NextAuth.js (Auth.js v5) with Prisma DB Adapter.
- **Deployment**: Deployed on Vercel with preview environment builds.

### 🎨 Marketing & Public Pages
- **Hero & Landing Page**: Modern dark forest UI showcasing platform features and catalog highlights.
- **Pricing Calculator**: Subscription plan pricing breakdown.
- **Information Pages**: Tentang BUKOO, Syarat & Ketentuan, Kebijakan Privasi, Pusat Bantuan, Newsroom, Investor Relations, Karir.

### 📑 Publisher Portal (`/publisher`)
- **Publisher Dashboard**: Read analytics, sales overview, and revenue reports.
- **Book Publishing Workbench**: Interface for uploading EPUB files, setting titles, descriptions, genres, and tier requirements.

### 🛠️ Platform Administration (`/admin`)
- **Admin Dashboard**: Analytics on user signups, reading activity, and subscription trends.
- **User Role Management**: Assign user roles (`USER`, `ADMIN`, `PUBLISHER`, `CONTENT_MANAGER`).
- **Catalog Moderation**: Book review, editing, and publishing toggles.

---

## 📦 4. Shared Packages (`packages/*`)

- **`@bukoo/shared-types`**: Shared domain interfaces (`User`, `Book`, `ReadingProgress`, `Subscription`) and utility helper `isBookAccessible` for consistent tier authorization across web and mobile.
- **`@bukoo/config`**: Monorepo shared ESLint and TypeScript configs.

---

## 🗄️ 5. Database Schema Overview (Prisma / PostgreSQL)

- **`User`**: User accounts, credentials, role, subscription tier, and onboarding status.
- **`Book`**: Catalog entries with EPUB file URLs, metadata, and tier requirements.
- **`ReadingProgress`**: Real-time progress (percentage, current page, CFI position, reading minutes).
- **`Highlight` & `Bookmark`**: Reader annotations indexed by `userId` and `bookId`.
- **`Subscription` & `SubscriptionPlan`**: Active plan details, billing period, and payment gateway metadata.
- **`ReadingGoal` & `ReadingStreak`**: Habit tracking and streak records.
