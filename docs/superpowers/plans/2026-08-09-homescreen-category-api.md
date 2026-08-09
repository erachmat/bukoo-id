# HomeScreen Category API Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect category pill selections on `HomeScreen.tsx` to NestJS genre books API (`GET /books?genre=...`) via `useGenreBooks`.

**Architecture:** Use `useGenreBooks(selectedCategory !== 'Semua' ? selectedCategory : '')` in `HomeScreen.tsx`. Dynamically update section header title and horizontal book carousel data based on selected category.

**Tech Stack:** React Native, Expo, TypeScript, `@tanstack/react-query`.

## Global Constraints

- TypeScript strict mode — no `any` types.
- Follow verification workflow: `npm run typecheck --workspace=apps/mobile`, `npm run lint --workspace=apps/mobile`, `npm run test --workspace=apps/mobile`.

---

### Task 1: Connect Category Pills in `HomeScreen.tsx`

**Files:**
- Modify: [apps/mobile/src/screens/home/HomeScreen.tsx](file:///home/erachmat/Projects/bukoo/apps/mobile/src/screens/home/HomeScreen.tsx)

**Interfaces:**
- Consumes: `useGenreBooks` from `apps/mobile/src/hooks/api/useBooksApi.ts`
- Produces: Dynamic category selection & filtered book carousel on `HomeScreen.tsx`

- [ ] **Step 1: Import `useGenreBooks` and update category state logic in `HomeScreen.tsx`**

```typescript
import { useFeaturedBooks, useGenreBooks } from '../../hooks/api/useBooksApi';

// Inside HomeScreen component:
const { data: categoryBooks } = useGenreBooks(selectedCategory !== 'Semua' ? selectedCategory : '');

const currentSectionTitle = selectedCategory === 'Semua' 
  ? 'Trending Minggu ini🔥' 
  : `Buku ${selectedCategory}`;

const currentBooksData = (selectedCategory !== 'Semua' && categoryBooks && categoryBooks.length > 0)
  ? categoryBooks
  : displayTrending;
```

- [ ] **Step 2: Update category pill selection state check**

Change line 130:
```typescript
const isSelected = selectedCategory === cat;
```

- [ ] **Step 3: Update section title & FlatList data**

Replace section header text with `{currentSectionTitle}` and `FlatList` data with `data={currentBooksData}`.

- [ ] **Step 4: Verify TypeScript & Lint**

Run: `npm run typecheck --workspace=apps/mobile && npm run lint --workspace=apps/mobile`
Expected: PASS with 0 errors.

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/src/screens/home/HomeScreen.tsx
git commit -m "feat(mobile): connect HomeScreen category pills to live genre books API"
```

---

### Task 2: Final Workspaces Verification & Checklist Run

- [ ] **Step 1: Run typecheck**
Run: `npm run typecheck --workspace=apps/mobile`
Expected: PASS with 0 errors.

- [ ] **Step 2: Run lint**
Run: `npm run lint --workspace=apps/mobile`
Expected: PASS with 0 errors.

- [ ] **Step 3: Run test**
Run: `npm run test --workspace=apps/mobile`
Expected: Verified output ("No tests specified for mobile yet").
