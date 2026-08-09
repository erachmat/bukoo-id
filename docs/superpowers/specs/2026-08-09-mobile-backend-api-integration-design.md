# Design Document: Mobile Backend API Integration

**Date**: 2026-08-09  
**Status**: Approved by User  
**Target Workspace**: `@bukoo/mobile` (`apps/mobile`) & `@bukoo/api` (`apps/api`)

---

## 1. Executive Summary

This design defines the end-to-end integration of the Bukoo Mobile Application (`apps/mobile`) with the live NestJS backend API (`apps/api`). The primary goal is to transition the mobile application from a static UI mockup relying on hardcoded JSON arrays to a fully dynamic client powered by React Query (`@tanstack/react-query`) and Axios (`api.ts`).

---

## 2. Architecture & Data Flow

```
[ Mobile UI Screens ]
   (HomeScreen, SearchScreen, LibraryScreen, CommunityScreen)
          │
          ▼
[ Custom React Query Hooks ] (apps/mobile/src/hooks/api/*)
          │
          ▼
[ Axios API Client ] (apps/mobile/src/services/api.ts)
   (Injects Bearer Token, Handles 401 Silent Token Refresh)
          │
          ▼ HTTP / REST
[ NestJS Backend API ] (apps/api/src/*)
   (BooksController, ReadingController, AuthController, UsersController)
          │
          ▼ Prisma ORM
[ Neon PostgreSQL Database ]
```

### Key Technical Principles:
1. **Caching & Stale Time**: Use `@tanstack/react-query` with a default `staleTime` of 5 minutes for book feeds and search results to prevent unnecessary network overhead.
2. **Error Resilience & Fallbacks**: If the backend is unreachable (e.g. offline dev or unseeded local DB), API hooks gracefully fall back to local cached storage or structured fallback states without throwing unhandled UI exceptions.
3. **Environment Dynamic Base URL**: Use `EXPO_PUBLIC_API_URL` (falling back to `http://localhost:3000` or local dev machine IP) so the mobile app seamlessly connects over Wi-Fi or emulator.

---

## 3. Screen Integration Specifications

### 3.1. `HomeScreen.tsx` (Beranda)
- **Data Hook**: `useFeaturedBooks()` in `apps/mobile/src/hooks/api/useBooksApi.ts`
- **Backend Route**: `GET /books/featured`
- **Data Mapping**:
  - `trending` array → **Trending Minggu ini🔥** horizontal carousel
  - `editors_choice` array → **Hero Banner Card** (e.g., Atomic Habits)
  - `continue_reading` array → **Lanjutkan Membaca** card
  - `new_releases` array → **Semua Koleksi** horizontal list

### 3.2. `SearchScreen.tsx` (Jelajahi)
- **Data Hooks**: `useSearchBooks(query)` & `useGenreBooks(genre)`
- **Backend Routes**:
  - `GET /books/search?q=:query` (triggered when query string is non-empty, debounced at 300ms)
  - `GET /books?genre=:genre` (triggered when selecting category pills: `Trending🔥`, `Fiksi`, `Self Dev`, `Teknologi`, `Bisnis`)
- **Data Mapping**:
  - Replaces hardcoded `exploreBooks` and `originalBooks` with live search and category results.

### 3.3. `LibraryScreen.tsx` (Rak Buku)
- **Data Hook**: `useUserLibrary()` in `apps/mobile/src/hooks/api/useLibraryApi.ts`
- **Backend Routes**:
  - `GET /reading/progress` (returns list of user's active/completed books with progress percentages)
  - `GET /users/me/stats` (returns user's reading stats summary: total books read, total hours, current streak)
- **Data Mapping**:
  - Replaces hardcoded **Laut Bercerita** card in "Sedang Dibaca" with user's actual most recently read book.
  - Updates reading statistics summary grid.

### 3.4. `CommunityScreen.tsx` (Komunitas)
- **Data Hook**: `useCommunityPosts()` in `apps/mobile/src/hooks/api/useCommunityApi.ts`
- **Backend Route**: `GET /community/posts` & `POST /community/posts`
- **Data Mapping**:
  - Fetches and displays community discussion feed.
  - Submits new user posts to the community backend endpoint.

---

## 4. File Structure & Component Additions

```
apps/mobile/src/
├── hooks/
│   └── api/
│       ├── useBooksApi.ts
│       ├── useLibraryApi.ts
│       └── useCommunityApi.ts
├── services/
│   ├── api.ts              (Updated with book, library, community API methods)
│   └── booksService.ts     (Encapsulated API calls for book operations)
```

---

## 5. Verification Plan

1. **Type Checking**:
   - `npm run typecheck --workspace=apps/mobile`
2. **Linting**:
   - `npm run lint --workspace=apps/mobile`
3. **Execution & UI Validation**:
   - Run mobile dev client and verify data fetching, loading spinners, error boundaries, and search debounce functionality.
